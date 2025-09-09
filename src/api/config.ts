// Always use relative URLs - proxy will handle routing to cvety.kz in both dev and production
export const API_BASE = '';
// IMPORTANT: Do not ship default tokens in code. Token must come from env.
export const API_TOKEN = import.meta.env.VITE_API_TOKEN;
export const API_CITY  = import.meta.env.VITE_CITY_ID || '2';
// Optional shop filter for catalog products
export const SHOP_ID = import.meta.env.VITE_SHOP_ID ? Number(import.meta.env.VITE_SHOP_ID) : undefined;
