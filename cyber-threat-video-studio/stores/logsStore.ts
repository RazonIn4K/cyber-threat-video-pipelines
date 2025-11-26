import { create } from 'zustand';
import { ActivityLog } from '../types';
import { streamPipelineRun, StreamOptions } from '../api/logs';

type Filter = 'all' | 'success' | 'info' | 'error' | 'warning';

export interface RunOptions extends StreamOptions {
  campaignId?: string;
  simulate?: boolean;
}

interface LogsState {
  logs: ActivityLog[];
  filter: Filter;
  isStreaming: boolean;
  currentStep: string | null;
  currentRunCleanup: (() => void) | null;
  
  // Basic log operations
  setLogs: (data: ActivityLog[]) => void;
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => void;
  setFilter: (value: Filter) => void;
  clearLogs: () => void;
  
  // SSE streaming operations
  startStreaming: (step: string, options: RunOptions, onComplete?: (success: boolean) => void) => void;
  stopStreaming: () => void;
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: [],
  filter: 'all',
  isStreaming: false,
  currentStep: null,
  currentRunCleanup: null,
  
  setLogs: (data) => set({ logs: data }),
  
  addLog: (logInput) => {
    const log: ActivityLog = {
      id: logInput.id ?? crypto.randomUUID(),
      timestamp: logInput.timestamp ?? new Date().toISOString(),
      message: logInput.message,
      type: logInput.type,
    };
    set((state) => ({ logs: [log, ...state.logs].slice(0, 500) }));
  },
  
  setFilter: (value) => set({ filter: value }),
  
  clearLogs: () => set({ logs: [] }),
  
  startStreaming: (step, options, onComplete) => {
    const state = get();
    
    // Stop any existing stream
    if (state.currentRunCleanup) {
      state.currentRunCleanup();
    }
    
    // Add initial log
    get().addLog({
      message: `Starting pipeline step: ${step}${options.simulate ? ' (simulation mode)' : ''}`,
      type: 'info',
    });
    
    set({
      isStreaming: true,
      currentStep: step,
    });
    
    const cleanup = streamPipelineRun(
      step,
      options,
      {
        onConnected: (info) => {
          get().addLog({
            message: `Connected to ${info.step} stream for campaign: ${info.campaignId}`,
            type: 'info',
          });
        },
        
        onLog: (text, type) => {
          get().addLog({
            message: text,
            type: type === 'stderr' ? 'warning' : 'info',
          });
        },
        
        onComplete: (exitCode, success) => {
          get().addLog({
            message: `Pipeline step "${step}" ${success ? 'completed successfully' : `failed with exit code ${exitCode}`}`,
            type: success ? 'success' : 'error',
          });
          
          set({
            isStreaming: false,
            currentStep: null,
            currentRunCleanup: null,
          });
          
          if (onComplete) {
            onComplete(success);
          }
        },
        
        onError: (error) => {
          get().addLog({
            message: `Pipeline error: ${error.message}`,
            type: 'error',
          });
          
          set({
            isStreaming: false,
            currentStep: null,
            currentRunCleanup: null,
          });
          
          if (onComplete) {
            onComplete(false);
          }
        },
      }
    );
    
    set({ currentRunCleanup: cleanup });
  },
  
  stopStreaming: () => {
    const state = get();
    
    if (state.currentRunCleanup) {
      state.currentRunCleanup();
      
      get().addLog({
        message: `Pipeline step "${state.currentStep}" was stopped`,
        type: 'warning',
      });
    }
    
    set({
      isStreaming: false,
      currentStep: null,
      currentRunCleanup: null,
    });
  },
}));
