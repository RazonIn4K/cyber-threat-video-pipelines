import React from 'react';
import { ArrowUp, ArrowDown, CheckCircle2, XCircle, Activity, Play, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';
import { logsApi } from '../api/logs';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { runApi } from '../api/run';
import toast from 'react-hot-toast';
import { useCampaignStore } from '../stores/campaignStore';

const Dashboard: React.FC = () => {
  const { setSort, sort } = useCampaignStore();
  const { data: campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = useQuery({ queryKey: ['campaigns'], queryFn: campaignsApi.list });
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({ queryKey: ['logs'], queryFn: logsApi.list });

  const pipelineMutation = useMutation({
    mutationFn: () => runApi.pipeline({}),
    onSuccess: () => {
      toast.success('Pipeline triggered');
      refetchLogs();
    },
    onError: () => toast.error('Pipeline failed to start'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.remove(id),
    onSuccess: () => {
      toast.success('Campaign deleted');
      refetchCampaigns();
    },
  });

  const stats = [
    { label: 'Active Campaigns', value: '5', change: '+2% from last week', trend: 'up', color: 'text-status-success' },
    { label: 'Recent Pipeline Runs', value: '32', change: '-5% from last week', trend: 'down', color: 'text-status-error' },
    { label: 'Media Assets', value: '128', change: '+10% from last week', trend: 'up', color: 'text-status-success' },
    { label: 'API Status', value: 'Online', sub: 'All systems operational', type: 'status', color: 'text-status-success' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, DevSec Team! Here is your system overview.</p>
        </div>
        <Button icon={<Play size={16} />} onClick={() => pipelineMutation.mutate()} loading={pipelineMutation.isPending}>
          Run Pipeline
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="hover:border-primary/50 transition-colors group">
            <p className="text-gray-400 text-sm font-medium mb-2">{stat.label}</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {stat.type === 'status' && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success"></span>
                  </span>
                )}
                <span className="text-3xl font-bold text-white group-hover:text-primary transition-colors">{stat.value}</span>
              </div>
              <p className={`text-xs font-medium ${stat.color} flex items-center gap-1`}>
                {stat.sub || stat.change}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Campaigns Table */}
        <div className="lg:col-span-2 bg-background-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white">Active Campaigns</h3>
                    <p className="text-sm text-gray-400 mt-1">A list of all ongoing video generation campaigns.</p>
                </div>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value as any); refetchCampaigns(); }}
                  className="bg-background-softer text-gray-200 border border-border rounded-lg px-3 py-1 text-sm"
                  aria-label="Sort campaigns"
                >
                  <option value="name">Sort: Name</option>
                  <option value="status">Sort: Status</option>
                  <option value="updated">Sort: Updated</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-background-softer text-xs text-gray-400 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4 text-left">Campaign Name</th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th className="px-6 py-4 text-left">Progress</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {campaignsLoading && Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                            <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-6 ml-auto" /></td>
                          </tr>
                        ))}
                        {!campaignsLoading && campaigns?.map((camp) => (
                            <tr key={camp.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <Link to={`/campaigns/${camp.id}`} className="font-medium text-white hover:text-primary transition-colors block">
                                        {camp.name}
                                    </Link>
                                    <span className="text-xs text-gray-500">{camp.type}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            camp.status === 'Completed' ? 'bg-status-success' :
                                            camp.status === 'In Progress' ? 'bg-status-warning' :
                                            camp.status === 'Failed' ? 'bg-status-error' : 'bg-gray-500'
                                        }`}></div>
                                        <span className="text-sm text-gray-300">{camp.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">{camp.progress}%</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button variant="ghost" className="!p-2" icon={<MoreHorizontal size={18} />} aria-label="Edit" />
                                    <Button variant="danger" className="!p-2" onClick={() => deleteMutation.mutate(camp.id)} aria-label="Delete">
                                      x
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-background-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-border pb-4">Recent Activity</h3>
            <div className="space-y-6">
                {logsLoading && Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-12 w-full" />)}
                {!logsLoading && logs?.map((log) => (
                    <div key={log.id} className="flex gap-4 group">
                        <div className="mt-1">
                            {log.type === 'success' && <CheckCircle2 size={18} className="text-status-success" />}
                            {log.type === 'error' && <XCircle size={18} className="text-status-error" />}
                            {log.type === 'info' && <Activity size={18} className="text-status-warning" />}
                        </div>
                        <div>
                            <p className="text-sm text-gray-200 group-hover:text-primary transition-colors">{log.message}</p>
                            <span className="text-xs text-gray-500 mt-1 block">{log.timestamp}</span>
                        </div>
                    </div>
                ))}
            </div>
             <button className="w-full mt-6 py-2 text-sm text-gray-400 hover:text-white border border-border rounded-lg hover:bg-white/5 transition-all">
                View All Logs
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
