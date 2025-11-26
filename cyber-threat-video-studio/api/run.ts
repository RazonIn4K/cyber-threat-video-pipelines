import { z } from 'zod';
import { usePipelineStore } from '../stores/pipelineStore';
import { logsApi } from './logs';
import { pipelineExamples } from './commands';
import { delay } from '../utils/delay';
import { withLogging } from '../utils/loggingMiddleware';

const pipelineSchema = z.object({
  campaignId: z.string().optional(),
  steps: z.array(z.string()).optional(),
});

export interface RunOptions {
  campaignId?: string;
  simulate?: boolean;
}

const runStep = async (label: string) => {
  await logsApi.create({ message: `${label} started`, type: 'info', timestamp: new Date().toISOString() });
  await delay(300);
  await logsApi.create({ message: `${label} finished`, type: 'success', timestamp: new Date().toISOString() });
};

const handleFetchError = (error: unknown): { ok: false; stdout: string; stderr: string } => {
  const message = error instanceof Error ? error.message : String(error);
  return { ok: false, stdout: '', stderr: `Network error: ${message}` };
};

export const runApi = {
  pipeline: async (input: unknown) =>
    withLogging('pipeline', async () => {
      const parsed = pipelineSchema.parse(input || {});
      const apiBase = import.meta.env.VITE_API_BASE;
      usePipelineStore.getState().setStatus('running', 'Pipeline starting');

      if (apiBase) {
        const steps: Array<'outline' | 'script' | 'media'> = ['outline', 'script', 'media'];
        let ok = true;
        const options: RunOptions = { campaignId: parsed.campaignId };
        for (const step of steps) {
          const res = await runApi[step](options);
          ok = ok && res.ok;
        }
        usePipelineStore.getState().setStatus(ok ? 'success' : 'failed');
        return { ok, stdout: '', stderr: ok ? '' : 'One or more steps failed', campaignId: parsed.campaignId };
      }

      await runStep('Outline');
      await runStep('Script');
      await runStep('Media');
      const result = await pipelineExamples.makePipeline();
      usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr || 'Pipeline complete');
      return { ok: result.ok, stdout: result.stdout, stderr: result.stderr, campaignId: parsed.campaignId };
    }),
  outline: async (options: RunOptions = {}) => {
    const apiBase = import.meta.env.VITE_API_BASE;
    usePipelineStore.getState().setStatus('running', 'Outline');
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/run/outline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: options.campaignId, simulate: options.simulate }),
        });
        if (!res.ok) {
          const errorData = { ok: false, stdout: '', stderr: `HTTP ${res.status}: ${res.statusText}` };
          usePipelineStore.getState().setStatus('failed', errorData.stderr);
          return errorData;
        }
        const data = await res.json();
        usePipelineStore.getState().setStatus(data.ok ? 'success' : 'failed', data.stderr);
        return data;
      } catch (error) {
        const errorData = handleFetchError(error);
        usePipelineStore.getState().setStatus('failed', errorData.stderr);
        return errorData;
      }
    }
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_outline.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },
  script: async (options: RunOptions = {}) => {
    const apiBase = import.meta.env.VITE_API_BASE;
    usePipelineStore.getState().setStatus('running', 'Script');
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/run/script`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: options.campaignId, simulate: options.simulate }),
        });
        if (!res.ok) {
          const errorData = { ok: false, stdout: '', stderr: `HTTP ${res.status}: ${res.statusText}` };
          usePipelineStore.getState().setStatus('failed', errorData.stderr);
          return errorData;
        }
        const data = await res.json();
        usePipelineStore.getState().setStatus(data.ok ? 'success' : 'failed', data.stderr);
        return data;
      } catch (error) {
        const errorData = handleFetchError(error);
        usePipelineStore.getState().setStatus('failed', errorData.stderr);
        return errorData;
      }
    }
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_script.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },
  media: async (options: RunOptions = {}) => {
    const apiBase = import.meta.env.VITE_API_BASE;
    usePipelineStore.getState().setStatus('running', 'Media');
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/run/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: options.campaignId, simulate: options.simulate }),
        });
        if (!res.ok) {
          const errorData = { ok: false, stdout: '', stderr: `HTTP ${res.status}: ${res.statusText}` };
          usePipelineStore.getState().setStatus('failed', errorData.stderr);
          return errorData;
        }
        const data = await res.json();
        usePipelineStore.getState().setStatus(data.ok ? 'success' : 'failed', data.stderr);
        return data;
      } catch (error) {
        const errorData = handleFetchError(error);
        usePipelineStore.getState().setStatus('failed', errorData.stderr);
        return errorData;
      }
    }
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_sora_clips.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },
};
