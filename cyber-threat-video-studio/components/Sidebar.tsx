import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Film, FolderOpen, Settings, Lock, Activity, FileText, Database, Clock, Wrench } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Campaigns', icon: FolderOpen, path: '/campaigns' },
    { name: 'Media Library', icon: Film, path: '/media' },
    { name: 'Shotlist Sync', icon: Database, path: '/shotlist-sync' },
    { name: 'Timeline', icon: Activity, path: '/timeline' },
    { name: 'Logs', icon: FileText, path: '/logs' },
    { name: 'Secrets', icon: Lock, path: '/secrets' },
  ];

  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-black font-bold text-xs shadow-[0_0_15px_rgba(13,223,242,0.5)]">
          CTS
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-wide">Cyber Threat</h1>
          <p className="text-gray-400 text-xs">Video Studio</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-background-card text-primary shadow-sm border border-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-border">
        <NavLink to="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Settings size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-400">Settings</span>
        </NavLink>
        <div className="flex items-center gap-3 mt-4 p-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-600">
                <img src="https://picsum.photos/seed/user/100/100" alt="User" />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-white">DevSec Team</span>
                <span className="text-xs text-gray-500">Admin</span>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
