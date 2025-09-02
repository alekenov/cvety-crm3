import { API_BASE, API_TOKEN, API_CITY } from './config';

type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

export async function api(path: string, opts: { method?: Method; headers?: Record<string,string>; body?: any; query?: Record<string,any> } = {}) {
  const method = opts.method || 'GET';
  const headers: Record<string,string> = {
    'Accept': 'application/json',
    ...(opts.headers || {}),
  };
  
  // Build query parameters (add auth token for cvety.kz API)
  const query = new URLSearchParams();
  if (API_TOKEN) {
    query.set('access_token', API_TOKEN);
  }
  if (opts.query) {
    for (const [k,v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null) query.set(k, String(v));
    }
  }
  
  // Build URL with query params if any
  const queryString = query.toString();
  const url = `${API_BASE}${path}${queryString ? (path.includes('?') ? '&' : '?') + queryString : ''}`;
  
  const init: RequestInit = { method, headers };
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
    const text = await res.text();
    
    let json: any;
    try { 
      json = text ? JSON.parse(text) : {}; 
    } catch { 
      throw new Error(`Invalid JSON response: ${text}`); 
    }
    
    if (!res.ok) {
      const msg = json?.error?.message || json?.error || json?.detail || res.statusText;
      throw new Error(`${res.status} ${msg}`);
    }
    
    // FastAPI can return different success patterns
    if (json.success === false || json.status === false) {
      const msg = json?.error?.message || json?.error || 'Request failed';
      throw new Error(msg);
    }
    
    return json;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

