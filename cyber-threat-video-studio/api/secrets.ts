import { z } from 'zod';
import { useSecretsStore } from '../stores/secretsStore';
import { SecretConfig } from '../types';
import { delay } from '../utils/delay';

const secretSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  key: z.string().default(''),
  status: z.enum(['Loaded', 'Missing', 'Error']).default('Loaded'),
  maskedValue: z.string().optional(),
  provider: z.enum(['Doppler', 'AWS', 'System']).default('System'),
});

const seedSecrets: SecretConfig[] = [
  { id: '1', name: 'Doppler Project: cyber-threat-studio', key: 'dp.pt.xxx', status: 'Loaded', provider: 'Doppler' },
  { id: '2', name: 'Doppler Config: prd_aws_useast1', key: 'dp.ct.xxx', status: 'Loaded', provider: 'Doppler' },
  { id: '3', name: 'GEMINI_API_KEY', key: 'AIzaSy...', status: 'Loaded', maskedValue: '•••••••••••••••••', provider: 'System' },
  { id: '4', name: 'SORA_API_KEY', key: '', status: 'Missing', provider: 'System' },
];

let hydrated = false;

export const secretsApi = {
  list: async (): Promise<SecretConfig[]> => {
    if (!hydrated) {
      useSecretsStore.getState().setSecrets(seedSecrets);
      hydrated = true;
    }
    await delay(200);
    return useSecretsStore.getState().secrets;
  },
  updateStatus: async (id: string, status: SecretConfig['status']) => {
    await delay(120);
    useSecretsStore.getState().updateSecretStatus(id, status);
    return { ok: true };
  },
  upsert: async (input: Partial<SecretConfig>): Promise<SecretConfig> => {
    const parsed = secretSchema.parse(input || {});
    const secret: SecretConfig = {
      id: parsed.id ?? crypto.randomUUID(),
      name: parsed.name,
      key: parsed.key,
      status: parsed.status,
      maskedValue: parsed.maskedValue,
      provider: parsed.provider,
    };
    await delay(120);
    const existing = useSecretsStore.getState().secrets.find((s) => s.id === secret.id);
    if (existing) {
      useSecretsStore.getState().setSecrets(
        useSecretsStore.getState().secrets.map((s) => (s.id === secret.id ? secret : s))
      );
    } else {
      useSecretsStore.getState().setSecrets([secret, ...useSecretsStore.getState().secrets]);
    }
    return secret;
  },
};
