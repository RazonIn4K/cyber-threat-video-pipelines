import { create } from 'zustand';

export type PipelineStage = 'idle' | 'running' | 'success' | 'failed' | 'cancelled';

interface PipelineState {
  status: PipelineStage;
  message?: string;
  abortController: AbortController | null;
  setStatus: (status: PipelineStage, message?: string) => void;
  reset: () => void;
  /**
   * Starts a new run by creating an AbortController.
   * Returns the AbortController for passing signal to API calls.
   */
  startRun: () => AbortController;
  /**
   * Cancels the current run by aborting the controller
   * and setting status to 'cancelled'.
   */
  cancelRun: () => void;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  status: 'idle',
  message: undefined,
  abortController: null,

  setStatus: (status, message) => set({ status, message }),

  reset: () => {
    const { abortController } = get();
    // Abort any in-progress request when resetting
    if (abortController) {
      abortController.abort();
    }
    set({ status: 'idle', message: undefined, abortController: null });
  },

  startRun: () => {
    const { abortController: existingController } = get();
    
    // Abort any existing run before starting a new one
    if (existingController) {
      existingController.abort();
    }

    const newController = new AbortController();
    set({ 
      status: 'running', 
      message: 'Starting...', 
      abortController: newController 
    });
    
    return newController;
  },

  cancelRun: () => {
    const { abortController, status } = get();
    
    // Only cancel if currently running
    if (status === 'running' && abortController) {
      abortController.abort();
      set({ 
        status: 'cancelled', 
        message: 'Run cancelled by user', 
        abortController: null 
      });
    }
  },
}));
