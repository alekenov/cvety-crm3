import json
import urllib.request

token = 'ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144'
target_ids = [633473, 633493]

# Get all catalog products from legacy API
url = f'https://cvety.kz/api/v2/product/list/?access_token={token}&type=catalog&limit=200'
response = urllib.request.urlopen(url)
data = json.loads(response.read())

found_products = []
if data.get('status') and data.get('data', {}).get('items'):
    for item in data['data']['items']:
        if item['id'] in target_ids:
            found_products.append({
                'id': item['id'],
                'name': item['name'],
                'shopId': item.get('shopId', 'N/A'),
                'shop_id': item.get('shop_id', 'N/A'),
                'created_at': item.get('created_at', 'N/A'),
                'section_id': item.get('section_id', 'N/A'),
                'ownerId': item.get('ownerId', 'N/A'),
                'owner_id': item.get('owner_id', 'N/A')
            })

print("=== Found products in Legacy API ===\n")
for product in found_products:
    print(f"Product ID: {product['id']}")
    print(f"  Name: {product['name']}")
    print(f"  shopId: {product['shopId']}")
    print(f"  shop_id: {product['shop_id']}")
    print(f"  ownerId: {product['ownerId']}")
    print(f"  owner_id: {product['owner_id']}")
    print(f"  section_id: {product['section_id']}")
    print(f"  created_at: {product['created_at']}")
    print()

# Now check which shops contain these products
print("=== Checking shop ownership ===\n")

# Check shop 17008
url_17008 = f'https://cvety.kz/api/v2/product/list/?access_token={token}&type=catalog&shop_id=17008&limit=200'
response_17008 = urllib.request.urlopen(url_17008)
data_17008 = json.loads(response_17008.read())

in_shop_17008 = []
if data_17008.get('status') and data_17008.get('data', {}).get('items'):
    for item in data_17008['data']['items']:
        if item['id'] in target_ids:
            in_shop_17008.append(item['id'])

print(f"Shop 17008 contains products: {in_shop_17008 if in_shop_17008 else 'None'}")

# Check shop 630621
url_630621 = f'https://cvety.kz/api/v2/product/list/?access_token={token}&type=catalog&shop_id=630621&limit=200'
response_630621 = urllib.request.urlopen(url_630621)
data_630621 = json.loads(response_630621.read())

in_shop_630621 = []
if data_630621.get('status') and data_630621.get('data', {}).get('items'):
    for item in data_630621['data']['items']:
        if item['id'] in target_ids:
            in_shop_630621.append(item['id'])

print(f"Shop 630621 contains products: {in_shop_630621 if in_shop_630621 else 'None'}")