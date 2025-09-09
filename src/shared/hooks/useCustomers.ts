import { useQuery } from '@tanstack/react-query';
import { CustomerAPI, type Customer } from '@/services/customerApi';

// Query keys for customers
export const customersKeys = {
  all: ['customers'] as const,
  list: () => [...customersKeys.all, 'list'] as const,
  detail: (id: number) => [...customersKeys.all, 'detail', id] as const,
  orders: (customerId: number) => [...customersKeys.all, customerId, 'orders'] as const,
};

// Configuration constants
const PAGE_SIZE = 100; // Load all customers at once for better UX
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

export interface CustomersQueryData {
  customers: Customer[];
  total: number;
}

async function fetchCustomers(): Promise<CustomersQueryData> {
  const startTime = Date.now();
  console.log('🔍 Loading customers with React Query...');
  
  try {
    // Try new optimized endpoint first, fallback to legacy
    let customers: Customer[];
    try {
      const { customers: customersData } = await CustomerAPI.getCustomersWithStats(1, PAGE_SIZE, false);
      customers = customersData;
    } catch (error) {
      console.warn('⚠️ New endpoint failed, falling back to legacy method:', error);
      customers = await CustomerAPI.fetchCustomers(PAGE_SIZE, 0, true);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Loaded ${customers.length} customers successfully in ${duration}ms`);
    
    return {
      customers,
      total: customers.length
    };
  } catch (error) {
    console.error('❌ Failed to load customers:', error);
    throw error;
  }
}

/**
 * React Query hook for customers with caching and performance optimization.
 * Mirrors the pattern used in useOrders and useProducts for consistency.
 */
export function useCustomers() {
  return useQuery({
    queryKey: customersKeys.list(),
    queryFn: fetchCustomers,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true, // Refresh when user switches back to app
    retry: (failureCount, error) => {
      // Don't retry on 4xx client errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 2; // Retry up to 2 times
    },
  });
}

/**
 * Hook for customer detail with separate caching
 */
export function useCustomerDetail(customerId: number) {
  return useQuery({
    queryKey: customersKeys.detail(customerId),
    queryFn: () => CustomerAPI.fetchCustomerDetail(customerId),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!customerId, // Only run if customerId is provided
  });
}

/**
 * Hook for customer orders with separate caching
 */
export function useCustomerOrders(customerId: number) {
  return useQuery({
    queryKey: customersKeys.orders(customerId),
    queryFn: () => CustomerAPI.fetchCustomerOrders(customerId),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!customerId, // Only run if customerId is provided
  });
}