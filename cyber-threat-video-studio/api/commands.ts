import { spawn } from 'child_process';

export interface CommandResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

export const safeSpawn = async (cmd: string, args: string[]): Promise<CommandResult> =>
  new Promise((resolve) => {
    try {
      const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk) => (stdout += chunk.toString()));
      child.stderr.on('data', (chunk) => (stderr += chunk.toString()));
      child.on('close', (code) => {
        resolve({ ok: code === 0, stdout, stderr });
      });
    } catch (error) {
      resolve({ ok: false, stdout: '', stderr: String(error) });
    }
  });

export const pipelineExamples = {
  doppler: () => safeSpawn('doppler', ['run', '--project', 'local-mac-work', '--config', 'dev_personal', '--', 'echo', 'pipeline']),
  makePipeline: () => safeSpawn('make', ['pipeline']),
  pythonScript: (path: string) => safeSpawn('python3', [path, '--dry-run']),
};
