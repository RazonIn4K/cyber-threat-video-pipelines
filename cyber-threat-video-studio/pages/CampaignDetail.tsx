import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';
import { TimelineEvent } from '../types';
import { Play, FileText, CheckCircle2, Clock, MapPin, Key, Network, Upload, FileCode } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Switch } from '../components/ui/Switch';
import toast from 'react-hot-toast';
import { useLogsStore } from '../stores/logsStore';
import { runApi } from '../api/run';

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [simulate, setSimulate] = useState(true);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.get(id || '1'),
  });

  const timeline: TimelineEvent[] = [
    { id: '1', title: 'Initial Access', timestamp: '2024-05-10 08:32 UTC', description: 'Compromised npm package used to gain entry.', icon: 'login', type: 'access' },
    { id: '2', title: 'Credential Harvesting', timestamp: '2024-05-10 09:15 UTC', description: 'Sensitive data extracted from environment variables.', icon: 'key', type: 'credential' },
    { id: '3', title: 'Lateral Movement', timestamp: '2024-05-11 14:00 UTC', description: 'Pivoted to GitHub Actions using stolen tokens.', icon: 'network_check', type: 'movement' },
  ];

  const { logs, isStreaming, startStreaming, stopStreaming, currentStep } = useLogsStore();

  const orderedLogs = useMemo(() => logs.slice(0, 15), [logs]);

  const handleRun = (step: 'outline' | 'script' | 'shorts' | 'shotlist' | 'audio' | 'sora' | 'media') => {
    if (!id) {
      toast.error('Campaign ID is missing!');
      return;
    }
    startStreaming(step, { campaignId: id, simulate }, (success) => {
      if (success) {
        toast.success(`Step ${step} completed`);
      } else {
        toast.error(`Step ${step} failed`);
      }
    });
  };

  const handleStop = () => {
    stopStreaming();
    toast('Stopped current run');
  };

  const handleFullPipeline = async () => {
    if (!id) {
      toast.error('Campaign ID is missing!');
      return;
    }

    try {
      useLogsStore.getState().addLog({ message: 'Starting full pipeline', type: 'info' });
      const res = await runApi.pipeline({ campaignId: id, simulate });
      if (res.ok) {
        toast.success('Full pipeline completed');
      } else {
        toast.error('Full pipeline failed');
      }
    } catch (error) {
      toast.error('Full pipeline failed');
    }
  };

  if (isLoading || !campaign) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link to="/campaigns" className="hover:text-primary">Campaigns</Link>
                <span>/</span>
                <span className="text-white">{campaign.name}</span>
            </div>
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
                    <span className="bg-status-success/20 text-status-success text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
                        Active
                    </span>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost">Edit Campaign</Button>
                    <Button>Create Video</Button>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border flex gap-8">
             {['Overview', 'Threat Intel', 'Scripts', 'Media'].map((tab) => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
                    className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 ${
                        activeTab === tab.toLowerCase().replace(' ', '-') 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                 >
                     {tab}
                 </button>
             ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Timeline */}
            <div className="col-span-1 space-y-6">
                <div className="bg-background-card border border-border rounded-lg p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Timeline</h2>
                    <div className="relative border-l border-border ml-3 space-y-8">
                        {timeline.map((event, idx) => (
                            <div key={event.id} className="ml-6 relative">
                                <span className="absolute -left-[31px] top-0 flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full ring-8 ring-background-card text-primary">
                                    {event.type === 'access' && <MapPin size={12} />}
                                    {event.type === 'credential' && <Key size={12} />}
                                    {event.type === 'movement' && <Network size={12} />}
                                    {event.type === 'exfiltration' && <Upload size={12} />}
                                </span>
                                <h3 className="text-base font-semibold text-white mb-1">{event.title}</h3>
                                <time className="block mb-2 text-sm text-gray-500 font-mono">{event.timestamp}</time>
                                <p className="text-sm text-gray-400 leading-relaxed">{event.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Dynamic Content based on tab */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
                
                {/* Actions Panel (Always visible in this mock for layout demo) */}
                <Card className="overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Campaign Actions</h2>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-gray-300">Simulate</label>
                          <Switch checked={simulate} onChange={setSimulate} />
                          <Button variant="secondary" size="sm" onClick={handleFullPipeline} disabled={isStreaming}>
                            Run Full Pipeline
                          </Button>
                          {isStreaming && (
                            <Button variant="ghost" size="sm" onClick={handleStop}>Stop</Button>
                          )}
                        </div>
                      </div>
                     <div className="divide-y divide-border">
                        {/* Run Outline */}
                        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" icon={<Play size={16} />} onClick={() => handleRun('outline')} disabled={isStreaming}>
                                    Run Outline
                                </Button>
                                <span className="flex items-center gap-1.5 bg-status-success/10 text-status-success px-2.5 py-1 rounded-full text-xs font-bold">
                                    <CheckCircle2 size={12} /> Completed
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <FileText size={16} />
                                <span className="text-primary hover:underline cursor-pointer">outline.md</span>
                            </div>
                        </div>

                         {/* Run Script */}
                        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" icon={<Play size={16} />} onClick={() => handleRun('script')} disabled={isStreaming}>
                                    Run Script
                                </Button>
                                <span className="flex items-center gap-1.5 bg-status-success/10 text-status-success px-2.5 py-1 rounded-full text-xs font-bold">
                                    <CheckCircle2 size={12} /> Completed
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <FileText size={16} />
                                <span className="text-primary hover:underline cursor-pointer">final-script.docx</span>
                            </div>
                        </div>

                        {/* Run Shorts */}
                        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" icon={<Play size={16} />} onClick={() => handleRun('shorts')} disabled={isStreaming}>
                                    Run Shorts
                                </Button>
                            </div>
                        </div>

                        {/* Run Shotlist */}
                        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" icon={<Play size={16} />} onClick={() => handleRun('shotlist')} disabled={isStreaming}>
                                    Run Shotlist
                                </Button>
                            </div>
                        </div>

                        {/* Run Audio */}
                        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" icon={<Play size={16} />} onClick={() => handleRun('audio')} disabled={isStreaming}>
                                    Run Audio
                                </Button>
                            </div>
                        </div>

                        {/* Run Media (Sora) */}
                        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                             <div className="flex items-center gap-4">
                                <Button variant="ghost" icon={<Play size={16} />} onClick={() => handleRun('sora')} disabled={isStreaming}>
                                    Run Media
                                </Button>
                                {isStreaming && (
                                  <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-bold">
                                      <Clock size={12} className="animate-spin" /> Running {currentStep ?? ''}
                                  </span>
                                )}
                            </div>
                        </div>
                     </div>

                    <div className="border-t border-border bg-background-softer/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">Recent Logs</p>
                        {isStreaming && <span className="text-xs text-primary">Live</span>}
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {orderedLogs.length === 0 && <p className="text-xs text-gray-500">No logs yet.</p>}
                        {orderedLogs.map((log) => (
                          <div key={log.id} className="text-xs text-gray-300">
                            <span className="text-gray-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className={log.type === 'error' || log.type === 'warning' ? 'text-status-warning' : ''}>{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                </Card>

                {/* Threat Intel / Impacted Ecosystem */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Impacted Ecosystem</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-8 h-8 rounded bg-red-900/50 flex items-center justify-center text-red-500 font-bold text-xs">NPM</div>
                                <span className="text-gray-300">npm</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                    <FileCode size={16} className="text-white" />
                                </div>
                                <span className="text-gray-300">GitHub Actions</span>
                            </div>
                             <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xs">AWS</div>
                                <span className="text-gray-300">AWS</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Data Stolen</h2>
                         <div className="flex flex-wrap gap-2">
                             {['Environment Variables', 'IMDS Credentials', 'npm Tokens', 'GitHub Tokens'].map(tag => (
                                 <span key={tag} className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                     tag.includes('Tokens') ? 'bg-status-warning/10 text-status-warning' : 'bg-status-error/10 text-status-error'
                                 }`}>
                                     {tag}
                                 </span>
                             ))}
                         </div>
                    </Card>
                </div>

            </div>
        </div>
    </div>
  );
};

export default CampaignDetail;
