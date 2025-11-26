export type Status = 'Active' | 'Completed' | 'In Progress' | 'Failed' | 'Queued';

export interface Campaign {
  id: string;
  name: string;
  status: Status;
  progress: string; // e.g., "Variant 3 of 3"
  lastUpdated: string;
  type: string;
  description: string;
}

export interface MediaAsset {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  type: 'Video' | 'Audio' | 'Image';
  size: string;
  generatedAt: string;
  duration?: string;
  thumbnailUrl: string;
}

export interface SecretConfig {
  id: string;
  name: string;
  key: string;
  status: 'Loaded' | 'Missing' | 'Error';
  maskedValue?: string;
  provider: 'Doppler' | 'AWS' | 'System';
}

export interface ActivityLog {
  id: string;
  message: string;
  timestamp: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  icon: string;
  type: 'access' | 'credential' | 'movement' | 'exfiltration' | 'impact';
}

export type PublishStatus = 'idle' | 'queued' | 'publishing' | 'success' | 'failed';

export interface PublishTarget {
  id: string;
  name: string;
  type: 'wordpress' | 'static-site' | 'youtube' | 'other';
  url: string;
  description?: string;
}

export interface PublishJob {
  id: string;
  campaignId: string;
  targetId: string;
  status: PublishStatus;
  message?: string;
  createdAt: string;
  assets?: string[];
}

export interface PublishRequest {
  campaignId: string;
  targetId: string;
  assets?: string[];
  metadata?: Record<string, string>;
}

export interface PublishResult {
  id: string;
  status: PublishStatus;
  message?: string;
}
