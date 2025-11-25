import { create } from 'zustand';
import { ActivityLog } from '../types';

type Filter = 'all' | 'success' | 'info' | 'error' | 'warning';

interface LogsState {
  logs: ActivityLog[];
  filter: Filter;
  setLogs: (data: ActivityLog[]) => void;
  addLog: (log: ActivityLog) => void;
  setFilter: (value: Filter) => void;
}

export const useLogsStore = create<LogsState>((set) => ({
  logs: [],
  filter: 'all',
  setLogs: (data) => set({ logs: data }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs].slice(0, 200) })),
  setFilter: (value) => set({ filter: value }),
}));
