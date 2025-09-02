# Complete API Documentation: cvety.kz CRM System

## Overview

This document provides comprehensive API documentation for the cvety.kz CRM system, including both the legacy Bitrix integration and the modern FastAPI backend.

## Authentication

### API Token Authentication
All API requests require authentication via query parameter:

```
GET /api/v2/products/?access_token=ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144
```

**Default Token**: `ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144`
**Environment Variable**: `VITE_API_TOKEN`

### Session Authentication (Legacy Bitrix)
Legacy endpoints use session-based authentication with `bitrix_sessid` tokens.

---

## Base Configuration

- **Production Base URL**: `https://cvety.kz`
- **API Prefix**: `/api/v2/`
- **Development Proxy**: `/api` → `https://cvety.kz` (Vite proxy)
- **Default City ID**: `2` (Astana)

---

## Response Formats

### Success Response (v2 API)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "status": false,
  "error": "token_error",
  "message": "Bad Token!!!"
}
```

### Legacy Response
Direct arrays or simple objects for backward compatibility.

---

## Product Management API

### GET `/api/v2/products/`
Fetch paginated product listings.

**Parameters:**
- `type` (optional): `'vitrina' | 'catalog'`
- `isAvailable` (optional): `boolean`
- `limit` (optional): `number` (default: 20, max: 100)
- `offset` (optional): `number` (default: 0)
- `city_id` (optional): `number` (default: from env)

**Example Request:**
```bash
curl "https://cvety.kz/api/v2/products/?type=vitrina&isAvailable=true&limit=10&access_token=YOUR_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Букет роз 'Классик'",
      "type": "vitrina",
      "price": "5000.00",
      "image": "https://cvety.kz/upload/products/roses_classic.jpg",
      "images": [
        "https://cvety.kz/upload/products/roses_classic_1.jpg",
        "https://cvety.kz/upload/products/roses_classic_2.jpg"
      ],
      "isAvailable": true,
      "isReady": true,
      "inStock": true,
      "width": "25",
      "height": "40",
      "createdAt": "2025-08-01T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET `/api/v2/products/detail/`
Fetch detailed product information.

**Parameters:**
- `id` (required): `number` - Product ID

**Example Request:**
```bash
curl "https://cvety.kz/api/v2/products/detail/?id=123&access_token=YOUR_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Свадебный букет 'Роскошь'",
    "type": "catalog",
    "price": "15000.00",
    "discount": "10.00",
    "image": "https://cvety.kz/upload/products/wedding_luxury.jpg",
    "images": [
      "https://cvety.kz/upload/products/wedding_luxury_1.jpg",
      "https://cvety.kz/upload/products/wedding_luxury_2.jpg"
    ],
    "video": "https://cvety.kz/upload/videos/wedding_luxury.mp4",
    "catalogWidth": "30-35",
    "catalogHeight": "45-50",
    "productionTime": "2-3 часа",
    "duration": "5-7 дней",
    "composition": [
      {"name": "Розы", "count": "15 шт"},
      {"name": "Эвкалипт", "count": "по сезону"},
      {"name": "Лента атласная", "count": "1 шт"}
    ],
    "colors": ["Красный", "Розовый", "Белый", "Кремовый"],
    "isAvailable": true,
    "isReady": true,
    "inStock": true,
    "createdAt": "2025-08-01T10:30:00Z"
  }
}
```

### POST `/api/v2/product/create`
Create a new product.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "type": "catalog",
  "title": "Новый букет",
  "price": 7500.50,
  "percent": 15.0,
  "images": [
    "https://cvety.kz/upload/temp/new_bouquet_1.jpg",
    "https://cvety.kz/upload/temp/new_bouquet_2.jpg"
  ],
  "video": "https://cvety.kz/upload/temp/new_bouquet.mp4",
  "width": "30",
  "height": "45",
  "ownerId": 5,
  "owner": "USER_XML_ID_123"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "title": "Новый букет",
    "type": "catalog",
    "message": "Продукт создан успешно"
  }
}
```

### POST `/api/v2/product/update-status/`
Toggle product availability status.

**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**
- `id`: `string` - Product ID
- `active`: `'Y' | 'N'` - Availability status

**Example Request:**
```bash
curl -X POST "https://cvety.kz/api/v2/product/update-status/?access_token=YOUR_TOKEN" \
  -d "id=123&active=Y"
```

### POST `/api/v2/product/properties/`
Update product dimensions.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "id": 123,
  "width": "35",
  "height": "50"
}
```

### POST `/api/v2/product/price/`
Update product pricing.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "id": 123,
  "price": 6500.00,
  "percent": 20.0
}
```

### DELETE `/api/v2/products/delete`
Delete a product.

**Parameters:**
- `id` (required): `number` - Product ID

**Example Request:**
```bash
curl -X DELETE "https://cvety.kz/api/v2/products/delete?id=123&access_token=YOUR_TOKEN"
```

---

## File Upload API

### POST `/api/v2/uploads/images`
Upload multiple product images.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `files[]`: Multiple image files (JPEG, PNG, WebP)

**Example Request:**
```bash
curl -X POST "https://cvety.kz/api/v2/uploads/images?access_token=YOUR_TOKEN" \
  -F "files[]=@image1.jpg" \
  -F "files[]=@image2.jpg"
```

**Example Response:**
```json
{
  "success": true,
  "urls": [
    "https://cvety.kz/upload/products/generated_id_1.jpg",
    "https://cvety.kz/upload/products/generated_id_2.jpg"
  ]
}
```

### POST `/api/v2/uploads/videos`
Upload product video.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: Single video file (MP4, WebM)

**Example Response:**
```json
{
  "success": true,
  "url": "https://cvety.kz/upload/videos/generated_id.mp4"
}
```

---

## Order Management API

### GET `/api/v2/orders/`
Fetch paginated order listings.

**Parameters:**
- `status` (optional): Order status filter
- `date` (optional): `YYYY-MM-DD` format
- `limit` (optional): `number` (default: 20)
- `offset` (optional): `number` (default: 0)

**Order Statuses:**
- `new` - Новый заказ
- `paid` - Оплачен
- `accepted` - Принят в работу
- `assembled` - Собран
- `in-transit` - В доставке
- `completed` - Выполнен

**Example Request:**
```bash
curl "https://cvety.kz/api/v2/orders/?status=new&date=2025-09-01&access_token=YOUR_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "orderNumber": "CV202509-000001",
      "status": "new",
      "customerName": "Айгуль Сатыбалдиева",
      "customerPhone": "+77015211545",
      "deliveryDate": "2025-09-01",
      "deliveryTime": "14:00",
      "totalAmount": "6000.00",
      "items": [
        {
          "productTitle": "Букет роз 'Классик'",
          "quantity": 1,
          "unitPrice": "5000.00"
        }
      ],
      "createdAt": "2025-08-31T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET `/api/orders/{id}`
Fetch detailed order information.

**Parameters:**
- `id` (path): `string | number` - Order ID

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 789,
    "orderNumber": "CV202509-000001",
    "status": "accepted",
    "customerName": "Айгуль Сатыбалдиева",
    "customerPhone": "+77015211545",
    "customerEmail": "aigul@example.com",
    "recipientName": "Анара Касымова",
    "recipientPhone": "+77017654321",
    "deliveryAddress": "пр. Достык, 123, кв. 45",
    "deliveryDate": "2025-09-01",
    "deliveryTime": "14:00",
    "deliveryInstructions": "Позвонить за 30 минут",
    "subtotal": "5000.00",
    "deliveryCost": "1000.00",
    "totalAmount": "6000.00",
    "paymentMethod": "kaspi",
    "paymentReference": "KP123456789",
    "floristName": "Марина Петрова",
    "courierName": "Асхат Нуров",
    "items": [
      {
        "productTitle": "Букет роз 'Классик'",
        "productType": "vitrina",
        "quantity": 1,
        "unitPrice": "5000.00",
        "totalPrice": "5000.00",
        "selectedColor": "Красный",
        "customMessage": "С днем рождения!"
      }
    ],
    "history": [
      {
        "status": "new",
        "changedAt": "2025-08-31T15:30:00Z",
        "comment": "Заказ создан"
      },
      {
        "status": "accepted",
        "changedAt": "2025-08-31T16:00:00Z",
        "changedBy": "Марина Петрова",
        "comment": "Принят флористом"
      }
    ]
  }
}
```

### GET `/api/v2/order/allowed-statuses`
Get allowed status transitions for an order.

**Parameters:**
- `id` (required): `string | number` - Order ID

**Example Response:**
```json
{
  "status": true,
  "data": {
    "id": 789,
    "current": "accepted",
    "allowed": ["assembled", "cancelled"]
  }
}
```

### POST `/api/v2/order/change-status`
Change order status.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "id": 789,
  "statusId": "CO", // Backend status code
  "comment": "Букет готов к доставке"
}
```

**Status Code Mapping:**
- `new` → `N`
- `paid` → `PD` 
- `accepted` → `AP`
- `assembled` → `CO`
- `in-transit` → `DE`
- `completed` → `F`

### DELETE `/api/v2/orders/delete`
Delete an order.

**Parameters:**
- `id` (required): `string | number` - Order ID

---

## Error Handling

### Common Error Codes

**Authentication Errors:**
```json
{
  "status": false,
  "error": "token_error",
  "message": "Bad Token!!!"
}
```

**Validation Errors:**
```json
{
  "status": false,
  "error": "validation_error",
  "message": "Required field missing: title"
}
```

**Not Found Errors:**
```json
{
  "status": false,
  "error": "not_found",
  "message": "Product not found"
}
```

**Server Errors:**
```json
{
  "status": false,
  "error": "server_error", 
  "message": "Internal server error"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- **Rate Limit**: 100 requests per minute per token
- **Headers**: 
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Webhooks (Legacy Bitrix Integration)

### Product Sync Webhook
**URL**: `https://cvety.kz/api/webhooks/bitrix/products`
**Method**: `POST`
**Purpose**: Synchronize product changes from Bitrix CRM

**Payload Example:**
```json
{
  "event": "product.update",
  "data": {
    "id": 123,
    "xmlId": "BITRIX_PRODUCT_456",
    "title": "Updated Product Title",
    "price": 7500.00,
    "isActive": true
  }
}
```

### Order Sync Webhook
**URL**: `https://cvety.kz/api/webhooks/bitrix/orders`
**Method**: `POST`
**Purpose**: Synchronize order changes from Bitrix CRM

---

## SDK Examples

### JavaScript/TypeScript (CRM3 Client)
```typescript
import { apiClient } from '@/api/client';

// Fetch products
const products = await apiClient.products.list({
  type: 'vitrina',
  limit: 10
});

// Create product
const newProduct = await apiClient.products.create({
  title: 'New Bouquet',
  type: 'catalog',
  price: 8000
});

// Upload images
const images = await apiClient.uploads.images(fileList);
```

### cURL Examples
```bash
# List products
curl "https://cvety.kz/api/v2/products/?access_token=YOUR_TOKEN"

# Create order
curl -X POST "https://cvety.kz/api/v2/orders/?access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "customerPhone": "+77015211545",
    "deliveryDate": "2025-09-01",
    "items": [{"productId": 123, "quantity": 1}]
  }'
```

---

## Environment Configuration

### Production
```env
VITE_API_BASE=https://cvety.kz/api
VITE_API_TOKEN=ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144
VITE_CITY_ID=1
```

### Development  
```env
VITE_API_BASE=/api
VITE_API_TOKEN=ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144
VITE_CITY_ID=2
```

This API documentation provides complete coverage of all endpoints used by the cvety.kz CRM system, enabling full restoration and integration capabilities.