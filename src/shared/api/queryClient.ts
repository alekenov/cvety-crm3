import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AppError } from './types';

// Create QueryClient with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: 5 minutes for stale data
      staleTime: 5 * 60 * 1000,
      // Garbage collection: 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof AppError && error.status && error.status >= 400 && error.status < 500) {
          return false;
        }
        
        // Retry network/timeout errors up to 3 times
        if (error instanceof AppError && ['NETWORK_ERROR', 'TIMEOUT_ERROR'].includes(error.code)) {
          return failureCount < 3;
        }
        
        // Default: retry once
        return failureCount < 1;
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(300 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (useful for dashboard updates)
      refetchOnWindowFocus: true,
      // Background refetch interval (5 minutes for critical data)
      refetchInterval: 5 * 60 * 1000,
    },
    mutations: {
      retry: false, // Don't retry mutations by default
      onError: (error) => {
        // Global error handling for mutations
        if (error instanceof AppError) {
          toast.error(error.message || 'Произошла ошибка');
        } else {
          toast.error('Неизвестная ошибка');
        }
        
        // Log errors in development
        if (import.meta.env.DEV) {
          console.error('🔴 Mutation Error:', error);
        }
      },
    },
  },
});

// Global error handler
queryClient.setMutationDefaults(['*'], {
  onError: (error) => {
    console.error('Global mutation error:', error);
  },
});

// Development query debugging
if (import.meta.env.DEV) {
  queryClient.setQueryDefaults(['*'], {
    onError: (error) => {
      console.error('🔴 Query Error:', error);
    },
  });
}