import React from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const crumbs = location.pathname.split('/').filter(Boolean);
  const newCampaign = useMutation({
    mutationFn: () =>
      campaignsApi.create({
        name: `campaign-${crypto.randomUUID().slice(0, 4)}`,
        status: 'Queued',
        progress: 'Queued',
      }),
    onSuccess: () => toast.success('Campaign created'),
    onError: () => toast.error('Failed to create'),
  });
  return (
    <div className="min-h-screen bg-background flex text-gray-100 font-sans">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <nav className="flex items-center gap-2 text-sm text-gray-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary">Home</Link>
            {crumbs.map((c, idx) => (
              <React.Fragment key={idx}>
                <span>/</span>
                <span className="text-white capitalize">{c}</span>
              </React.Fragment>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-background-card border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-primary/50 w-64 transition-all"
              />
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-gray-400 relative" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            </button>
            <Button icon={<Plus size={16} />} className="hidden md:inline-flex" onClick={() => newCampaign.mutate()} loading={newCampaign.isPending}>
              New Campaign
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
