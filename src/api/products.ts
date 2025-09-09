import { apiClient, ApiResponse } from '@/shared/api/client';

// Legacy import for backward compatibility during migration  
import { api } from './client';

export interface ProductDTO {
  id: number;
  image: string;
  images?: string[];
  title: string;
  price: string;
  isAvailable: boolean;
  // optional flags from detail
  isReady?: boolean;
  inStock?: boolean;
  createdAt: string | null;
  type: 'vitrina'|'catalog';
  width?: string; height?: string;
  video?: string | null;
  duration?: string | null;
  discount?: string | null;
  composition?: { name: string; count: string }[] | null;
  colors?: string[] | null;
  catalogWidth?: string | null;
  catalogHeight?: string | null;
  productionTime?: string | null;
  shopId?: number | null;  // Added shop ID from legacy API
  ownerId?: number | null;  // Added owner ID
}

export async function fetchProducts(params: { type?: 'vitrina'|'catalog'; isAvailable?: boolean; limit?: number; offset?: number; shop_id?: number }) {
  try {
    // For catalog products with shop_id filter, use legacy API since new API doesn't support shop filtering
    if (params.type === 'catalog' && params.shop_id !== undefined) {
      console.log(`Using legacy API for catalog with shop_id=${params.shop_id}`);
      const legacyProducts = await fetchProductsLegacy({
        type: 'catalog',
        limit: params.limit || 100,
        shop_id: params.shop_id
      });
      
      console.log(`fetchProducts returning ${legacyProducts.length} filtered products`);
      return {
        success: true,
        data: legacyProducts,
        pagination: {
          total: legacyProducts.length,
          limit: params.limit || 20,
          offset: params.offset || 0,
          hasMore: legacyProducts.length === (params.limit || 20)
        }
      };
    }
    
    const res = await api('/api/v2/products', { query: params });

    // Helper to detect invalid/placeholder dates from new API
    const isInvalidCreatedAt = (val: unknown): boolean => {
      if (!val || typeof val !== 'string') return true;
      const s = val.trim();
      if (!s) return true;
      // Known placeholders observed in backend: '-0001-..', '0001-..', '0000-..'
      if (s.startsWith('-0001') || s.startsWith('0001') || s.startsWith('0000')) return true;
      // Try parsing
      const d = new Date(s);
      if (isNaN(d.getTime())) return true;
      // If time part is exactly 00:00:00, consider suspicious for vitrina (often date-only)
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const seconds = d.getSeconds();
      return hours === 0 && minutes === 0 && seconds === 0;
    };

    // API v2 returns structured response with success, data, and pagination
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      const typed = res as { success: true; data: ProductDTO[]; pagination?: { total:number; limit:number; offset:number; hasMore:boolean } };

      // If there are invalid createdAt values (common for vitrina), try to patch from legacy API
      const needsLegacyDates = typed.data.some(p => isInvalidCreatedAt(p.createdAt))
        && (params.type !== 'catalog'); // focus on vitrina or mixed

      if (needsLegacyDates) {
        // 1) Try to cover broadly by type/limit
        const legacyBulk = await fetchProductsLegacy({ type: params.type || 'vitrina', limit: params.limit || 100, shop_id: params.shop_id });
        const legacyMap = new Map<number, string | null>();
        legacyBulk.forEach(item => legacyMap.set(item.id, item.createdAt));

        // 2) Identify ids still lacking a fixed date after bulk
        const invalidIds = typed.data
          .filter(p => isInvalidCreatedAt(p.createdAt) && !legacyMap.has(p.id))
          .map(p => p.id);

        // 3) Fetch precise entries by id (limit 1) to make sure we get them
        if (invalidIds.length > 0) {
          const byIdResults = await Promise.all(
            invalidIds.map(id => fetchProductsLegacy({ type: params.type || 'vitrina', limit: 1, id, shop_id: params.shop_id }))
          );
          byIdResults.flat().forEach(item => legacyMap.set(item.id, item.createdAt));
        }

        const merged = typed.data.map(p => (
          isInvalidCreatedAt(p.createdAt)
            ? { ...p, createdAt: legacyMap.get(p.id) ?? p.createdAt }
            : p
        ));

        return {
          success: true,
          data: merged,
          pagination: typed.pagination ?? {
            total: merged.length,
            limit: params.limit || 20,
            offset: params.offset || 0,
            hasMore: merged.length === (params.limit || 20)
          }
        };
      }

      return typed as { success: true; data: ProductDTO[]; pagination: { total:number; limit:number; offset:number; hasMore:boolean } };
    }

    // Fallback for unexpected response structure
    const data = Array.isArray(res) ? res : (res?.data || []);
    return {
      success: true,
      data: data,
      pagination: {
        total: data.length,
        limit: params.limit || 20,
        offset: params.offset || 0,
        hasMore: data.length === (params.limit || 20)
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      data: [],
      pagination: {
        total: 0,
        limit: params.limit || 20,
        offset: params.offset || 0,
        hasMore: false
      }
    };
  }
}

export async function fetchProductDetail(id: number) {
  const res = await api('/api/v2/products/detail', { query: { id } });
  const result = res as { success: true; data: ProductDTO };
  
  // Try to get shopId from legacy API
  try {
    const legacyRes = await api('/api/v2/product/list/', { 
      query: { 
        id: id,
        limit: 1 
      } 
    });
    
    if (legacyRes?.status === true && legacyRes?.data?.items?.length > 0) {
      const legacyItem = legacyRes.data.items[0];
      // Add shopId if available (might be in different formats)
      if (legacyItem.shop_id) {
        result.data.shopId = legacyItem.shop_id;
      } else if (legacyItem.shopId) {
        result.data.shopId = legacyItem.shopId;
      } else if (legacyItem.shop) {
        result.data.shopId = legacyItem.shop;
      }
      
      // Add ownerId if available
      if (legacyItem.owner_id) {
        result.data.ownerId = legacyItem.owner_id;
      } else if (legacyItem.ownerId) {
        result.data.ownerId = legacyItem.ownerId;
      }
    }
  } catch (error) {
    console.log('Failed to get shopId from legacy API:', error);
    // Continue without shopId - not critical
  }
  
  return result;
}

export async function toggleProductActive(id: number, active: boolean) {
  const body = new URLSearchParams();
  body.set('id', String(id));
  body.set('active', active ? 'Y' : 'N');
  const res = await api('/api/v2/product/update-status', { method: 'POST', body: Object.fromEntries(body) });
  return res;
}

export async function updateProductStatus(id: number, flags: { active?: boolean; in_stock?: boolean; is_ready?: boolean }) {
  const body: Record<string, any> = { id };
  
  if (flags.active !== undefined) {
    body.active = flags.active ? 'Y' : 'N';
  }
  if (flags.in_stock !== undefined) {
    body.in_stock = flags.in_stock ? '1' : '0';
  }
  if (flags.is_ready !== undefined) {
    body.is_ready = flags.is_ready ? '1' : '0';
  }
  
  return api('/api/v2/product/update-status', { method: 'POST', body });
}

export async function updateProductProperties(id: number, props: { width?: string|number; height?: string|number }) {
  const payload: Record<string,string|number> = { id } as any;
  if (props.width !== undefined) payload.width = String(props.width);
  if (props.height !== undefined) payload.height = String(props.height);
  return api('/api/v2/product/properties', { method:'POST', body: payload });
}

export async function setProductPrice(id: number, price?: number, percent?: number) {
  const payload: Record<string,string|number> = { id } as any;
  if (price !== undefined) payload.price = price;
  if (percent !== undefined) payload.percent = percent;
  return api('/api/v2/product/price', { method:'POST', body: payload });
}

export async function uploadImages(files: File[]) {
  const fd = new FormData();
  files.forEach((f) => fd.append('files[]', f));
  const res = await api('/api/v2/uploads/images', { method:'POST', body: fd });
  // expected: { success:true, urls: string[] }
  return res as { success: true; urls: string[] };
}

export async function createProduct(data: { 
  type: 'vitrina'|'catalog';
  title?: string;
  price?: number;
  percent?: number;
  images?: string[];
  video?: string;
  width?: string|number;
  height?: string|number;
  ownerId?: number;
  owner?: string; // XML_ID
}) {
  const payload: any = { ...data };
  return api('/api/v2/product/create', { method:'POST', body: payload });
}

export async function deleteProduct(id: number) {
  return api('/api/v2/products/delete', { method:'DELETE', query: { id } });
}

export async function uploadVideo(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api('/api/v2/uploads/videos', { method:'POST', body: fd });
  // expected: { success:true, url:string }
  return res as { success: true; url: string };
}

// Helper function to parse date in format "DD.MM.YYYY HH:mm:ss" from legacy API
function parseLegacyDate(dateStr: string): string | null {
  if (!dateStr) return null;

  // Check for empty date like "00.00.0000 00:00:00"
  if (dateStr === '00.00.0000 00:00:00' || dateStr.startsWith('00.00.0000')) {
    return null;
  }

  // Parse "DD.MM.YYYY HH:mm:ss" format
  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const [, day, month, year, hour, minute, second] = match;
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+05:00`);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}

// Fetch products from legacy API /api/v2/product/list/
// Supports fetching by id to guarantee presence and precise timestamps
async function fetchProductsLegacy(params: { type?: 'vitrina'|'catalog'; limit?: number; id?: number; shop_id?: number }): Promise<ProductDTO[]> {
  try {
    const res = await api('/api/v2/product/list/', {
      query: {
        type: params.type,
        limit: params.limit || 100,
        active: 'all', // Request both active and inactive products
        ...(params.id ? { id: params.id } : {}),
        ...(params.shop_id ? { shop_id: params.shop_id } : {}),
      },
    });

    if (res?.status === true && res?.data?.items) {
      // Filter by shop_id client-side since backend filter doesn't work
      let items = res.data.items;
      if (params.shop_id !== undefined) {
        console.log(`Filtering products by shop_id=${params.shop_id}`);
        console.log(`Before filter: ${items.length} items`);
        items = items.filter((item: any) => {
          // The field is 'shopId' with capital I
          return item.shopId === params.shop_id;
        });
        console.log(`After filter: ${items.length} items`);
      }
      
      const products: ProductDTO[] = items.map((item: any) => {
        const createdAt = parseLegacyDate(item.created_at);
        const updatedAt = parseLegacyDate(item.updated_at);

        return {
          id: item.id,
          image: item.photo || '',
          images: item.photo ? [item.photo] : [],
          title: item.name || '',
          price: item.price ? `${item.price} ₸` : '0 ₸',
          isAvailable: item.active !== false,
          isReady: item.is_ready === true || item.is_ready === 1,
          createdAt: createdAt || updatedAt || new Date().toISOString(),
          type: (params.type as any) || 'vitrina',
          width: item.properties?.width || '',
          height: item.properties?.height || '',
          video: null,
          duration: null,
          discount: item.discount || null,
          composition: item.composition || null,
          colors: item.properties?.color || null,
          catalogWidth: item.properties?.catalogWidth || null,
          catalogHeight: item.properties?.catalogHeight || null,
          productionTime: item.deliveryTime?.assembly || null,
          shopId: item.shopId || null,
          ownerId: item.ownerId || null,
        };
      });

      return products;
    }

    return [];
  } catch (error) {
    console.error('Error fetching products from legacy API:', error);
    return [];
  }
}
