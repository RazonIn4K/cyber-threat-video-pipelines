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
    const parsed = logSchema.parse(input);
    const log: ActivityLog = { ...parsed, id: parsed.id ?? crypto.randomUUID() };
    await delay(100);
    useLogsStore.getState().addLog(log);
    return log;
  },
};
