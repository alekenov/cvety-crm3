import type { Money } from '../api/types';

export function formatPrice(amount: number | string, currency = 'KZT'): Money {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const formatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
  
  return {
    amount: numAmount,
    currency: currency as Money['currency'],
    formatted
  };
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(num);
}

export function decodeHtmlEntities(str: string): string {
  const element = document.createElement('div');
  element.innerHTML = str;
  return element.textContent || element.innerText || '';
}