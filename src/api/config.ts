// In development use local proxy, in production use environment variable
const isDevelopment = import.meta.env.DEV;
export const API_BASE = isDevelopment ? '' : (import.meta.env.VITE_API_BASE || 'https://cvety.kz');
export const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144';
export const API_CITY  = import.meta.env.VITE_CITY_ID || '2';

