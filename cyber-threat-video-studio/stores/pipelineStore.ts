import { create } from 'zustand';

export type PipelineStage = 'idle' | 'running' | 'success' | 'failed';

interface PipelineState {
  status: PipelineStage;
  message?: string;
  setStatus: (status: PipelineStage, message?: string) => void;
  reset: () => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  status: 'idle',
  message: undefined,
  setStatus: (status, message) => set({ status, message }),
  reset: () => set({ status: 'idle', message: undefined }),
}));
