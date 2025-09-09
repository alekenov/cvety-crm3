// Customer Orders Cache
// Extracted from customerApi.ts to separate concerns

import type { ApiOrder } from '../types/customerTypes';

// Cache for customer orders - 60 seconds TTL
const ordersCache = new Map<number, { data: ApiOrder[], timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

// Helper to get cached orders
export function getCachedOrders(customerId: number): ApiOrder[] | null {
  const cached = ordersCache.get(customerId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📦 Using cached orders for customer ${customerId}`);
    return cached.data;
  }
  return null;
}

// Helper to cache orders
export function cacheOrders(customerId: number, orders: ApiOrder[]): void {
  ordersCache.set(customerId, { data: orders, timestamp: Date.now() });
}

// Clear cache for a specific customer
export function clearCustomerCache(customerId: number): void {
  ordersCache.delete(customerId);
}

// Clear all cache
export function clearAllCache(): void {
  ordersCache.clear();
}

// Get cache stats (for debugging)
export function getCacheStats(): { size: number; keys: number[] } {
  return {
    size: ordersCache.size,
    keys: Array.from(ordersCache.keys())
  };
}