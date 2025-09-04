import { api } from './client';

export interface InventoryItemDTO {
  id: number;
  name: string;
  cost: number;
  quantity: number;
  markup: number;
  location: string;
  image: string | null;
  images: string[] | null;
  service: boolean;
  flower: string;
  deactivate: boolean;
}

export interface InventoryListResponse {
  success: true;
  data: InventoryItemDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface InventoryParams {
  limit?: number;
  offset?: number;
  search?: string;
  flower?: string;
  service?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  min_quantity?: number;
}

export async function fetchInventoryItems(params: InventoryParams = {}): Promise<InventoryListResponse> {
  try {
    const response = await api('/api/v2/inventory/', {
      method: 'GET',
      query: {
        ...params,
        limit: params.limit || 20
      }
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch inventory');
    }

    return response;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
}

export async function fetchInventoryItem(id: number): Promise<InventoryItemDTO> {
  try {
    const response = await api(`/api/v2/inventory/${id}/`, {
      method: 'GET'
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch inventory item');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    throw error;
  }
}

export async function searchInventoryItems(query: string, limit: number = 10): Promise<InventoryItemDTO[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await fetchInventoryItems({
      search: query,
      limit,
      offset: 0
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching inventory items:', error);
    return [];
  }
}

export function formatInventoryPrice(cost: number): string {
  return `${cost} ₸`;
}

export function formatInventoryUnit(unit: string): string {
  switch (unit) {
    case 'шт':
    case 'штука':
      return 'шт';
    case 'ветка':
      return 'ветка';
    case 'метр':
    case 'м':
      return 'м';
    case 'грамм':
    case 'г':
      return 'г';
    default:
      return unit;
  }
}

export function getFlowerTypeLabel(flower: string): string {
  switch (flower) {
    case 'roses':
      return 'Розы';
    case 'tulips':
      return 'Тюльпаны';
    case 'lilies':
      return 'Лилии';
    case 'chrysanthemums':
      return 'Хризантемы';
    case 'eucalyptus':
      return 'Эвкалипт';
    case 'gypsophila':
      return 'Гипсофила';
    default:
      return flower || 'Разное';
  }
}

export function categorizeInventoryItem(item: InventoryItemDTO): 'flowers' | 'greenery' | 'accessories' {
  if (item.service) return 'accessories';
  
  const flowerTypes = ['roses', 'tulips', 'lilies', 'chrysanthemums', 'peonies', 'hydrangeas'];
  const greeneryTypes = ['eucalyptus', 'gypsophila', 'fern', 'aspidistra'];
  
  if (flowerTypes.includes(item.flower.toLowerCase())) return 'flowers';
  if (greeneryTypes.includes(item.flower.toLowerCase())) return 'greenery';
  
  // Categorize by name keywords
  const name = item.name.toLowerCase();
  if (name.includes('роз') || name.includes('тюльпан') || name.includes('лили') || 
      name.includes('хризантем') || name.includes('пион')) return 'flowers';
  if (name.includes('эвкалипт') || name.includes('гипсофила') || name.includes('зелень')) return 'greenery';
  if (name.includes('лента') || name.includes('упаковка') || name.includes('работа')) return 'accessories';
  
  return 'flowers'; // default
}

// API interfaces for inventory item details and history
export interface InventoryHistoryItem {
  operation: 'acceptance' | 'writeOff' | 'deactivate' | 'consumption';
  data: Array<{
    id: number;
    name: string;
    quantity: number;
  }>;
  date: string;
  user: string | null;
  shopId: string;
  orderId: string | false;
}

export interface InventoryHistoryResponse {
  success: true;
  data: InventoryHistoryItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Get inventory item by searching through the main list
export async function fetchInventoryItemById(id: number): Promise<InventoryItemDTO | null> {
  try {
    // Search for item with specific ID using existing API
    const response = await fetchInventoryItems({
      limit: 100, // Get more items to search through
      offset: 0
    });
    
    if (response.success) {
      const item = response.data.find(item => item.id === id);
      return item || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching inventory item by ID:', error);
    return null;
  }
}

// Get inventory item history
export async function fetchInventoryHistory(itemId: number, params: {
  limit?: number;
  offset?: number;
} = {}): Promise<InventoryHistoryResponse | null> {
  try {
    const response = await api(`/api/v2/inventory/history/`, {
      method: 'GET',
      query: {
        id: itemId,
        limit: params.limit || 50,
        offset: params.offset || 0
      }
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch inventory history');
    }

    return response;
  } catch (error) {
    console.error('Error fetching inventory history:', error);
    return null;
  }
}