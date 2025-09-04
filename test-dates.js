// Test date parsing and API calls
const API_TOKEN = 'ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144';

// Helper function to parse date in format "DD.MM.YYYY HH:mm:ss"
function parseLegacyDate(dateStr) {
  if (!dateStr) return null;
  
  // Check for empty date "00.00.0000 00:00:00"
  if (dateStr === '00.00.0000 00:00:00' || dateStr.startsWith('00.00.0000')) {
    return null;
  }
  
  // Parse "DD.MM.YYYY HH:mm:ss" format
  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const [, day, month, year, hour, minute, second] = match;
    // Create ISO date string
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+05:00`);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  
  return null;
}

async function testApis() {
  console.log('=== Testing APIs ===\n');
  
  // 1. Test new API
  console.log('1. Fetching from NEW API (/api/v2/products):');
  const newApiRes = await fetch(`https://cvety.kz/api/v2/products?access_token=${API_TOKEN}&limit=3&type=vitrina`);
  const newApiData = await newApiRes.json();
  
  if (newApiData.success && newApiData.data) {
    newApiData.data.forEach(product => {
      console.log(`  ID: ${product.id}, createdAt: ${product.createdAt}`);
    });
  }
  
  // 2. Test legacy API
  console.log('\n2. Fetching from LEGACY API (/api/v2/product/list/):');
  const legacyApiRes = await fetch(`https://cvety.kz/api/v2/product/list/?access_token=${API_TOKEN}&limit=3&type=vitrina`);
  const legacyApiData = await legacyApiRes.json();
  
  if (legacyApiData.status && legacyApiData.data?.items) {
    legacyApiData.data.items.forEach(item => {
      const parsedCreated = parseLegacyDate(item.created_at);
      const parsedUpdated = parseLegacyDate(item.updated_at);
      console.log(`  ID: ${item.id}`);
      console.log(`    created_at: ${item.created_at} => ${parsedCreated || 'invalid'}`);
      console.log(`    updated_at: ${item.updated_at} => ${parsedUpdated || 'use this'}`);
      console.log(`    Final date: ${parsedCreated || parsedUpdated || 'current date'}`);
    });
  }
  
  // 3. Test merging
  console.log('\n3. Merging data (simulating our fix):');
  const hasInvalidDates = newApiData.data.some(product => 
    product.createdAt?.startsWith('-0001') || product.createdAt?.startsWith('0001-11-30')
  );
  
  console.log(`  Invalid dates detected: ${hasInvalidDates}`);
  
  if (hasInvalidDates) {
    // Create map from legacy API
    const legacyMap = new Map();
    legacyApiData.data.items.forEach(item => {
      const createdAt = parseLegacyDate(item.created_at);
      const updatedAt = parseLegacyDate(item.updated_at);
      legacyMap.set(item.id, createdAt || updatedAt || new Date().toISOString());
    });
    
    console.log('\n  Merged results:');
    newApiData.data.forEach(product => {
      const fixedDate = legacyMap.get(product.id) || product.createdAt;
      console.log(`    ID: ${product.id}, fixed createdAt: ${fixedDate}`);
    });
  }
}

testApis().catch(console.error);