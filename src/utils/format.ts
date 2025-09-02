/**
 * Decode HTML entities and clean up formatted strings
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  
  // Remove HTML tags
  const withoutTags = text.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities
  const decoded = withoutTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  return decoded;
}

/**
 * Clean and format price strings from API
 */
export function formatPrice(price: string | number | undefined): string {
  if (price === undefined || price === null) return '0 ₸';
  
  // If it's already a string with formatting
  if (typeof price === 'string') {
    // Clean HTML entities and tags
    const cleaned = decodeHtmlEntities(price);
    
    // If it already has currency symbol, return cleaned version
    if (cleaned.includes('₸') || cleaned.includes('$')) {
      return cleaned;
    }
    
    // Otherwise add currency symbol
    return `${cleaned} ₸`;
  }
  
  // If it's a number, format it
  const formatted = new Intl.NumberFormat('ru-RU').format(price);
  return `${formatted} ₸`;
}