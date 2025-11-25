import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { secretsApi } from '../api/secrets';
import { CheckCircle2, XCircle, RefreshCw, Save, Server, Key, Terminal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const Secrets: React.FC = () => {
  const { data: secrets, isLoading, refetch } = useQuery({ queryKey: ['secrets'], queryFn: secretsApi.list });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Secrets & Configuration</h1>
            <p className="text-gray-400">Manage API keys and environment variables required for the video generation pipeline. Synced with Doppler.</p>
        </div>

        <div className="bg-background-card border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
                {isLoading && Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-16 w-full" />)}
                {!isLoading && secrets?.map((secret) => (
                    <div key={secret.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                                {secret.provider === 'Doppler' && <Server size={20} />}
                                {secret.provider === 'System' && <Key size={20} />}
                                {secret.provider === 'AWS' && <Terminal size={20} />}
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-white">{secret.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    {secret.status === 'Loaded' ? (
                                        <>
                                            <CheckCircle2 size={14} className="text-status-success" />
                                            <span className="text-sm text-gray-500">
                                                {secret.status} {secret.maskedValue && `• Value: ${secret.maskedValue}`}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={14} className="text-status-error" />
                                            <span className="text-sm text-status-error font-medium">{secret.status}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={() => toast('Status check will call Doppler soon')}>
                            Check Status
                        </Button>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-background-softer border-t border-border flex justify-end gap-3">
                 <Button variant="ghost" icon={<RefreshCw size={16} />} onClick={() => refetch()}>
                    Sync with Doppler
                </Button>
                 <Button icon={<Save size={16} />} onClick={() => toast('Config saved (placeholder)')}>
                    Save Configuration
                </Button>
            </div>
        </div>
    </div>
  );
};

export default Secrets;
