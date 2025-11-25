import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const CampaignDetail = lazy(() => import('./pages/CampaignDetail'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary'));
const Secrets = lazy(() => import('./pages/Secrets'));
const ShotlistSync = lazy(() => import('./pages/ShotlistSync'));
const Timeline = lazy(() => import('./pages/Timeline'));
const LogsPage = lazy(() => import('./pages/LogsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/campaigns" element={<Navigate to="/" replace />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/media" element={<MediaLibrary />} />
              <Route path="/shotlist-sync" element={<ShotlistSync />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/secrets" element={<Secrets />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </Router>
  );
};

export default App;
