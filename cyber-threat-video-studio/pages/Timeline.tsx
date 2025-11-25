import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';

const productionEvents = [
  { id: 'p1', title: 'Outline ready', ts: '2025-11-25 09:00 UTC', status: 'success' },
  { id: 'p2', title: 'Script approved', ts: '2025-11-25 10:30 UTC', status: 'success' },
  { id: 'p3', title: 'Voiceover rendering', ts: '2025-11-25 11:00 UTC', status: 'info' },
];

const threatEvents = [
  { id: 't1', title: 'Initial Access', ts: '2025-11-20 02:15 UTC', status: 'warning' },
  { id: 't2', title: 'Credential Harvesting', ts: '2025-11-20 03:10 UTC', status: 'error' },
  { id: 't3', title: 'C2 Callback', ts: '2025-11-20 04:00 UTC', status: 'warning' },
];

const Timeline: React.FC = () => {
  const { data: campaigns, isLoading } = useQuery({ queryKey: ['campaigns'], queryFn: campaignsApi.list });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dual Timeline</h1>
        <p className="text-gray-400 text-sm">Threat events on top, production milestones below.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-3">Threat Timeline</h3>
          <div className="space-y-3">
            {threatEvents.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3">
                <div className="mt-1">
                  <Badge tone={ev.status === 'error' ? 'error' : 'warning'}>{ev.status}</Badge>
                </div>
                <div>
                  <p className="text-white font-medium">{ev.title}</p>
                  <p className="text-xs text-gray-400">{ev.ts}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-3">Production Timeline</h3>
          <div className="space-y-3">
            {productionEvents.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3">
                <div className="mt-1">
                  <Badge tone={ev.status === 'success' ? 'success' : 'info'}>{ev.status}</Badge>
                </div>
                <div>
                  <p className="text-white font-medium">{ev.title}</p>
                  <p className="text-xs text-gray-400">{ev.ts}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-3">Campaign Timeline Overlay</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-20 w-full rounded-lg" />)}
          {!isLoading &&
            campaigns?.map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-background-softer border border-border/60">
                <p className="text-white font-semibold">{c.name}</p>
                <p className="text-xs text-gray-400">{c.status}</p>
                <p className="text-xs text-gray-400">{c.progress}</p>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

export default Timeline;
