import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Campaign } from '../types';

type SortKey = 'name' | 'status' | 'updated';

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaignId?: string;
  filter: string;
  sort: SortKey;
  setCampaigns: (data: Campaign[]) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (campaign: Campaign) => void;
  deleteCampaign: (id: string) => void;
  selectCampaign: (id?: string) => void;
  setFilter: (value: string) => void;
  setSort: (value: SortKey) => void;
}

export const useCampaignStore = create<CampaignState>()(
  devtools(
    persist(
      (set) => ({
        campaigns: [],
        filter: '',
        sort: 'name',
        setCampaigns: (data) => set({ campaigns: data }),
        addCampaign: (campaign) =>
          set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
        updateCampaign: (campaign) =>
          set((state) => ({
            campaigns: state.campaigns.map((c) => (c.id === campaign.id ? campaign : c)),
          })),
        deleteCampaign: (id) =>
          set((state) => ({ campaigns: state.campaigns.filter((c) => c.id !== id) })),
        selectCampaign: (id) => set({ selectedCampaignId: id }),
        setFilter: (value) => set({ filter: value }),
        setSort: (value) => set({ sort: value }),
      }),
      { name: 'campaign-store' }
    )
  )
);
