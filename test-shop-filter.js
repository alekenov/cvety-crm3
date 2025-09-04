async function test() {
  const token = 'ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144';
  
  // Test the legacy API with shop_id filter
  const url = `https://cvety.kz/api/v2/product/list/?access_token=${token}&type=catalog&limit=100&shop_id=17008`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.status && data.data?.items) {
    // Filter by shopId
    const filtered = data.data.items.filter(item => item.shopId === 17008);
    const wrongShop = data.data.items.filter(item => item.shopId !== 17008 && item.shopId);
    
    console.log('Total items returned by API:', data.data.items.length);
    console.log('Items with shopId=17008:', filtered.length);
    console.log('Items with wrong shopId:', wrongShop.length);
    console.log('\nWrong shop products (first 5):');
    wrongShop.slice(0, 5).forEach(i => {
      console.log(`  ID: ${i.id}, Name: ${i.name}, ShopId: ${i.shopId}`);
    });
    
    console.log('\nCorrect shop products (first 5):');
    filtered.slice(0, 5).forEach(i => {
      console.log(`  ID: ${i.id}, Name: ${i.name}, ShopId: ${i.shopId}`);
    });
  }
}

test().catch(console.error);