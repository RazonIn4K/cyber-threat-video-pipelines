import { z } from 'zod';
import { useLogsStore } from '../stores/logsStore';
import { ActivityLog } from '../types';
import { delay } from '../utils/delay';

const logSchema = z.object({
  id: z.string().optional(),
  message: z.string(),
  timestamp: z.string().default(new Date().toISOString()),
  type: z.enum(['success', 'info', 'error', 'warning']),
});

const seedLogs: ActivityLog[] = [
  { id: '1', message: "ElevenLabs voiceover generated for 'shai-hulud-2025' (Variant 3).", timestamp: '2 minutes ago', type: 'success' },
  { id: '2', message: "Sora 2 media generation started for 'phishing-q1-report'.", timestamp: '15 minutes ago', type: 'info' },
  { id: '3', message: "Gemini script analysis failed for 'internal-threat-drill'.", timestamp: '1 hour ago', type: 'error' },
  { id: '4', message: "New intel documents uploaded successfully.", timestamp: '3 hours ago', type: 'success' },
];

let hydrated = false;

export const logsApi = {
  list: async (): Promise<ActivityLog[]> => {
    if (!hydrated) {
      useLogsStore.getState().setLogs(seedLogs);
      hydrated = true;
    }
    await delay(200);
    const { logs, filter } = useLogsStore.getState();
    if (filter === 'all') return logs;
    return logs.filter((l) => l.type === filter);
  },
  create: async (input: Partial<ActivityLog>): Promise<ActivityLog> => {
    const parsed = logSchema.parse(input || {});
    const log: ActivityLog = {
      id: parsed.id ?? crypto.randomUUID(),
      message: parsed.message,
      timestamp: parsed.timestamp,
      type: parsed.type,
    };
    await delay(100);
    useLogsStore.getState().addLog(log);
    return log;
  },
};

// SSE message types from the server
export interface SSEMessage {
  type: 'connected' | 'stdout' | 'stderr' | 'complete' | 'error';
  text?: string;
  message?: string;
  exitCode?: number;
  success?: boolean;
  step?: string;
  campaignId?: string;
  simulate?: boolean;
}

export interface StreamOptions {
  campaignId?: string;
  simulate?: boolean;
}

export interface StreamCallbacks {
  onLog: (text: string, type: 'stdout' | 'stderr') => void;
  onComplete: (exitCode: number, success: boolean) => void;
  onError: (error: Error) => void;
  onConnected?: (info: { step: string; campaignId: string; simulate: boolean }) => void;
}

/**
 * Connect to SSE stream for real-time pipeline execution feedback
 * @param step - Pipeline step to run (outline, script, shorts, shotlist, audio, sora, media)
 * @param options - Stream options including campaignId and simulate flag
 * @param callbacks - Callback functions for handling stream events
 * @returns Cleanup function to close the EventSource connection
 */
export function streamPipelineRun(
  step: string,
  options: StreamOptions,
  callbacks: StreamCallbacks
): () => void {
  const apiBase = import.meta.env.VITE_API_BASE || '';
  const params = new URLSearchParams();
  
  if (options.campaignId) {
    params.set('campaignId', options.campaignId);
  }
  if (options.simulate !== undefined) {
    params.set('simulate', String(options.simulate));
  }
  
  const url = `${apiBase}/run/${step}/stream?${params}`;
  const eventSource = new EventSource(url);
  
  eventSource.onmessage = (event) => {
    try {
      const data: SSEMessage = JSON.parse(event.data);
      
      switch (data.type) {
        case 'connected':
          if (callbacks.onConnected && data.step && data.campaignId !== undefined) {
            callbacks.onConnected({
              step: data.step,
              campaignId: data.campaignId,
              simulate: data.simulate ?? false,
            });
          }
          break;
          
        case 'stdout':
          if (data.text) {
            callbacks.onLog(data.text, 'stdout');
          }
          break;
          
        case 'stderr':
          if (data.text) {
            callbacks.onLog(data.text, 'stderr');
          }
          break;
          
        case 'complete':
          callbacks.onComplete(data.exitCode ?? 0, data.success ?? (data.exitCode === 0));
          eventSource.close();
          break;
          
        case 'error':
          callbacks.onError(new Error(data.message || 'Unknown error'));
          eventSource.close();
          break;
      }
    } catch (parseError) {
      console.error('Failed to parse SSE message:', parseError, event.data);
    }
  };
  
  eventSource.onerror = (event) => {
    // EventSource error events don't provide much detail
    console.error('EventSource error:', event);
    callbacks.onError(new Error('SSE connection failed or was closed'));
    eventSource.close();
  };
  
  // Return cleanup function
  return () => {
    eventSource.close();
  };
}
