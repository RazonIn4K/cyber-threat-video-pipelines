import { z } from 'zod';
import { useMediaStore } from '../stores/mediaStore';
import { MediaAsset } from '../types';
import { delay } from '../utils/delay';

const mediaSchema = z.object({
  id: z.string().optional(),
  campaignId: z.string(),
  title: z.string(),
  description: z.string().optional().default(''),
  type: z.enum(['Video', 'Audio', 'Image']),
  size: z.string().optional().default('0 MB'),
  generatedAt: z.string().optional().default('just now'),
  duration: z.string().optional(),
  thumbnailUrl: z.string().url().optional().default('https://picsum.photos/seed/media/400/225'),
});

const seedMedia: MediaAsset[] = [
  { id: '1', campaignId: '1', title: 'sh_intro_scene_01.mp4', description: 'Introduction - Threat Overview', type: 'Video', size: '15.2 MB', generatedAt: 'Oct 26, 2025', duration: '1:45', thumbnailUrl: 'https://picsum.photos/seed/tech1/400/225' },
  { id: '2', campaignId: '1', title: 'sh_phishing_alert.mp3', description: 'Phishing Alert Voicemail', type: 'Audio', size: '1.8 MB', generatedAt: 'Oct 25, 2025', duration: '0:28', thumbnailUrl: 'https://picsum.photos/seed/audio/400/225' },
];

let hydrated = false;

export const mediaApi = {
  list: async (campaignId: string): Promise<MediaAsset[]> => {
    const apiBase = import.meta.env.VITE_API_BASE || '/api';
    const res = await fetch(`${apiBase}/campaigns/${campaignId}/media`);
    if (!res.ok) throw new Error('Failed to fetch media');
    const data = await res.json();

    const assets = [
      ...data.audio.map(file => ({ id: file, title: file, type: 'Audio', thumbnailUrl: 'https://picsum.photos/seed/audio/400/225' })),
      ...data.video.map(file => ({ id: file, title: file, type: 'Video', thumbnailUrl: 'https://picsum.photos/seed/video/400/225' })),
    ];
    return assets;
  },

  get: async (campaignId: string, id: string) => {
    // This is not used in the media library, but could be useful for a detail page
    const assets = await mediaApi.list(campaignId);
    return assets.find(a => a.id === id) || null;
  },

  create: async (input: Partial<MediaAsset>): Promise<MediaAsset> => {
    const parsed = mediaSchema.parse(input || {});
    const asset: MediaAsset = {
      id: parsed.id ?? crypto.randomUUID(),
      campaignId: parsed.campaignId,
      title: parsed.title,
      description: parsed.description,
      type: parsed.type,
      size: parsed.size,
      generatedAt: parsed.generatedAt,
      duration: parsed.duration,
      thumbnailUrl: parsed.thumbnailUrl,
    };
    await delay(200);
    useMediaStore.getState().addMedia(asset);
    return asset;
  },
};
