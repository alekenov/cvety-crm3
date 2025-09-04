import { api } from './client';

export interface FloristProfileDTO {
  id: number;
  name: string;
  phone: string;
  position: 'owner'|'senior'|'florist'|'assistant';
  bio?: string | null;
  avatar?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ShopInfoDTO {
  id: number;
  name: string;
  address: string;
  phone: string;
  working_hours: string;
  city?: string;
  description?: string;
  social_media?: {
    instagram?: string;
    whatsapp?: string;
    telegram?: string;
  };
  updated_at?: string | null;
}

export interface ColleagueDTO {
  id: number;
  name: string;
  phone: string;
  position: 'owner'|'senior'|'florist'|'assistant';
  isActive: boolean;
  joinedDate?: string; // ISO date
  created_at?: string;
  updated_at?: string;
}

export async function getProfile(id?: number) {
  const res = await api('/api/v2/profile', { query: id ? { id } : {} });
  return res as { success: true; data: FloristProfileDTO|null };
}

export async function updateProfile(payload: Partial<FloristProfileDTO> & { id: number }) {
  const res = await api('/api/v2/profile', { method: 'PUT', body: payload });
  return res as { success: true; data: FloristProfileDTO };
}

export async function getShopInfo(id?: number) {
  const res = await api('/api/v2/shop-info', { query: id ? { id } : {} });
  return res as { success: true; data: ShopInfoDTO|null };
}

export async function updateShopInfo(payload: Partial<ShopInfoDTO> & { id: number }) {
  const res = await api('/api/v2/shop-info', { method: 'PUT', body: payload });
  return res as { success: true; data: ShopInfoDTO };
}

export async function listColleagues(filters?: { isActive?: boolean; position?: ColleagueDTO['position'] }) {
  const res = await api('/api/v2/colleagues', { query: filters as any });
  return res as { success: true; data: ColleagueDTO[]; pagination?: any };
}

export async function createColleague(payload: { name: string; phone: string; position: ColleagueDTO['position']; isActive?: boolean; joinedDate?: string }) {
  const res = await api('/api/v2/colleagues', { method: 'POST', body: payload });
  return res as { success: true; data: ColleagueDTO };
}

export async function updateColleague(id: number, payload: Partial<Omit<ColleagueDTO,'id'>>) {
  const res = await api(`/api/v2/colleagues/${id}`, { method: 'PUT', body: payload });
  return res as { success: true; data: ColleagueDTO };
}

export async function toggleColleague(id: number, isActive: boolean) {
  const res = await api(`/api/v2/colleagues/${id}/toggle`, { method: 'PATCH', body: { isActive } });
  return res as { success: true; data: ColleagueDTO };
}

export async function deleteColleague(id: number) {
  const res = await api(`/api/v2/colleagues/${id}`, { method: 'DELETE' });
  return res as { success: true; data: { id: number; deleted: boolean } };
}

