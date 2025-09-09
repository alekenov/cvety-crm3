// Shared API types and generic responses

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: ApiError;
  pagination?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status?: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  page?: number;
  pages?: number;
}

// HTTP Method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request configuration
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, unknown>;
  signal?: AbortSignal;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

// Standard error types
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: unknown,
    public status?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network connection failed') {
    super('NETWORK_ERROR', message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super('VALIDATION_ERROR', message);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super('SERVICE_UNAVAILABLE', message, undefined, 503);
  }
}

// Utility types for API operations
export type CreateRequest<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRequest<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// Money type for better price handling
export interface Money {
  amount: number;
  currency: 'KZT' | 'USD' | 'EUR';
  formatted: string;
}