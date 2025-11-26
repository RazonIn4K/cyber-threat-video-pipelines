import { z } from 'zod';
import { usePipelineStore } from '../stores/pipelineStore';
import { logsApi } from './logs';
import { pipelineExamples } from './commands';
import { delay } from '../utils/delay';
import { withLogging } from '../utils/loggingMiddleware';

const pipelineSchema = z.object({
  campaignId: z.string().optional(),
  steps: z.array(z.string()).optional(),
});

export interface RunOptions {
  campaignId?: string;
  simulate?: boolean;
  signal?: AbortSignal;
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  signal?: AbortSignal;
}

/**
 * Fetch wrapper with retry logic, exponential backoff, and abort support.
 * Only retries on network errors or 5xx server errors, not 4xx client errors.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const { maxRetries = 3, baseDelayMs = 1000, signal } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Check if aborted before attempt
    if (signal?.aborted) {
      throw new DOMException('Request cancelled', 'AbortError');
    }

    try {
      const response = await fetch(url, { ...init, signal });

      // Only retry on 5xx errors
      if (response.status >= 500 && attempt < maxRetries) {
        lastError = new Error(`Server error: ${response.status}`);
        // Fall through to retry logic
      } else {
        return response;
      }
    } catch (error) {
      lastError = error as Error;

      // Don't retry on abort
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }
    }

    // Exponential backoff with abort check
    const delayMs = baseDelayMs * Math.pow(2, attempt);
    
    // Use a promise that can be interrupted by abort signal
    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => resolve(), delayMs);
      
      if (signal) {
        const abortHandler = () => {
          clearTimeout(timeoutId);
          reject(new DOMException('Request cancelled during backoff', 'AbortError'));
        };
        
        signal.addEventListener('abort', abortHandler, { once: true });
        
        // Clean up listener after timeout completes
        setTimeout(() => signal.removeEventListener('abort', abortHandler), delayMs + 10);
      }
    });
  }

  throw lastError;
}

const runStep = async (label: string) => {
  await logsApi.create({ message: `${label} started`, type: 'info', timestamp: new Date().toISOString() });
  await delay(300);
  await logsApi.create({ message: `${label} finished`, type: 'success', timestamp: new Date().toISOString() });
};

const handleFetchError = (error: unknown): { ok: false; stdout: string; stderr: string } => {
  // Check for abort error
  if (error instanceof DOMException && error.name === 'AbortError') {
    return { ok: false, stdout: '', stderr: 'Request cancelled' };
  }
  const message = error instanceof Error ? error.message : String(error);
  return { ok: false, stdout: '', stderr: `Network error: ${message}` };
};

export const runApi = {
  pipeline: async (input: unknown, options: RunOptions = {}) =>
    withLogging('pipeline', async () => {
      const parsed = pipelineSchema.parse(input || {});
      const apiBase = import.meta.env.VITE_API_BASE;
      usePipelineStore.getState().setStatus('running', 'Pipeline starting');

      if (apiBase) {
        const steps: Array<'outline' | 'script' | 'media'> = ['outline', 'script', 'media'];
        let ok = true;
        const runOptions: RunOptions = { 
          campaignId: parsed.campaignId ?? options.campaignId,
          simulate: options.simulate,
          signal: options.signal 
        };
        
        for (const step of steps) {
          // Check for abort before each step
          if (options.signal?.aborted) {
            usePipelineStore.getState().setStatus('failed', 'Pipeline cancelled');
            return { ok: false, stdout: '', stderr: 'Pipeline cancelled', campaignId: parsed.campaignId };
          }
          
          const res = await runApi[step](runOptions);
          ok = ok && res.ok;
          
          // Stop pipeline if a step fails
          if (!res.ok) {
            break;
          }
        }
        usePipelineStore.getState().setStatus(ok ? 'success' : 'failed');
        return { ok, stdout: '', stderr: ok ? '' : 'One or more steps failed', campaignId: parsed.campaignId };
      }

      await runStep('Outline');
      await runStep('Script');
      await runStep('Media');
      const result = await pipelineExamples.makePipeline();
      usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr || 'Pipeline complete');
      return { ok: result.ok, stdout: result.stdout, stderr: result.stderr, campaignId: parsed.campaignId };
    }),

  outline: async (options: RunOptions = {}) => {
    const apiBase = import.meta.env.VITE_API_BASE;
    usePipelineStore.getState().setStatus('running', 'Outline');
    if (apiBase) {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/run/outline`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: options.campaignId, simulate: options.simulate }),
          },
          { signal: options.signal }
        );
        if (!res.ok) {
          const errorData = { ok: false, stdout: '', stderr: `HTTP ${res.status}: ${res.statusText}` };
          usePipelineStore.getState().setStatus('failed', errorData.stderr);
          return errorData;
        }
        const data = await res.json();
        usePipelineStore.getState().setStatus(data.ok ? 'success' : 'failed', data.stderr);
        return data;
      } catch (error) {
        const errorData = handleFetchError(error);
        usePipelineStore.getState().setStatus('failed', errorData.stderr);
        return errorData;
      }
    }
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_outline.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },

  script: async (options: RunOptions = {}) => {
    const apiBase = import.meta.env.VITE_API_BASE;
    usePipelineStore.getState().setStatus('running', 'Script');
    if (apiBase) {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/run/script`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: options.campaignId, simulate: options.simulate }),
          },
          { signal: options.signal }
        );
        if (!res.ok) {
          const errorData = { ok: false, stdout: '', stderr: `HTTP ${res.status}: ${res.statusText}` };
          usePipelineStore.getState().setStatus('failed', errorData.stderr);
          return errorData;
        }
        const data = await res.json();
        usePipelineStore.getState().setStatus(data.ok ? 'success' : 'failed', data.stderr);
        return data;
      } catch (error) {
        const errorData = handleFetchError(error);
        usePipelineStore.getState().setStatus('failed', errorData.stderr);
        return errorData;
      }
    }
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_script.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },

  media: async (options: RunOptions = {}) => {
    const apiBase = import.meta.env.VITE_API_BASE;
    usePipelineStore.getState().setStatus('running', 'Media');
    if (apiBase) {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/run/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: options.campaignId, simulate: options.simulate }),
          },
          { signal: options.signal }
        );
        if (!res.ok) {
          const errorData = { ok: false, stdout: '', stderr: `HTTP ${res.status}: ${res.statusText}` };
          usePipelineStore.getState().setStatus('failed', errorData.stderr);
          return errorData;
        }
        const data = await res.json();
        usePipelineStore.getState().setStatus(data.ok ? 'success' : 'failed', data.stderr);
        return data;
      } catch (error) {
        const errorData = handleFetchError(error);
        usePipelineStore.getState().setStatus('failed', errorData.stderr);
        return errorData;
      }
    }
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_sora_clips.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },

  shorts: async (options: RunOptions = {}) => {
    const apiBase = import.meta.env.VITE_API_BASE;
    usePipelineStore.getState().setStatus('running', 'Shorts');
    if (apiBase) {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/run/shorts`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: options.campaignId, simulate: options.simulate }),
          },
          { signal: options.signal }
        );
        if (!res.ok) {
          const errorData = { ok: false, stdout: '', stderr: `HTTP ${res.status}: ${res.statusText}` };
          usePipelineStore.getState().setStatus('failed', errorData.stderr);
          return errorData;
        }
        const data = await res.json();
        usePipelineStore.getState().setStatus(data.ok ? 'success' : 'failed', data.stderr);
        return data;
      } catch (error) {
        const errorData = handleFetchError(error);
        usePipelineStore.getState().setStatus('failed', errorData.stderr);
        return errorData;
      }
    }
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_shorts.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },

  shotlist: async (options: RunOptions = {}) => {
    const apiBase = import.meta.env.VITE_API_BASE;
    usePipelineStore.getState().setStatus('running', 'Shotlist');
    if (apiBase) {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/run/shotlist`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: options.campaignId, simulate: options.simulate }),
          },
          { signal: options.signal }
        );
        if (!res.ok) {
          const errorData = { ok: false, stdout: '', stderr: `HTTP ${res.status}: ${res.statusText}` };
          usePipelineStore.getState().setStatus('failed', errorData.stderr);
          return errorData;
        }
        const data = await res.json();
        usePipelineStore.getState().setStatus(data.ok ? 'success' : 'failed', data.stderr);
        return data;
      } catch (error) {
        const errorData = handleFetchError(error);
        usePipelineStore.getState().setStatus('failed', errorData.stderr);
        return errorData;
      }
    }
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_shotlist.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },

  audio: async (options: RunOptions = {}) => {
    const apiBase = import.meta.env.VITE_API_BASE;
    usePipelineStore.getState().setStatus('running', 'Audio');
    if (apiBase) {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/run/audio`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: options.campaignId, simulate: options.simulate }),
          },
          { signal: options.signal }
        );
        if (!res.ok) {
          const errorData = { ok: false, stdout: '', stderr: `HTTP ${res.status}: ${res.statusText}` };
          usePipelineStore.getState().setStatus('failed', errorData.stderr);
          return errorData;
        }
        const data = await res.json();
        usePipelineStore.getState().setStatus(data.ok ? 'success' : 'failed', data.stderr);
        return data;
      } catch (error) {
        const errorData = handleFetchError(error);
        usePipelineStore.getState().setStatus('failed', errorData.stderr);
        return errorData;
      }
    }
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_audio.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },

  sora: async (options: RunOptions = {}) => {
    const apiBase = import.meta.env.VITE_API_BASE;
    usePipelineStore.getState().setStatus('running', 'Sora');
    if (apiBase) {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/run/sora`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: options.campaignId, simulate: options.simulate }),
          },
          { signal: options.signal }
        );
        if (!res.ok) {
          const errorData = { ok: false, stdout: '', stderr: `HTTP ${res.status}: ${res.statusText}` };
          usePipelineStore.getState().setStatus('failed', errorData.stderr);
          return errorData;
        }
        const data = await res.json();
        usePipelineStore.getState().setStatus(data.ok ? 'success' : 'failed', data.stderr);
        return data;
      } catch (error) {
        const errorData = handleFetchError(error);
        usePipelineStore.getState().setStatus('failed', errorData.stderr);
        return errorData;
      }
    }
    const result = await pipelineExamples.pythonScript('../campaigns/shai-hulud-2025/scripts/generate_sora_clips.py');
    usePipelineStore.getState().setStatus(result.ok ? 'success' : 'failed', result.stderr);
    return result;
  },
};
