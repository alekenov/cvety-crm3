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
}

export async function fetchProducts(params: { type?: 'vitrina'|'catalog'; isAvailable?: boolean; limit?: number; offset?: number }) {
  try {
    const res = await api('/api/v2/products', { query: params });
    
    // API v2 returns structured response with success, data, and pagination
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      return res as { success: true; data: ProductDTO[]; pagination: { total:number; limit:number; offset:number; hasMore:boolean } };
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
  return res as { success: true; data: ProductDTO };
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
