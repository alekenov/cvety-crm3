# Полная документация API v2 cvety.kz

**Базовый URL**: `https://cvety.kz`  
**Токен авторизации**: `ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144`  
**Дата тестирования**: 2025-09-04

## Статус тестирования

✅ **Работающие endpoints**: 11  
❌ **Неработающие endpoints**: 7  
📊 **Общий процент успешности**: 61%

---

## 📦 ПРОДУКТЫ (Products)

### ✅ GET /api/v2/products
**Статус**: Работает  
**Описание**: Получение списка всех продуктов

**Параметры**:
- `type` (optional): `vitrina` | `catalog` - тип товара
- `isAvailable` (optional): boolean - только доступные товары
- `limit` (optional): number (по умолчанию 20, максимум 100)
- `offset` (optional): number (по умолчанию 0)

**Пример запроса**:
```bash
curl "https://cvety.kz/api/v2/products?access_token=TOKEN"
```

**Ответ**:
```json
{
  "success": true,
  "data": [
    {
      "id": 696885,
      "image": "https://cvety.kz/upload/.../image.jpg",
      "images": ["https://cvety.kz/upload/.../image1.jpg"],
      "title": "Собранный букет",
      "price": "7 500 ₸",
      "isAvailable": true,
      "createdAt": "2025-08-01T10:00:00Z",
      "type": "vitrina",
      "width": "25",
      "height": "40"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### ✅ GET /api/v2/products?type=vitrina
**Статус**: Работает  
**Описание**: Получение списка готовых букетов (vitrina)

### ✅ GET /api/v2/products?type=catalog  
**Статус**: Работает  
**Описание**: Получение списка каталожных товаров

**Особенности каталожных товаров**:
- Имеют дополнительные поля: `catalogWidth`, `catalogHeight`, `productionTime`
- Могут иметь несколько изображений
- Содержат информацию о составе (`composition`)

### ✅ GET /api/v2/products/detail
**Статус**: Работает  
**Описание**: Получение детальной информации о товаре

**Параметры**:
- `id` (обязательный): number - ID товара

**Пример**:
```bash
curl "https://cvety.kz/api/v2/products/detail?id=696885&access_token=TOKEN"
```

### ✅ GET /api/v2/product/list/ (Legacy)
**Статус**: Работает  
**Описание**: Устаревший endpoint для получения списка товаров

**Особенности**:
- Возвращает данные в старом формате
- Содержит дополнительную информацию о доставке
- Используется для обратной совместимости

**Формат ответа**:
```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": 634493,
        "name": "Country blues 9 шт",
        "photo": "https://cvety.kz/upload/.../image.jpg",
        "currency": "KZT",
        "price": 9504,
        "deliveryTime": {
          "deadlineH": "21:30",
          "openShopH": "09:00",
          "timeMin": 180
        }
      }
    ]
  }
}
```

### ❌ POST /api/v2/product/update-status
**Статус**: Не работает (405 Method Not Allowed)  
**Проблема**: Ошибка "Only POST method allowed" при POST запросе

### ❌ POST /api/v2/product/properties
**Статус**: Не работает (405 Method Not Allowed)  
**Проблема**: Ошибка "Only POST method allowed" при POST запросе

---

## 📋 ЗАКАЗЫ (Orders)

### ✅ GET /api/v2/orders
**Статус**: Работает  
**Описание**: Получение списка заказов

**Параметры**:
- `status` (optional): `new|paid|accepted|assembled|in-transit|completed`
- `date` (optional): `YYYY-MM-DD`
- `limit` (optional): number (по умолчанию 20)
- `offset` (optional): number (по умолчанию 0)

**Пример**:
```bash
curl "https://cvety.kz/api/v2/orders?limit=5&access_token=TOKEN"
```

**Ответ**:
```json
{
  "success": true,
  "data": [
    {
      "id": 122578,
      "number": "122578",
      "status": "in-transit",
      "deliveryCity": null,
      "deliveryTime": null,
      "paymentAmount": "9 500 ₸",
      "paymentStatus": "Оплачен",
      "mainImage": "https://cvety.kz/upload/.../image.jpg"
    }
  ]
}
```

### ✅ GET /api/v2/orders/detail
**Статус**: Работает  
**Описание**: Получение детальной информации о заказе

**Параметры**:
- `id` (обязательный): number - ID заказа

**Пример**:
```bash
curl "https://cvety.kz/api/v2/orders/detail?id=122578&access_token=TOKEN"
```

### ✅ GET /api/v2/order/allowed-statuses
**Статус**: Работает  
**Описание**: Получение разрешенных статусов для заказа

**Ответ**:
```json
{
  "status": true,
  "data": {
    "id": 122578,
    "current": "DE",
    "allowed": ["F", "TR", "RO"]
  }
}
```

**Расшифровка статусов**:
- `N` - New (новый)
- `PD` - Paid (оплачен)
- `AP` - Accepted (принят)
- `CO` - Completed order (собран)
- `DE` - Delivery (в доставке)
- `F` - Finished (завершен)
- `TR` - Trouble (проблема)
- `RO` - Refund order (возврат)

### ✅ GET /api/v2/order/order-list (Legacy)
**Статус**: Работает  
**Описание**: Устаревший endpoint для получения заказов

**Особенности**:
- Более полная информация о заказе
- Содержит детали корзины, доставки, оплаты
- Используется для обратной совместимости

---

## 🏪 МАГАЗИНЫ (Shops)

### ✅ GET /api/v2/shop/list
**Статус**: Работает  
**Описание**: Получение списка всех магазинов в системе

**Ответ**:
```json
{
  "success": true,
  "data": [
    {
      "id": 304450,
      "xml_id": "304450",
      "name": "+77772820214",
      "city": "357"
    },
    {
      "id": 17008,
      "xml_id": "cvetykz", 
      "name": "Cvety.kz",
      "city": "2"
    }
  ]
}
```

**Важно**: Используется для определения `ownerId` при создании товаров.

---

## 👥 КЛИЕНТЫ (Customers)

### ✅ GET /api/v2/customers/
**Статус**: Работает  
**Описание**: Получение списка клиентов с базовой статистикой

**Ответ**:
```json
{
  "status": true,
  "success": true,
  "data": [
    {
      "ID": 171690,
      "LOGIN": "77055202323@cvety.kz",
      "NAME": "Unknown",
      "LAST_NAME": "",
      "EMAIL": "77055202323@cvety.kz",
      "PERSONAL_PHONE": "+77055202323",
      "DATE_REGISTER": "2025-09-04 11:28:09",
      "ACTIVE": "Y",
      "total_orders": 1,
      "completed_orders": 1,
      "pending_orders": 0,
      "total_spent": 9500,
      "average_order_value": 9500,
      "last_order_date": "2025-09-04 11:28:10"
    }
  ]
}
```

### ❌ GET /api/v2/customers/with-stats/
**Статус**: Не работает (500 Internal Server Error)  
**Проблема**: Отсутствует файл `/api/v2/customers/with-stats/index.php`

### ❌ GET /api/v2/customers/orders.php
**Статус**: Не работает (400 Bad Request)  
**Проблема**: Требует обязательный параметр `CUSTOMER_ID`

---

## 👤 ПРОФИЛЬ И CRM (Profile & CRM)

### ❌ GET /api/v2/profile
**Статус**: Не работает (401 Unauthorized)  
**Проблема**: Требует специальную авторизацию (не через access_token)

### ❌ GET /api/v2/shop-info
**Статус**: Не работает (401 Unauthorized)  
**Проблема**: Требует специальную авторизацию

### ❌ GET /api/v2/colleagues
**Статус**: Не работает (401 Unauthorized)  
**Проблема**: Требует специальную авторизацию

**Примечание**: Эти endpoints работают только в локальной разработке через Python API сервер (localhost:8001).

---

## 📤 ЗАГРУЗКИ (Uploads)

### POST /api/v2/uploads/images
**Описание**: Загрузка изображений  
**Формат**: multipart/form-data  
**Ожидаемый ответ**: `{ "success": true, "data": { "urls": ["..."] } }`

### POST /api/v2/uploads/videos
**Описание**: Загрузка видео  
**Формат**: multipart/form-data  
**Ожидаемый ответ**: `{ "success": true, "data": { "url": "..." } }`

---

## 🔧 УПРАВЛЕНИЕ ТОВАРАМИ (Product Management)

Следующие endpoints требуют правильной настройки Content-Type и метода:

### POST /api/v2/product/create
**Описание**: Создание нового товара

### POST /api/v2/product/update-status
**Описание**: Обновление статуса товара

### POST /api/v2/product/price
**Описание**: Обновление цены товара

### POST /api/v2/product/properties
**Описание**: Обновление свойств товара

### DELETE /api/v2/products/delete
**Описание**: Удаление товара

---

## 📊 СТАТИСТИКА ИСПОЛЬЗОВАНИЯ

### Работающие категории:
- ✅ **Продукты**: 4/6 endpoints (67%)
- ✅ **Заказы**: 4/4 endpoints (100%)
- ✅ **Магазины**: 1/1 endpoints (100%)
- ✅ **Клиенты**: 1/3 endpoints (33%)
- ❌ **Профиль**: 0/3 endpoints (0%)
- ❌ **Управление**: 0/2 endpoints (0%)

### Основные проблемы:
1. **405 Method Not Allowed** - неправильная настройка POST endpoints
2. **401 Unauthorized** - профильные endpoints требуют другой авторизации
3. **500 Internal Server Error** - отсутствующие файлы
4. **400 Bad Request** - отсутствующие обязательные параметры

### Рекомендации:
1. Исправить настройку POST методов для управления товарами
2. Настроить авторизацию для профильных endpoints
3. Восстановить отсутствующие файлы endpoints
4. Добавить валидацию обязательных параметров

---

## 🧪 ТЕСТИРОВАНИЕ

Для тестирования всех endpoints запустите:

```bash
node test-api-endpoints.js
```

Скрипт автоматически проверит все доступные endpoints и выведет подробный отчет.