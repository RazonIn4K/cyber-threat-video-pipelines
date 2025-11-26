import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mediaApi } from '../api/media';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import { runApi } from '../api/run';

const ShotlistSync: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['media'], queryFn: mediaApi.list });

  const syncMutation = useMutation({
    mutationFn: runApi.media,
    onSuccess: () => toast.success('Shotlist synced with media pipeline'),
    onError: () => toast.error('Sync failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Shotlist Sync</h1>
          <p className="text-gray-400 text-sm">Review shots, adjust timings, and trigger Sora generation.</p>
        </div>
        <Button onClick={() => syncMutation.mutate({})} loading={syncMutation.isPending}>
          Run Media Sync
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(isLoading ? Array.from({ length: 4 }) : data)?.map((item: any, idx: number) => (
          <Card key={item?.id || idx} className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </>
            ) : (
              <>
                <div className="aspect-video rounded-lg bg-background-softer overflow-hidden relative">
                  <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  <Badge className="absolute top-2 left-2" tone="info">{item.duration || '00:45'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                  <Button variant="ghost" className="text-sm">Align</Button>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <Badge tone="success">Sora ready</Badge>
                  <span>{item.size}</span>
                  <span>{item.generatedAt}</span>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShotlistSync;
