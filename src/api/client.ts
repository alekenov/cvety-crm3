import { API_BASE, API_TOKEN, API_CITY } from './config';
import { trackApiCall } from '../utils/performance';

type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

type ApiOptions = {
  method?: Method;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
  signal?: AbortSignal;
  // New controls
  timeoutMs?: number;        // default 20000
  retries?: number;          // default 0 (GET may override to 2)
  retryDelayMs?: number;     // base delay for backoff (default 300)
};

let warnedMissingToken = false;

export async function api(path: string, opts: ApiOptions = {}) {
  const method = opts.method || 'GET';
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers || {}),
  };

  // Build query parameters (add auth token for cvety.kz API)
  const query = new URLSearchParams();
  if (API_TOKEN) {
    query.set('access_token', API_TOKEN);
  } else if (!warnedMissingToken) {
    console.warn('[api] VITE_API_TOKEN is not set. Requests may fail with 401');
    warnedMissingToken = true;
  }
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null) query.set(k, String(v));
    }
  }

  // Build URL with query params if any
  const queryString = query.toString();
  const url = `${API_BASE}${path}${queryString ? (path.includes('?') ? '&' : '?') + queryString : ''}`;

  // Configure retries and timeouts
  const isGet = method === 'GET';
  const timeoutMs = opts.timeoutMs ?? 20000;
  const maxRetries = opts.retries ?? (isGet ? 2 : 0);
  const baseDelay = opts.retryDelayMs ?? 300;

  const startTimeTotal = performance.now();
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const init: RequestInit = { method, headers, signal: controller.signal };
    if (opts.signal) init.signal = opts.signal;
    if (opts.body) {
      if (opts.body instanceof FormData) {
        init.body = opts.body;
      } else {
        headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(opts.body);
      }
    }

    try {
      const res = await fetch(url, init);
      clearTimeout(timeoutId);
      const text = await res.text();

      let json: any;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      if (!res.ok) {
        const msg = json?.error?.message || json?.error || json?.detail || res.statusText;
        // Retriable on 5xx for GET
        if (isGet && res.status >= 500 && res.status < 600 && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        const duration = performance.now() - startTimeTotal;
        trackApiCall(path, duration, false);
        throw new Error(`${res.status} ${msg}`);
      }

      if (json?.success === false || json?.status === false) {
        const msg = json?.error?.message || json?.error || 'Request failed';
        // Retriable on backend-declared temporary failures? Keep simple: no
        const duration = performance.now() - startTimeTotal;
        trackApiCall(path, duration, false);
        throw new Error(msg);
      }

      const duration = performance.now() - startTimeTotal;
      trackApiCall(path, duration, true);
      return json;
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      const isAbort = error?.name === 'AbortError';
      const isNetwork = error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError');
      if (isGet && (isAbort || isNetwork) && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      const duration = performance.now() - startTimeTotal;
      trackApiCall(path, duration, false);
      console.error('API Error:', error);
      throw error;
    }
  }

  // Should not reach here
  throw lastError ?? new Error('Unknown API error');
}
