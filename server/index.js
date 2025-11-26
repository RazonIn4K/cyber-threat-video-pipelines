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

const runPython = (campaignId, scriptName, extraArgs = [], simulate = true) =>
  new Promise((resolve) => {
    const campaignPath = path.join(campaignsDir, campaignId);
    const scriptPath = path.join(campaignPath, 'scripts', scriptName);
    const args = [scriptPath, ...(simulate ? ['--simulate'] : []), ...extraArgs];
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

app.get('/campaigns', (req, res) => {
  const entries = readdirSync(campaignsDir).filter((name) => {
    const full = path.join(campaignsDir, name);
    return statSync(full).isDirectory();
  });
  res.json(entries.map((id) => ({ id, name: id, status: 'Unknown', progress: '', lastUpdated: '', type: 'Campaign', description: '' })));
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
  if (!scriptName) return res.status(400).json({ ok: false, error: 'unknown step' });
  const result = await runPython(campaignId, scriptName, [], simulate);
  res.json(result);
});

app.post('/publish', async (req, res) => {
  const { campaignId = defaultCampaign, targetId = 'default' } = req.body || {};
  res.json({ status: 'success', message: `Published ${campaignId} to ${targetId}` });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
