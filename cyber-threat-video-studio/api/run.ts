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

const runStep = async (label: string) => {
  await logsApi.create({ message: `${label} started`, type: 'info', timestamp: new Date().toISOString() });
  await delay(300);
  await logsApi.create({ message: `${label} finished`, type: 'success', timestamp: new Date().toISOString() });
};

export const runApi = {
  pipeline: async (input: unknown) =>
    withLogging('pipeline', async () => {
    const parsed = pipelineSchema.parse(input || {});
    usePipelineStore.getState().setStatus('running', 'Pipeline starting');
    await runStep('Outline');
    await runStep('Script');
    await runStep('Media');
    const result = await pipelineExamples.makePipeline();
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr || 'Pipeline complete');
    return { ok: result.ok, stdout: result.stdout, stderr: result.stderr, campaignId: parsed.campaignId };
  }),
  outline: async () => {
    usePipelineStore.getState().setStatus('running', 'Outline');
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_outline.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },
  script: async () => {
    usePipelineStore.getState().setStatus('running', 'Script');
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_script.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },
  media: async () => {
    usePipelineStore.getState().setStatus('running', 'Media');
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_sora_clips.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },
};
