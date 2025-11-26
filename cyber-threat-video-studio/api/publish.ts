import { z } from 'zod';
import { usePublishStore } from '../stores/publishStore';
import { PublishJob, PublishResult, PublishRequest } from '../types';
import { MockApi } from '../services/mockApi';
import { delay } from '../utils/delay';

const publishRequestSchema = z.object({
  campaignId: z.string(),
  targetId: z.string(),
  assets: z.array(z.string()).optional(),
  metadata: z.record(z.string()).optional(),
});

export const publishApi = {
  listTargets: async () => {
    const targets = await MockApi.getPublishTargets();
    usePublishStore.getState().setTargets(targets);
    return targets;
  },

  listJobs: async () => usePublishStore.getState().jobs,

  publish: async (input: unknown): Promise<PublishResult> => {
    const payload = publishRequestSchema.parse(input || {}) as PublishRequest;
    const job: PublishJob = {
      id: crypto.randomUUID(),
      campaignId: payload.campaignId,
      targetId: payload.targetId,
      assets: payload.assets,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    usePublishStore.getState().enqueueJob(job);
    usePublishStore.getState().setStatus('publishing');

    // Simulate network + backend pipeline call
    await delay(250);
    const result = await MockApi.publish(payload);

    usePublishStore.getState().updateJob(job.id, result.status, result.message);
    usePublishStore.getState().setStatus(result.status === 'success' ? 'success' : 'failed', result.message);

    return { id: job.id, status: result.status, message: result.message };
  },
};
