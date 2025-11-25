import { create } from 'zustand';
import { MediaAsset } from '../types';

interface MediaState {
  media: MediaAsset[];
  filter: 'all' | 'video' | 'audio' | 'image';
  search: string;
  setMedia: (data: MediaAsset[]) => void;
  addMedia: (asset: MediaAsset) => void;
  setFilter: (value: MediaState['filter']) => void;
  setSearch: (value: string) => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  media: [],
  filter: 'all',
  search: '',
  setMedia: (data) => set({ media: data }),
  addMedia: (asset) => set((state) => ({ media: [asset, ...state.media] })),
  setFilter: (value) => set({ filter: value }),
  setSearch: (value) => set({ search: value }),
}));
