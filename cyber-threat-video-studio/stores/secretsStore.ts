import { create } from 'zustand';
import { SecretConfig } from '../types';

interface SecretsState {
  secrets: SecretConfig[];
  setSecrets: (data: SecretConfig[]) => void;
  updateSecretStatus: (id: string, status: SecretConfig['status']) => void;
}

export const useSecretsStore = create<SecretsState>((set) => ({
  secrets: [],
  setSecrets: (data) => set({ secrets: data }),
  updateSecretStatus: (id, status) =>
    set((state) => ({
      secrets: state.secrets.map((s) => (s.id === id ? { ...s, status } : s)),
    })),
}));
