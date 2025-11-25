import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { secretsApi } from '../api/secrets';
import { useSecretsStore } from '../stores/secretsStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['secrets'], queryFn: secretsApi.list });
  const mutation = useMutation({
    mutationFn: (id: string) => secretsApi.updateStatus(id, 'Loaded'),
    onSuccess: () => {
      toast.success('Secret marked as loaded');
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-400">Manage system config, secrets, and preferences.</p>
        </div>
        <Button variant="ghost" onClick={() => refetch()}>Reload</Button>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Secrets</h3>
          <Button variant="primary" onClick={() => toast('Connect Doppler soon')}>
            Connect Doppler
          </Button>
        </div>
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading && data?.map((secret) => (
          <div key={secret.id} className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
            <div>
              <p className="text-sm text-white">{secret.name}</p>
              <p className="text-xs text-gray-500">{secret.provider}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={secret.status === 'Loaded' ? 'success' : secret.status === 'Missing' ? 'error' : 'warning'}>
                {secret.status}
              </Badge>
              {secret.status !== 'Loaded' && (
                <Button variant="ghost" onClick={() => mutation.mutate(secret.id)} loading={mutation.isLoading}>
                  Mark Loaded
                </Button>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default SettingsPage;
