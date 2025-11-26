import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';
import { readdirSync, statSync, existsSync, readFileSync } from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const repoRoot = path.resolve(path.join(process.cwd(), '..'));
const campaignsDir = path.join(repoRoot, 'campaigns');
const defaultCampaign = 'shai-hulud-2025';

const stepToScript = {
  outline: 'generate_outline.py',
  script: 'generate_script.py',
  shorts: 'generate_shorts.py',
  shotlist: 'generate_shotlist.py',
  audio: 'generate_audio.py',
  sora: 'generate_sora_clips.py',
  media: 'generate_sora_clips.py',
};

// Pipeline steps for progress calculation
const pipelineSteps = ['outline', 'script', 'shorts', 'shotlist', 'audio', 'sora'];

/**
 * Infer campaign status and progress from files in data/processed/, audio/, and video/
 */
const inferCampaignStatus = (campaignPath) => {
  const processedDir = path.join(campaignPath, 'data', 'processed');
  const audioDir = path.join(campaignPath, 'audio');
  const videoDir = path.join(campaignPath, 'video');

  // Check which pipeline steps have outputs
  const completedSteps = {
    outline: false,
    script: false,
    shorts: false,
    shotlist: false,
    audio: false,
    sora: false,
  };

  // Check processed directory for text-based outputs
  if (existsSync(processedDir)) {
    try {
      const processedFiles = readdirSync(processedDir);
      
      // Outline: outline.json or outline-*.json
      completedSteps.outline = processedFiles.some(f =>
        f === 'outline.json' || f.match(/^outline-.*\.json$/)
      );
      
      // Script: script-longform.md or script*.md
      completedSteps.script = processedFiles.some(f =>
        f === 'script-longform.md' || f.match(/^script.*\.md$/)
      );
      
      // Shorts: shorts.json or shorts*.json or shorts*.md
      completedSteps.shorts = processedFiles.some(f =>
        f.match(/^shorts.*\.(json|md)$/)
      );
      
      // Shotlist: shotlist.json or shotlist*.json
      completedSteps.shotlist = processedFiles.some(f =>
        f.match(/^shotlist.*\.json$/)
      );
    } catch (err) {
      // Ignore errors reading processed directory
    }
  }

  // Check audio directory (excluding .gitkeep)
  if (existsSync(audioDir)) {
    try {
      const audioFiles = readdirSync(audioDir).filter(f =>
        f !== '.gitkeep' && statSync(path.join(audioDir, f)).isFile()
      );
      completedSteps.audio = audioFiles.length > 0;
    } catch (err) {
      // Ignore errors
    }
  }

  // Check video directory (excluding .gitkeep)
  if (existsSync(videoDir)) {
    try {
      const videoFiles = readdirSync(videoDir).filter(f =>
        f !== '.gitkeep' && statSync(path.join(videoDir, f)).isFile()
      );
      completedSteps.sora = videoFiles.length > 0;
    } catch (err) {
      // Ignore errors
    }
  }

  // Calculate progress percentage
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progress = Math.round((completedCount / pipelineSteps.length) * 100);

  // Infer status based on what's completed
  let status = 'Draft';
  if (completedSteps.audio || completedSteps.sora) {
    status = 'Media Generated';
  } else if (completedSteps.script || completedSteps.shorts || completedSteps.shotlist) {
    status = 'Scripted';
  } else if (completedSteps.outline) {
    status = 'Outlined';
  }

  return { status, progress, completedSteps };
};

/**
 * Parse README.md to extract description (first paragraph after title)
 */
const parseReadmeDescription = (campaignPath) => {
  const readmePath = path.join(campaignPath, 'README.md');
  if (!existsSync(readmePath)) {
    return '';
  }

  try {
    const content = readFileSync(readmePath, 'utf-8');
    const lines = content.split('\n');
    
    // Skip title line(s) and empty lines, get first paragraph
    let foundTitle = false;
    let descriptionLines = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip title lines (starting with #)
      if (trimmed.startsWith('#')) {
        foundTitle = true;
        continue;
      }
      
      // Skip empty lines before first paragraph
      if (!foundTitle || (descriptionLines.length === 0 && trimmed === '')) {
        continue;
      }
      
      // Stop at next empty line after we've started collecting
      if (descriptionLines.length > 0 && trimmed === '') {
        break;
      }
      
      // Collect description lines
      descriptionLines.push(trimmed);
    }
    
    return descriptionLines.join(' ').trim();
  } catch (err) {
    return '';
  }
};

/**
 * Get last updated time for a campaign based on most recent file modification
 */
const getLastUpdated = (campaignPath) => {
  try {
    const processedDir = path.join(campaignPath, 'data', 'processed');
    if (!existsSync(processedDir)) {
      return '';
    }
    
    const files = readdirSync(processedDir).filter(f => f !== '.gitkeep');
    if (files.length === 0) {
      return '';
    }
    
    let latestTime = 0;
    for (const file of files) {
      const filePath = path.join(processedDir, file);
      const stat = statSync(filePath);
      if (stat.mtime.getTime() > latestTime) {
        latestTime = stat.mtime.getTime();
      }
    }
    
    return latestTime > 0 ? new Date(latestTime).toISOString() : '';
  } catch (err) {
    return '';
  }
};

/**
 * Runs a Python script for a campaign step.
 * Returns an object with { ok, stdout, stderr, code, proc } where proc is the child process
 * that can be killed if needed.
 */
const runPython = (campaignId, scriptName, extraArgs = [], simulate = true) => {
  const campaignPath = path.join(campaignsDir, campaignId);
  const scriptPath = path.join(campaignPath, 'scripts', scriptName);
  const args = [scriptPath, ...(simulate ? ['--simulate'] : []), ...extraArgs];
  const child = spawn('python3', args, { cwd: campaignPath });

  let stdout = '';
  let stderr = '';
  
  child.stdout.on('data', (d) => (stdout += d.toString()));
  child.stderr.on('data', (d) => (stderr += d.toString()));

  const promise = new Promise((resolve) => {
    child.on('close', (code) => resolve({ ok: code === 0, stdout, stderr, code }));
    child.on('error', (err) => resolve({ ok: false, stdout, stderr: String(err), code: -1 }));
  });

  // Return both the promise and the process for potential abortion
  return { promise, proc: child };
};

app.get('/health', (req, res) => {
  res.json({ ok: true, repoRoot });
});

app.get('/campaigns', (req, res) => {
  const entries = readdirSync(campaignsDir).filter((name) => {
    const full = path.join(campaignsDir, name);
    return statSync(full).isDirectory();
  });
  
  const campaigns = entries.map((id) => {
    const campaignPath = path.join(campaignsDir, id);
    const { status, progress } = inferCampaignStatus(campaignPath);
    const description = parseReadmeDescription(campaignPath);
    const lastUpdated = getLastUpdated(campaignPath);
    
    return {
      id,
      name: id,
      status,
      progress: `${progress}%`,
      lastUpdated,
      type: 'Campaign',
      description,
    };
  });
  
  res.json(campaigns);
});

// Enhanced single campaign endpoint
app.get('/campaigns/:id', (req, res) => {
  const id = req.params.id;
  const campaignPath = path.join(campaignsDir, id);
  
  if (!existsSync(campaignPath) || !statSync(campaignPath).isDirectory()) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  const { status, progress, completedSteps } = inferCampaignStatus(campaignPath);
  const description = parseReadmeDescription(campaignPath);
  const lastUpdated = getLastUpdated(campaignPath);
  
  // List files in data/processed
  const processedDir = path.join(campaignPath, 'data', 'processed');
  let processedFiles = [];
  if (existsSync(processedDir)) {
    try {
      processedFiles = readdirSync(processedDir).filter(f => f !== '.gitkeep');
    } catch (err) {
      // Ignore errors
    }
  }
  
  res.json({
    id,
    name: id,
    status,
    progress: `${progress}%`,
    lastUpdated,
    type: 'Campaign',
    description,
    pipelineSteps: completedSteps,
    processedFiles,
  });
});

// Validation endpoint
app.get('/campaigns/:id/validate', (req, res) => {
  const id = req.params.id;
  const campaignPath = path.join(campaignsDir, id);
  const issues = [];
  
  if (!existsSync(campaignPath) || !statSync(campaignPath).isDirectory()) {
    return res.status(404).json({ valid: false, issues: ['Campaign not found'] });
  }
  
  // Check for .env file
  const envPath = path.join(campaignPath, '.env');
  const envExamplePath = path.join(campaignPath, '.env.example');
  if (!existsSync(envPath)) {
    if (existsSync(envExamplePath)) {
      issues.push('.env file missing - copy from .env.example and configure');
    } else {
      issues.push('.env file missing - no .env.example template found');
    }
  }
  
  // Check for docs/ directory with intel files
  const docsDir = path.join(campaignPath, 'docs');
  if (!existsSync(docsDir)) {
    issues.push('docs/ directory missing');
  } else {
    try {
      const docFiles = readdirSync(docsDir).filter(f =>
        f !== '.gitkeep' && statSync(path.join(docsDir, f)).isFile()
      );
      if (docFiles.length === 0) {
        issues.push('docs/ directory has no intel files');
      }
    } catch (err) {
      issues.push('Unable to read docs/ directory');
    }
  }
  
  // Check for prompts/ directory with prompt templates
  const promptsDir = path.join(campaignPath, 'prompts');
  if (!existsSync(promptsDir)) {
    issues.push('prompts/ directory missing');
  } else {
    try {
      const promptFiles = readdirSync(promptsDir).filter(f =>
        f.endsWith('.md') && statSync(path.join(promptsDir, f)).isFile()
      );
      if (promptFiles.length === 0) {
        issues.push('prompts/ directory has no .md prompt templates');
      }
    } catch (err) {
      issues.push('Unable to read prompts/ directory');
    }
  }
  
  // Check for scripts/ directory
  const scriptsDir = path.join(campaignPath, 'scripts');
  if (!existsSync(scriptsDir)) {
    issues.push('scripts/ directory missing');
  }
  
  // Check for data/raw/ directory
  const rawDir = path.join(campaignPath, 'data', 'raw');
  if (!existsSync(rawDir)) {
    issues.push('data/raw/ directory missing');
  }
  
  res.json({
    valid: issues.length === 0,
    issues,
    campaignPath,
  });
});

app.get('/campaigns/:id/media', (req, res) => {
  const id = req.params.id || defaultCampaign;
  const base = path.join(campaignsDir, id);
  const audioDir = path.join(base, 'audio');
  const videoDir = path.join(base, 'video');
  const listFiles = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => statSync(path.join(dir, f)).isFile()) : []);
  res.json({
    audio: listFiles(audioDir),
    video: listFiles(videoDir),
  });
});

app.post('/run/:step', async (req, res) => {
  const step = req.params.step;
  const campaignId = req.body?.campaignId || defaultCampaign;
  const simulateEnv = process.env.SIMULATE !== 'false';
  const simulate = typeof req.body?.simulate === 'boolean' ? req.body.simulate : simulateEnv;
  const scriptName = stepToScript[step];
  
  if (!scriptName) {
    return res.status(400).json({ ok: false, error: 'unknown step' });
  }

  const { promise, proc } = runPython(campaignId, scriptName, [], simulate);
  
  // Track if client disconnected
  let clientDisconnected = false;
  
  // Handle client disconnect - kill the Python process
  req.on('close', () => {
    if (!res.headersSent) {
      clientDisconnected = true;
      if (!proc.killed) {
        proc.kill('SIGTERM');
        // If SIGTERM doesn't work, force kill after 2 seconds
        setTimeout(() => {
          if (!proc.killed) {
            proc.kill('SIGKILL');
          }
        }, 2000);
      }
    }
  });

  const result = await promise;
  
  // Only send response if client is still connected
  if (!clientDisconnected) {
    res.json(result);
  }
});

// SSE streaming endpoint for real-time pipeline execution feedback
app.get('/run/:step/stream', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { step } = req.params;
  const { campaignId = defaultCampaign, simulate } = req.query;
  
  // Validate step
  const scriptName = stepToScript[step];
  if (!scriptName) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: `Invalid step: ${step}` })}\n\n`);
    return res.end();
  }
  
  // Determine simulation mode
  const simulateEnv = process.env.SIMULATE !== 'false';
  const shouldSimulate = simulate === 'true' || (simulate === undefined && simulateEnv);
  
  // Get campaign path and script path
  const campaignPath = path.join(campaignsDir, campaignId);
  const scriptPath = path.join(campaignPath, 'scripts', scriptName);
  
  // Check if campaign exists
  if (!existsSync(campaignPath)) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: `Campaign not found: ${campaignId}` })}\n\n`);
    return res.end();
  }
  
  // Build arguments
  const args = [scriptPath];
  if (shouldSimulate) {
    args.push('--simulate');
  }
  
  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', step, campaignId, simulate: shouldSimulate })}\n\n`);
  
  // Spawn Python process
  const proc = spawn('python3', args, {
    cwd: campaignPath,
    env: process.env
  });
  
  // Stream stdout
  proc.stdout.on('data', (data) => {
    const text = data.toString();
    // Split by newlines to send individual log lines
    const lines = text.split('\n').filter(line => line.trim());
    for (const line of lines) {
      res.write(`data: ${JSON.stringify({ type: 'stdout', text: line })}\n\n`);
    }
  });
  
  // Stream stderr
  proc.stderr.on('data', (data) => {
    const text = data.toString();
    const lines = text.split('\n').filter(line => line.trim());
    for (const line of lines) {
      res.write(`data: ${JSON.stringify({ type: 'stderr', text: line })}\n\n`);
    }
  });
  
  // Handle completion
  proc.on('close', (code) => {
    res.write(`data: ${JSON.stringify({ type: 'complete', exitCode: code, success: code === 0 })}\n\n`);
    res.end();
  });
  
  // Handle process error
  proc.on('error', (err) => {
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  });
  
  // Handle client disconnect
  req.on('close', () => {
    proc.kill();
  });
});

app.post('/publish', async (req, res) => {
  const { campaignId = defaultCampaign, targetId = 'default' } = req.body || {};
  res.json({ status: 'success', message: `Published ${campaignId} to ${targetId}` });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
