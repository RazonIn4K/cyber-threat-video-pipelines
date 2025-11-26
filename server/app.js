import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';
import { readdirSync, statSync, existsSync } from 'fs';
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
};

const runPython = (campaignId, scriptName, extraArgs = []) =>
  new Promise((resolve) => {
    const campaignPath = path.join(campaignsDir, campaignId);
    const scriptPath = path.join(campaignPath, 'scripts', scriptName);
    const args = [scriptPath, ...extraArgs];
    const child = spawn('python3', args, { cwd: campaignPath });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('close', (code) => resolve({ ok: code === 0, stdout, stderr, code }));
    child.on('error', (err) => resolve({ ok: false, stdout, stderr: String(err), code: -1 }));
  });

app.get('/health', (req, res) => {
  res.json({ ok: true, repoRoot });
});

const getCampaignStatus = (campaignId) => {
  const campaignPath = path.join(campaignsDir, campaignId);
  const dataDir = path.join(campaignPath, 'data', 'processed');
  const audioDir = path.join(campaignPath, 'audio');
  const videoDir = path.join(campaignPath, 'video');

  const steps = [
    { name: 'outline', file: path.join(dataDir, 'outline.json') },
    { name: 'script', file: path.join(dataDir, 'script-longform.md') },
    { name: 'shorts', file: path.join(dataDir, 'shorts-scripts.md') },
    { name: 'shotlist', file: path.join(dataDir, 'shotlist.json') },
    { name: 'audio', file: path.join(audioDir, 'voiceover.mp3') },
    { name: 'video', file: path.join(videoDir) },
  ];

  const completedSteps = steps.filter((step) => {
    if (step.name === 'video') {
      return existsSync(step.file) && readdirSync(step.file).some((f) => f.endsWith('.mp4'));
    }
    return existsSync(step.file);
  });

  const progress = Math.round((completedSteps.length / steps.length) * 100);
  const status = progress === 100 ? 'Complete' : progress > 0 ? 'In Progress' : 'Not Started';

  return { status, progress };
};

app.get('/campaigns', (req, res) => {
  const entries = readdirSync(campaignsDir).filter((name) => {
    const full = path.join(campaignsDir, name);
    return statSync(full).isDirectory();
  });

  const campaigns = entries.map((id) => {
    const { status, progress } = getCampaignStatus(id);
    return { id, name: id, status, progress, lastUpdated: '', type: 'Campaign', description: '' };
  });

  res.json(campaigns);
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

app.get('/media/:campaignId/:type/:filename', (req, res) => {
  const { campaignId, type, filename } = req.params;
  const campaignPath = path.join(campaignsDir, campaignId);
  const mediaPath = path.join(campaignPath, type, filename);

  // Path Traversal Mitigation
  const resolvedPath = path.resolve(mediaPath);
  if (!resolvedPath.startsWith(path.resolve(campaignPath))) {
    return res.status(403).send('Forbidden');
  }

  if (existsSync(resolvedPath)) {
    res.sendFile(resolvedPath);
  } else {
    res.status(404).send('File not found');
  }
});

app.post('/run/:step', async (req, res) => {
  const step = req.params.step;
  const { campaignId = defaultCampaign, simulate = false } = req.body;
  const scriptName = stepToScript[step];
  if (!scriptName) return res.status(400).json({ ok: false, error: 'unknown step' });

  const extraArgs = simulate ? ['--simulate'] : [];
  const result = await runPython(campaignId, scriptName, extraArgs);
  res.json(result);
});

import { google } from 'googleapis';
import { mkdirSync, copyFileSync, createReadStream } from 'fs';

app.post('/publish', async (req, res) => {
  const { campaignId = defaultCampaign, targetId = 'default' } = req.body || {};
  const campaignPath = path.join(campaignsDir, campaignId);
  const videoDir = path.join(campaignPath, 'video');
  const dataDir = path.join(campaignPath, 'data', 'processed');

  try {
    const videoFiles = readdirSync(videoDir).filter((f) => f.endsWith('.mp4'));
    if (videoFiles.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No video found to publish' });
    }
    const videoFile = path.join(videoDir, videoFiles[0]); // Publish the first video found
    const scriptFile = path.join(dataDir, 'script-longform.md');

    console.log(`Publishing video: ${videoFile}`);
    console.log(`With script: ${scriptFile}`);

    // Placeholder for YouTube API integration
    // const auth = new google.auth.GoogleAuth({
    //   scopes: ['https://www.googleapis.com/auth/youtube.upload'],
    //   keyFile: 'path/to/your/credentials.json'
    // });
    // const youtube = google.youtube({ version: 'v3', auth });
    // const response = await youtube.videos.insert({
    //   part: 'snippet,status',
    //   requestBody: {
    //     snippet: {
    //       title: `Cyber Threat Report: ${campaignId}`,
    //       description: existsSync(scriptFile) ? readFileSync(scriptFile, 'utf8') : 'No description available',
    //     },
    //     status: {
    //       privacyStatus: 'private',
    //     },
    //   },
    //   media: {
    //     body: createReadStream(videoFile),
    //   },
    // });
    // console.log(response.data);

    res.json({ status: 'success', message: `Published ${campaignId} to YouTube (placeholder)` });
  } catch (error) {
    console.error('Failed to publish to YouTube', error);
    res.status(500).json({ status: 'error', message: 'Failed to publish', error: error.message });
  }
});

export default app;
