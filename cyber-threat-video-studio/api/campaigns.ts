import { z } from 'zod';
import { delay } from '../utils/delay';
import { useCampaignStore } from '../stores/campaignStore';
import { Campaign } from '../types';

const campaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  status: z.enum(['Active', 'Completed', 'In Progress', 'Failed', 'Queued']).default('Queued'),
  progress: z.string().optional().default(''),
  lastUpdated: z.string().optional().default('just now'),
  type: z.string().optional().default('Security Education'),
  description: z.string().optional().default(''),
});

const initialCampaigns: Campaign[] = [
  { id: '1', name: 'shai-hulud-2025', status: 'Completed', progress: 'Variant 3 of 3', lastUpdated: '2 hours ago', type: 'Security Education', description: 'Advanced persistence threat simulation.' },
  { id: '2', name: 'phishing-q1-report', status: 'In Progress', progress: 'Variant 1 of 5', lastUpdated: '15 minutes ago', type: 'Phishing Awareness', description: 'Quarterly phishing analysis video.' },
];

let hydrated = false;

export const campaignsApi = {
  list: async (): Promise<Campaign[]> => {
    if (!hydrated) {
      useCampaignStore.getState().setCampaigns(initialCampaigns);
      hydrated = true;
    }
    await delay(250);
    const { campaigns, filter, sort } = useCampaignStore.getState();
    let filtered = campaigns;
    if (filter) {
      filtered = campaigns.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()));
    }
    if (sort === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'status') filtered = [...filtered].sort((a, b) => a.status.localeCompare(b.status));
    if (sort === 'updated') filtered = [...filtered];
    return filtered;
  },

  get: async (id: string) => {
    await delay(150);
    const campaign = useCampaignStore.getState().campaigns.find((c) => c.id === id);
    if (!campaign) throw new Error('Campaign not found');
    return campaign;
  },

  create: async (input: Partial<Campaign>): Promise<Campaign> => {
    const parsed = campaignSchema.parse(input || {});
    const campaign: Campaign = {
      id: parsed.id ?? crypto.randomUUID(),
      name: parsed.name,
      status: parsed.status,
      progress: parsed.progress ?? 'Queued',
      lastUpdated: 'just now',
      type: parsed.type ?? 'Security Education',
      description: parsed.description ?? '',
    };
    await delay(200);
    useCampaignStore.getState().addCampaign(campaign);
    return campaign;
  },

  update: async (id: string, input: Partial<Campaign>): Promise<Campaign> => {
    const existing = useCampaignStore.getState().campaigns.find((c) => c.id === id);
    if (!existing) throw new Error('Campaign not found');
    const parsed = campaignSchema.partial().parse(input);
    const updated = { ...existing, ...parsed, lastUpdated: 'just now' };
    await delay(150);
    useCampaignStore.getState().updateCampaign(updated);
    return updated;
  },

  remove: async (id: string) => {
    await delay(120);
    useCampaignStore.getState().deleteCampaign(id);
    return { ok: true };
  },
};
