// Always use relative URLs - proxy will handle routing to cvety.kz in both dev and production
export const API_BASE = '';
export const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144';
export const API_CITY  = import.meta.env.VITE_CITY_ID || '2';
// Optional shop filter for catalog products
export const SHOP_ID = import.meta.env.VITE_SHOP_ID ? Number(import.meta.env.VITE_SHOP_ID) : undefined;
