import { create } from 'zustand';
import { PublishJob, PublishStatus, PublishTarget } from '../types';

interface PublishState {
  status: PublishStatus;
  lastError?: string;
  targets: PublishTarget[];
  jobs: PublishJob[];
  setStatus: (status: PublishStatus, lastError?: string) => void;
  setTargets: (targets: PublishTarget[]) => void;
  enqueueJob: (job: PublishJob) => void;
  updateJob: (id: string, status: PublishStatus, message?: string) => void;
  reset: () => void;
}

export const usePublishStore = create<PublishState>((set) => ({
  status: 'idle',
  lastError: undefined,
  targets: [],
  jobs: [],
  setStatus: (status, lastError) => set({ status, lastError }),
  setTargets: (targets) => set({ targets }),
  enqueueJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
  updateJob: (id, status, message) =>
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === id ? { ...job, status, message } : job)),
    })),
  reset: () => set({ status: 'idle', lastError: undefined, jobs: [] }),
}));
