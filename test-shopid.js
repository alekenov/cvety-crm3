// Use native fetch in Node.js 18+

async function testShopId() {
  const token = 'ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144';
  
  // Test fetchProductDetail with shopId
  console.log('Testing product detail with shopId enrichment...\n');
  
  for (const productId of [633493, 633486]) {
    console.log(`\n=== Product ${productId} ===`);
    
    // 1. Get from new API
    const newApiRes = await fetch(`http://localhost:3003/api/v2/products/detail?access_token=${token}&id=${productId}`);
    const newApiData = await newApiRes.json();
    
    if (newApiData.success && newApiData.data) {
      console.log(`Title: ${newApiData.data.title}`);
      console.log(`Type: ${newApiData.data.type}`);
      console.log(`Shop ID: ${newApiData.data.shopId || 'Not available'}`);
      console.log(`Owner ID: ${newApiData.data.ownerId || 'Not available'}`);
    } else {
      console.log('Failed to fetch from new API');
    }
  }
}

testShopId().catch(console.error);