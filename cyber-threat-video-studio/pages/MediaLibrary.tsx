import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { mediaApi } from '../api/media';
import { useMediaStore } from '../stores/mediaStore';
import { Search, Grid, List, Download, RefreshCw, MoreVertical, Play, Music, Upload, Film, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

const Modal = ({ asset, onClose, campaignId }) => {
  if (!asset) return null;
  const assetUrl = `/api/media/${campaignId}/${asset.type.toLowerCase()}/${asset.title}`;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background-card p-4 rounded-lg max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white"><X /></button>
        {asset.type === 'Audio' ? (
          <audio controls autoPlay src={assetUrl} className="w-full">Your browser does not support the audio element.</audio>
        ) : (
          <video controls autoPlay src={assetUrl} className="w-full">Your browser does not support the video tag.</video>
        )}
      </div>
    </div>
  );
};

const MediaLibrary: React.FC = () => {
  const { id: campaignId } = useParams();
  const { filter, setFilter, setSearch, search } = useMediaStore();
  const { data: assets, isLoading, refetch } = useQuery({ queryKey: ['media', campaignId], queryFn: () => mediaApi.list(campaignId) });
  const [selectedAsset, setSelectedAsset] = useState(null);

  const filteredAssets = assets?.filter((asset) => {
    const matchesFilter = filter === 'all' || asset.type.toLowerCase() === filter;
    const matchesSearch = !search || asset.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
    <Modal asset={selectedAsset} onClose={() => setSelectedAsset(null)} campaignId={campaignId} />
    <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white">Media Library</h1>
                <p className="text-gray-400 mt-1">Manage all audio and video assets produced per campaign.</p>
            </div>
            <Button variant="primary" icon={<Upload size={18} />} onClick={() => toast('Upload coming soon')}>
                Upload Asset
            </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-background-card border border-border rounded-xl p-4 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
                <select className="bg-primary/20 text-primary border-none rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none">
                    <option>Campaign: shai-hulud-2025</option>
                    <option>All Campaigns</option>
                </select>
                <select
                  className="bg-background-softer text-gray-200 border border-border rounded-lg px-3 py-1.5 text-sm font-medium focus:border-primary outline-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                >
                    <option value="all">All Types</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="image">Image</option>
                </select>
                <select className="bg-background-softer text-gray-200 border border-border rounded-lg px-3 py-1.5 text-sm font-medium focus:border-primary outline-none">
                    <option>Generation Date</option>
                    <option>Newest First</option>
                </select>
            </div>

            <div className="flex items-center gap-4 flex-1 lg:justify-end">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search assets..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-background-softer border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm text-gray-200 focus:border-primary outline-none transition-colors"
                    />
                </div>
                <div className="flex bg-background-softer rounded-lg p-1 border border-border">
                    <button className="p-1.5 bg-background-card rounded text-white shadow-sm"><Grid size={16} /></button>
                    <button className="p-1.5 text-gray-500 hover:text-white transition-colors"><List size={16} /></button>
                </div>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
            {!isLoading && filteredAssets?.map((asset) => (
                <div key={asset.id} className="group bg-background-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(13,223,242,0.1)]">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-black group-hover:opacity-90 transition-opacity">
                        <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover opacity-80" loading="lazy" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                            <button onClick={() => setSelectedAsset(asset)} className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center text-black transform scale-90 group-hover:scale-100 transition-transform">
                                <Play size={24} fill="currentColor" className="ml-1" />
                            </button>
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded">
                            {asset.duration}
                        </span>
                        <div className="absolute top-2 left-2">
                             {asset.type === 'Video' && <Film size={16} className="text-gray-300" />}
                             {asset.type === 'Audio' && <Music size={16} className="text-gray-300" />}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                        <div className="mb-4">
                            <h3 className="font-bold text-white truncate text-base" title={asset.title}>{asset.title}</h3>
                            <p className="text-sm text-gray-500 truncate">{asset.description}</p>
                        </div>

                        <div className="mt-auto space-y-2 text-xs text-gray-400">
                             <div className="flex justify-between">
                                 <span>Type:</span>
                                 <span className="text-gray-200">{asset.type}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span>Size:</span>
                                 <span className="text-gray-200">{asset.size}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span>Generated:</span>
                                 <span className="text-gray-200">{asset.generatedAt}</span>
                             </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                            <div className="flex gap-1">
                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-primary transition-colors" aria-label="Download">
                                    <Download size={16} />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-primary transition-colors" onClick={() => refetch()} aria-label="Refresh">
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                             <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Placeholder Empty State */}
            <div className="bg-background-card/50 border border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 text-center hover:border-primary/30 transition-colors group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <Download size={24} className="text-gray-500 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-gray-400 font-medium group-hover:text-white transition-colors">Drop assets here</h3>
                <p className="text-xs text-gray-600 mt-1">or click to upload</p>
            </div>
        </div>
    </div>
  );
};

export default MediaLibrary;
