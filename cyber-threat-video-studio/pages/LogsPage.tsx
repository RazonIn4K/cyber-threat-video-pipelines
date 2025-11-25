import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { logsApi } from '../api/logs';
import { useLogsStore } from '../stores/logsStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

const filters: Array<{ value: any; label: string; tone?: any }> = [
  { value: 'all', label: 'All' },
  { value: 'success', label: 'Success', tone: 'success' },
  { value: 'info', label: 'Info', tone: 'info' },
  { value: 'warning', label: 'Warnings', tone: 'warning' },
  { value: 'error', label: 'Errors', tone: 'error' },
];

const LogsPage: React.FC = () => {
  const { filter, setFilter } = useLogsStore();
  const { data, isLoading, refetch } = useQuery({ queryKey: ['logs', filter], queryFn: logsApi.list });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Logs</h1>
          <p className="text-gray-400 text-sm">Pipeline and system events with filtering.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}>Refresh</Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Button key={f.value} variant={filter === f.value ? 'primary' : 'ghost'} onClick={() => setFilter(f.value as any)}>
            {f.label}
          </Button>
        ))}
      </div>

      <Card className="space-y-3">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading &&
          data?.map((log) => (
            <div key={log.id} className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0">
              <Badge tone={log.type as any} className="capitalize">{log.type}</Badge>
              <div>
                <p className="text-sm text-white">{log.message}</p>
                <p className="text-xs text-gray-500">{log.timestamp}</p>
              </div>
            </div>
          ))}
      </Card>
    </div>
  );
};

export default LogsPage;
