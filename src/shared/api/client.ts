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
  
  async request<T = unknown>(path: string, config: RequestConfig = {}): Promise<T> {
    const method = config.method || 'GET';
    let requestConfig = { ...config, method };
    
    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor.request(requestConfig);
    }
    
    const url = this.buildUrl(path, requestConfig.query);
    
    // Circuit breaker check
    if (this.circuitBreaker.isOpen(url)) {
      throw new ServiceUnavailableError('Service circuit breaker is open');
    }
    
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