import { useQuery } from '@tanstack/react-query';
import { fetchInventoryItems, type InventoryItemDTO, type InventoryParams } from '@/api/inventory';

// Query keys for inventory
export const inventoryKeys = {
  all: ['inventory'] as const,
  list: () => [...inventoryKeys.all, 'list'] as const,
  detail: (id: number) => [...inventoryKeys.all, 'detail', id] as const,
};

// Configuration constants
const PAGE_SIZE = 100; // Load all inventory items at once
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

// Transform DTO to component format
export interface InventoryItem {
  id: number;
  name: string;
  category: 'flowers' | 'greenery' | 'accessories';
  price: string; // formatted price
  unit: string;
  quantity: number;
  lastDelivery: Date;
  image: string;
}

// Utility function to categorize inventory items
function categorizeInventoryItem(dto: InventoryItemDTO): 'flowers' | 'greenery' | 'accessories' {
  const name = dto.name.toLowerCase();
  
  // Flowers
  if (name.includes('роз') || name.includes('тюльпан') || name.includes('лили') || 
      name.includes('хризантем') || name.includes('гербер') || name.includes('пион') ||
      name.includes('орхиде') || name.includes('гвоздик') || dto.flower) {
    return 'flowers';
  }
  
  // Greenery
  if (name.includes('эвкалипт') || name.includes('папоротник') || name.includes('зелен') ||
      name.includes('листь') || name.includes('ветк')) {
    return 'greenery';
  }
  
  // Default to accessories for other items
  return 'accessories';
}

function formatInventoryPrice(cost: number): string {
  return `${cost.toLocaleString()} ₸`;
}

export interface InventoryQueryData {
  items: InventoryItem[];
  total: number;
}

async function fetchInventoryData(): Promise<InventoryQueryData> {
  const startTime = Date.now();
  console.log('🔍 Loading inventory with React Query...');
  
  try {
    const params: InventoryParams = {
      limit: PAGE_SIZE,
      offset: 0
    };
    
    const response = await fetchInventoryItems(params);
    
    if (response.success && response.data) {
      // Transform API data to component format
      const transformedItems: InventoryItem[] = response.data.map((dto: InventoryItemDTO) => ({
        id: dto.id,
        name: dto.name,
        category: categorizeInventoryItem(dto),
        price: formatInventoryPrice(dto.cost),
        unit: dto.service ? 'услуга' : 'шт',
        quantity: dto.quantity,
        lastDelivery: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Random delivery date
        image: dto.image || "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=100&h=100&fit=crop" // Default image
      }));
      
      const duration = Date.now() - startTime;
      console.log(`✅ Loaded ${transformedItems.length} inventory items successfully in ${duration}ms`);
      
      return {
        items: transformedItems,
        total: response.pagination.total
      };
    } else {
      throw new Error('Failed to load inventory data');
    }
  } catch (error) {
    console.error('❌ Failed to load inventory:', error);
    throw error;
  }
}

/**
 * React Query hook for inventory with caching and performance optimization.
 * Mirrors the pattern used in useOrders, useProducts, and useCustomers for consistency.
 */
export function useInventory() {
  return useQuery({
    queryKey: inventoryKeys.list(),
    queryFn: fetchInventoryData,
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