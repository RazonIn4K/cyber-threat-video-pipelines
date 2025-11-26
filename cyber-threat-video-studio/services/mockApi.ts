import { Campaign, MediaAsset, SecretConfig, ActivityLog, TimelineEvent, PublishTarget, PublishRequest, PublishResult } from '../types';

// Mock Data
const campaigns: Campaign[] = [
  { id: '1', name: 'shai-hulud-2025', status: 'Completed', progress: 'Variant 3 of 3', lastUpdated: '2 hours ago', type: 'Security Education', description: 'Advanced persistence threat simulation.' },
  { id: '2', name: 'phishing-q1-report', status: 'In Progress', progress: 'Variant 1 of 5', lastUpdated: '15 minutes ago', type: 'Phishing Awareness', description: 'Quarterly phishing analysis video.' },
  { id: '3', name: 'project-overlord-q3', status: 'In Progress', progress: 'Scripting', lastUpdated: '1 day ago', type: 'Insider Threat', description: 'Insider threat detection scenarios.' },
  { id: '4', name: 'phishing-awareness-apac', status: 'Failed', progress: 'Generation Error', lastUpdated: '3 days ago', type: 'Regional Training', description: 'APAC region specific training.' },
  { id: '5', name: 'insider-threat-europe', status: 'Queued', progress: 'Waiting', lastUpdated: '5 days ago', type: 'Compliance', description: 'GDPR compliance video series.' },
];

const mediaAssets: MediaAsset[] = [
  { id: '1', campaignId: '1', title: 'sh_intro_scene_01.mp4', description: 'Introduction - Threat Overview', type: 'Video', size: '15.2 MB', generatedAt: 'Oct 26, 2023', duration: '1:45', thumbnailUrl: 'https://picsum.photos/seed/tech1/400/225' },
  { id: '2', campaignId: '1', title: 'sh_phishing_alert.mp3', description: 'Phishing Alert Voicemail', type: 'Audio', size: '1.8 MB', generatedAt: 'Oct 25, 2023', duration: '0:28', thumbnailUrl: 'https://picsum.photos/seed/audio/400/225' },
  { id: '3', campaignId: '1', title: 'sh_malware_demo_03.mp4', description: 'Malware Demo Walkthrough', type: 'Video', size: '24.5 MB', generatedAt: 'Oct 24, 2023', duration: '2:12', thumbnailUrl: 'https://picsum.photos/seed/server/400/225' },
  { id: '4', campaignId: '2', title: 'phish_email_reveal.mp4', description: 'Email Header Analysis', type: 'Video', size: '12.1 MB', generatedAt: 'Oct 27, 2023', duration: '0:55', thumbnailUrl: 'https://picsum.photos/seed/code/400/225' },
];

const secrets: SecretConfig[] = [
  { id: '1', name: 'Doppler Project: cyber-threat-studio', key: 'dp.pt.xxx', status: 'Loaded', provider: 'Doppler' },
  { id: '2', name: 'Doppler Config: prd_aws_useast1', key: 'dp.ct.xxx', status: 'Loaded', provider: 'Doppler' },
  { id: '3', name: 'GEMINI_API_KEY', key: 'AIzaSy...', status: 'Loaded', maskedValue: '•••••••••••••••••', provider: 'System' },
  { id: '4', name: 'SORA_API_KEY', key: '', status: 'Missing', provider: 'System' },
  { id: '5', name: 'ELEVENLABS_API_KEY', key: 'sk_...', status: 'Loaded', maskedValue: '•••••••••••••••••', provider: 'System' },
];

const logs: ActivityLog[] = [
  { id: '1', message: "ElevenLabs voiceover generated for 'shai-hulud-2025' (Variant 3).", timestamp: '2 minutes ago', type: 'success' },
  { id: '2', message: "Sora 2 media generation started for 'phishing-q1-report'.", timestamp: '15 minutes ago', type: 'info' },
  { id: '3', message: "Gemini script analysis failed for 'internal-threat-drill'.", timestamp: '1 hour ago', type: 'error' },
  { id: '4', message: "New intel documents uploaded successfully.", timestamp: '3 hours ago', type: 'success' },
];

const timeline: TimelineEvent[] = [
    { id: '1', title: 'Initial Access', timestamp: '2024-05-10 08:32 UTC', description: 'Compromised npm package used to gain entry.', icon: 'login', type: 'access' },
    { id: '2', title: 'Credential Harvesting', timestamp: '2024-05-10 09:15 UTC', description: 'Sensitive data extracted from environment variables.', icon: 'key', type: 'credential' },
    { id: '3', title: 'Lateral Movement', timestamp: '2024-05-11 14:00 UTC', description: 'Pivoted to GitHub Actions using stolen tokens.', icon: 'network_check', type: 'movement' },
    { id: '4', title: 'Data Exfiltration', timestamp: '2024-05-12 02:45 UTC', description: 'Stolen credentials and data sent to C2 via webhook.', icon: 'upload_file', type: 'exfiltration' },
];

const publishTargets: PublishTarget[] = [
  { id: 'target-wordpress', name: 'cs-learning.me (WordPress)', type: 'wordpress', url: 'https://cs-learning.me', description: 'Main learning site' },
  { id: 'target-static', name: 'csbrain.ai (Static)', type: 'static-site', url: 'https://csbrain.ai', description: 'Landing + SEO static site' },
  { id: 'target-promptdef', name: 'promptdefenders.com (Static)', type: 'static-site', url: 'https://promptdefenders.com', description: 'Prompt packs + artifacts' },
  { id: 'target-youtube', name: 'YouTube Channel', type: 'youtube', url: 'https://youtube.com/@csbrain', description: 'Video publishing' },
];

export const MockApi = {
  getCampaigns: async () => new Promise<Campaign[]>(resolve => setTimeout(() => resolve(campaigns), 500)),
  getMediaAssets: async () => new Promise<MediaAsset[]>(resolve => setTimeout(() => resolve(mediaAssets), 500)),
  getSecrets: async () => new Promise<SecretConfig[]>(resolve => setTimeout(() => resolve(secrets), 500)),
  getLogs: async () => new Promise<ActivityLog[]>(resolve => setTimeout(() => resolve(logs), 500)),
  getTimeline: async (id: string) => new Promise<TimelineEvent[]>(resolve => setTimeout(() => resolve(timeline), 500)),
  getPublishTargets: async () => new Promise<PublishTarget[]>(resolve => setTimeout(() => resolve(publishTargets), 250)),
  publish: async (input: PublishRequest): Promise<PublishResult> =>
    new Promise((resolve) =>
      setTimeout(() =>
        resolve({ id: crypto.randomUUID(), status: 'success', message: `Published ${input.campaignId} to ${input.targetId}` }),
      400),
    ),
};
