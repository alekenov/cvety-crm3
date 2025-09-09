import { 
  ApiResponse, 
  ApiError, 
  RequestConfig, 
  HttpMethod,
  AppError,
  NetworkError,
  ServiceUnavailableError 
} from './types';

class CircuitBreaker {
  private failures = new Map<string, number>();
  private openUntil = new Map<string, number>();
  
  private readonly maxFailures = 5;
  private readonly resetTimeMs = 60000; // 1 minute
  
  isOpen(url: string): boolean {
    const openTime = this.openUntil.get(url);
    if (!openTime) return false;
    
    if (Date.now() > openTime) {
      this.openUntil.delete(url);
      this.failures.delete(url);
      return false;
    }
    
    return true;
  }
  
  recordFailure(url: string): void {
    const failures = (this.failures.get(url) || 0) + 1;
    this.failures.set(url, failures);
    
    if (failures >= this.maxFailures) {
      this.openUntil.set(url, Date.now() + this.resetTimeMs);
    }
  }
  
  recordSuccess(url: string): void {
    this.failures.delete(url);
    this.openUntil.delete(url);
  }
}

interface RequestInterceptor {
  request: (config: RequestConfig) => Promise<RequestConfig>;
}

interface ResponseInterceptor {
  response: <T>(response: ApiResponse<T>) => Promise<ApiResponse<T>>;
  error: (error: ApiError) => Promise<ApiError>;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private circuitBreaker = new CircuitBreaker();
  
  // Response cache for GET requests
  private responseCache = new Map<string, { data: any; timestamp: number; expiry: number }>();
  
  // In-flight request deduplication
  private inflightRequests = new Map<string, Promise<any>>();
  
  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Accept': 'application/json',
      ...defaultHeaders
    };
  }
  
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }
  
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }
  
  // Cache management methods
  private getCacheKey(url: string): string {
    return url;
  }
  
  private getCachedResponse<T>(cacheKey: string): T | null {
    const cached = this.responseCache.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.expiry) {
      this.responseCache.delete(cacheKey);
      return null;
    }
    
    return cached.data as T;
  }
  
  private setCachedResponse<T>(cacheKey: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const now = Date.now();
    this.responseCache.set(cacheKey, {
      data,
      timestamp: now,
      expiry: now + ttl
    });
    
    // Clean up old cache entries
    if (this.responseCache.size > 100) {
      const oldestKey = Array.from(this.responseCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.responseCache.delete(oldestKey);
    }
  }
  
  async request<T = unknown>(path: string, config: RequestConfig = {}): Promise<T> {
    const method = config.method || 'GET';
    let requestConfig = { ...config, method };
    
    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor.request(requestConfig);
    }
    
    const url = this.buildUrl(path, requestConfig.query);
    const cacheKey = this.getCacheKey(url);
    
    // For GET requests, check cache and deduplication
    if (method === 'GET') {
      // Check cache first
      const cachedResponse = this.getCachedResponse<T>(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Check if request is already in flight
      const inflightRequest = this.inflightRequests.get(cacheKey);
      if (inflightRequest) {
        return inflightRequest;
      }
    }
    
    // Circuit breaker check
    if (this.circuitBreaker.isOpen(url)) {
      throw new ServiceUnavailableError('Service circuit breaker is open');
    }
    
    const requestPromise = this.executeRequest<T>(url, requestConfig, cacheKey);
    
    // Store in-flight request for deduplication
    if (method === 'GET') {
      this.inflightRequests.set(cacheKey, requestPromise);
    }
    
    try {
      const result = await requestPromise;
      
      // Cache GET responses
      if (method === 'GET') {
        this.setCachedResponse(cacheKey, result);
      }
      
      return result;
    } finally {
      // Clean up in-flight request
      if (method === 'GET') {
        this.inflightRequests.delete(cacheKey);
      }
    }
  }
  
  private async executeRequest<T>(url: string, requestConfig: RequestConfig, cacheKey: string): Promise<T> {
    try {
      const response = await this.fetchWithRetry(url, requestConfig);
      this.circuitBreaker.recordSuccess(url);
      
      // Apply response interceptors
      let apiResponse = response;
      for (const interceptor of this.responseInterceptors) {
        apiResponse = await interceptor.response(apiResponse);
      }
      
      return apiResponse.data as T;
    } catch (error) {
      this.circuitBreaker.recordFailure(url);
      
      // Apply error interceptors
      let apiError = this.normalizeError(error);
      for (const interceptor of this.responseInterceptors) {
        apiError = await interceptor.error(apiError);
      }
      
      throw new AppError(apiError.code, apiError.message, error, apiError.status);
    }
  }
  
  private buildUrl(path: string, query?: Record<string, unknown>): string {
    const url = new URL(path, this.baseURL);
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    
    return url.toString();
  }
  
  private async fetchWithRetry<T>(
    url: string, 
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', timeoutMs = 20000, retries = method === 'GET' ? 2 : 0, retryDelayMs = 300 } = config;
    
    let lastError: unknown = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        const headers = { ...this.defaultHeaders, ...config.headers };
        const init: RequestInit = {
          method,
          headers,
          signal: controller.signal
        };
        
        if (config.body) {
          if (config.body instanceof FormData) {
            init.body = config.body;
            // Don't set Content-Type for FormData - browser will set it with boundary
            delete headers['Content-Type'];
          } else {
            headers['Content-Type'] = 'application/json';
            init.body = JSON.stringify(config.body);
          }
        }
        
        const response = await fetch(url, init);
        clearTimeout(timeoutId);
        
        return await this.parseResponse<T>(response);
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        
        const isNetworkError = error instanceof TypeError || 
          (error as Error)?.name === 'AbortError' ||
          (error as Error)?.message?.includes('fetch');
          
        // Only retry on network errors and for GET requests
        if (method === 'GET' && isNetworkError && attempt < retries) {
          const delay = retryDelayMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }
  
  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const text = await response.text();
    let json: any;
    
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new AppError('PARSE_ERROR', `Invalid JSON response: ${text}`, undefined, response.status);
    }
    
    if (!response.ok) {
      const message = json?.error?.message || json?.error || json?.detail || response.statusText;
      throw new AppError('HTTP_ERROR', message, json, response.status);
    }
    
    // Handle different API response formats
    if (json.success === false || json.status === false) {
      const message = json?.error?.message || json?.error || 'Request failed';
      throw new AppError('API_ERROR', message, json);
    }
    
    // Normalize response format
    if ('data' in json) {
      return json as ApiResponse<T>;
    } else {
      return {
        success: true,
        data: json as T
      };
    }
  }
  
  private normalizeError(error: unknown): ApiError {
    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.message,
        status: error.status
      };
    }
    
    if ((error as Error)?.name === 'AbortError') {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'Request timeout'
      };
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed'
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
  
  // Convenience methods
  async get<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    return this.request<T>(path, { method: 'GET', query });
  }
  
  async post<T>(path: string, body?: unknown, options?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, ...options });
  }
  
  async put<T>(path: string, body?: unknown, options?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body, ...options });
  }
  
  async patch<T>(path: string, body?: unknown, options?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body, ...options });
  }
  
  async delete<T>(path: string, options?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', ...options });
  }
  
  // Cache invalidation methods
  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.responseCache.clear();
      return;
    }
    
    const keysToDelete: string[] = [];
    for (const [key] of this.responseCache) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.responseCache.delete(key));
  }
  
  // Method to get cache statistics
  getCacheStats() {
    const entries = Array.from(this.responseCache.values());
    const now = Date.now();
    const validEntries = entries.filter(entry => now < entry.expiry);
    
    return {
      totalEntries: this.responseCache.size,
      validEntries: validEntries.length,
      expiredEntries: this.responseCache.size - validEntries.length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null
    };
  }
}

// Create default API client instance
const API_BASE = import.meta.env.VITE_API_BASE || 'https://cvety.kz';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

export const apiClient = new ApiClient(API_BASE);

// Add auth token interceptor if available
if (API_TOKEN) {
  apiClient.addRequestInterceptor({
    request: async (config) => {
      // Add token to query params for cvety.kz API
      config.query = {
        ...config.query,
        access_token: API_TOKEN
      };
      return config;
    }
  });
}

// Export the class for custom instances
export { ApiClient };
export type { RequestInterceptor, ResponseInterceptor };