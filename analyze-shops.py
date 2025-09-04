import json
import urllib.request

token = 'ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144'

# Get all catalog products
url = f'https://cvety.kz/api/v2/product/list/?access_token={token}&type=catalog&limit=200'
response = urllib.request.urlopen(url)
data = json.loads(response.read())

shop_distribution = {}
shop_17008_products = []
shop_630621_products = []

if data.get('status') and data.get('data', {}).get('items'):
    for item in data['data']['items']:
        shop_id = item.get('shopId', 'unknown')
        shop_distribution[shop_id] = shop_distribution.get(shop_id, 0) + 1
        
        if shop_id == 17008:
            shop_17008_products.append({'id': item['id'], 'name': item['name']})
        elif shop_id == 630621:
            shop_630621_products.append({'id': item['id'], 'name': item['name']})

print("=== Shop Distribution ===")
for shop_id, count in sorted(shop_distribution.items()):
    print(f"Shop {shop_id}: {count} products")

print(f"\n=== Shop 17008 products (first 5) ===")
for p in shop_17008_products[:5]:
    print(f"  {p['id']}: {p['name']}")

print(f"\n=== Shop 630621 products (first 5) ===")
for p in shop_630621_products[:5]:
    print(f"  {p['id']}: {p['name']}")

# Check if our target products are in the correct shop
target_ids = [633473, 633493]
print(f"\n=== Target products location ===")
for item in data['data']['items']:
    if item['id'] in target_ids:
        print(f"Product {item['id']} ({item['name']}): shopId = {item.get('shopId', 'N/A')}")