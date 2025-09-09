# Полная документация всех API endpoints cvety.kz

**Обновлено**: 2025-09-05  
**Источники**: Production API + Local Development APIs

## 🏗️ Архитектура API

### 1. Production API (https://cvety.kz)
- **Базовый URL**: `https://cvety.kz/api/v2/`
- **Авторизация**: `?access_token=<TOKEN>`; для части эндпоинтов также поддерживается `Authorization: Bearer <TOKEN>`
- **Формат**: REST API с JSON ответами

### 2. Local Development APIs
- **PHP API**: `/Users/alekenov/cvety-local/public/api/v2/`
- **Python API**: `localhost:8001` (FastAPI с Supabase)
- **Proxy**: Vite dev server проксирует локальные endpoints

---

## 📦 ПРОДУКТЫ (Products) - Production ✅

### GET /api/v2/products
**Статус**: ✅ Работает  
**Описание**: Получение списка продуктов (витрина/каталог) с фильтрами, поддержка заголовка Authorization: Bearer и X-City.

```bash
curl "https://cvety.kz/api/v2/products?type=vitrina&limit=10&access_token=TOKEN"
# Либо через заголовок авторизации и город
curl -H "Authorization: Bearer TOKEN" -H "X-City: 2" "https://cvety.kz/api/v2/products?type=catalog&limit=10"
```

**Параметры**:
- `type`: `vitrina` | `catalog`
- `isAvailable`: boolean
- `limit`: number (по умолчанию 20, max 100)
- `offset`: number (по умолчанию 0)
- `cityId`: number (опционально; также можно через заголовок `X-City`)

**Особенности**:
- Авторизация: `access_token` в query или `Authorization: Bearer <TOKEN>`
- Формат даты: поля формируются в ISO 8601 где возможно
- Цена: строка с символом валюты (например, `"20 000 ₸"`)
- Система использует Bitrix компонент `catalog.section` и внутренние фильтры магазина

### GET /api/v2/products/detail
**Статус**: ✅ Работает  
**Описание**: Детальная информация о товаре

```bash
curl "https://cvety.kz/api/v2/products/detail?id=696885&access_token=TOKEN"
```

**Ответ (сокращенно)**:
- `id`, `title`, `image`/`images`
- `price` (строка `"20 000 ₸"`)
- `isAvailable`, `isReady`, `type`
- Доп. свойства: размеры, состав, время сборки (категория `short|medium|long`)
  
Примечание: детализация может достраиваться из связанных таблиц (basket/iblock) — часть полей может отсутствовать для некоторых элементов.

### POST /api/v2/product/create
**Статус**: ⚠️ Требует настройки  
**Описание**: Создание нового товара

```bash
curl -X POST "https://cvety.kz/api/v2/product/create?access_token=TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"SKU-123","title":"Новый букет","price":25000,"ownerId":17008}'
```

### POST /api/v2/product/update-status
**Статус**: ❌ 405 Method Not Allowed  
**Описание**: Обновление статуса товара

### POST /api/v2/product/properties
**Статус**: ❌ 405 Method Not Allowed  
**Описание**: Обновление свойств товара (размеры)

### POST /api/v2/product/price
**Статус**: ⚠️ Требует проверки  
**Описание**: Обновление цены товара

### DELETE /api/v2/products/delete
**Статус**: ⚠️ Требует проверки  
**Описание**: Удаление товара

---

## 📋 ЗАКАЗЫ (Orders) - Production ✅

### GET /api/v2/orders
**Статус**: ✅ Работает  
**Описание**: Список заказов

```bash
curl "https://cvety.kz/api/v2/orders?status=accepted&limit=10&access_token=TOKEN"
```

**Поля статуса в ответе**:
- `status_id`: BX‑код (`N`, `PD`, `AP`, `CO`, `DE`, `F`)
- `status_key`: ключ для фронта (`new`, `paid`, `accepted`, `assembled`, `in-transit`, `completed`)
- `status_name`: русское имя статуса (например, `"Принят"`)

Пример (сокращено):
```json
{
  "success": true,
  "data": [
    {
      "id": 122598,
      "number": "122598",
      "status_id": "DE",
      "status_key": "in-transit",
      "status_name": "В пути",
      "createdAt": "2025-09-05T13:10:52+05:00"
    }
  ],
  "pagination": { "total": 152, "limit": 10, "offset": 0, "hasMore": true }
}
```

### GET /api/v2/orders/detail
**Статус**: ✅ Работает  
**Описание**: Детали заказа (нормализованный ответ, ISO‑даты, маппинг статусов)

```bash
curl "https://cvety.kz/api/v2/orders/detail?id=122578&access_token=TOKEN"
```

**Ответ (сокращенно)**:
```json
{
  "success": true,
  "data": {
    "id": "122578",
    "number": "122578",
    "status": "accepted",              // маппинг из BX к фронтовому ключу
    "createdAt": "2025-09-05T11:28:10+05:00",
    "selectedProduct": { "image": "https://...", "title": "...", "quantity": 1 },
    "additionalItems": [ { "image": "https://...", "title": "...", "quantity": 1 } ],
    "deliveryType": "delivery|pickup",
    "deliveryAddress": "улица, дом...",
    "deliveryDate": "today|tomorrow|ISO",
    "deliveryTime": "12:00-14:00",
    "deliveryCity": "Алматы",
    "recipient": { "name": "Иван П.", "phone": "+7..." },
    "sender": { "name": "Мария К.", "phone": "+7...", "email": "..." },
    "postcard": "Подпись на открытке",
    "comment": "Комментарий",
    "anonymous": false,
    "payment": { "amount": "20 000 ₸", "status": "paid|unpaid", "method": null },
    "executor": { "florist": null, "courier": "Имя курьера" },
    "history": []
  }
}
```

### GET /api/v2/order/allowed-statuses
**Статус**: ✅ Работает  
**Описание**: Разрешенные статусы для заказа

```bash
curl "https://cvety.kz/api/v2/order/allowed-statuses?id=122578&access_token=TOKEN"
```

**Статусы**:
- `N` - New (новый)
- `PD` - Paid (оплачен) 
- `AP` - Accepted (принят)
- `CO` - Completed (собран)
- `DE` - Delivery (в доставке)
- `F` - Finished (завершен)

### POST /api/v2/order/change-status
**Статус**: ✅ Работает  
**Описание**: Изменение статуса заказа (принимает `access_token` или `Authorization: Bearer`)

```bash
curl -X POST "https://cvety.kz/api/v2/order/change-status?access_token=TOKEN" \
  -d "id=122578&statusId=AP&comment=Принято"
```

**Параметры**:
- `id`: number — ID заказа (обязателен)
- `statusId`: string — BX‑код статуса (`N`, `PD`, `AP`, `CO`, `DE`, `F`) (обязателен)
- `comment`: string — комментарий к смене статуса (опционально)

**Ответ**:
```json
{
  "status": true,
  "data": {
    "id": 122578,
    "oldStatus": "N",
    "newStatus": "AP",
    "changed": true,
    "changedAt": "2025-09-05T13:25:01+05:00"
  },
  "timestamp": "2025-09-05T13:25:01+05:00"
}
```

### DELETE /api/v2/orders/delete
**Статус**: ⚠️ Требует проверки  
**Описание**: Удаление заказа

---

## 🏪 МАГАЗИНЫ (Shops) - Production ✅

### GET /api/v2/shop/list
**Статус**: ✅ Работает  
**Описание**: Список всех магазинов

```bash
curl "https://cvety.kz/api/v2/shop/list?access_token=TOKEN"
```

**Ответ**:
```json
{
  "success": true,
  "data": [
    {
      "id": 17008,
      "xml_id": "cvetykz",
      "name": "Cvety.kz",
      "city": "2"
    }
  ]
}
```

---

## 👥 КЛИЕНТЫ (Customers) - Production ✅

### GET /api/v2/customers/
**Статус**: ✅ Работает  
**Описание**: Базовый список клиентов (исторический эндпоинт Bitrix‑роутера). Может иметь отличающиеся форматы дат.

```bash
curl "https://cvety.kz/api/v2/customers/?limit=20&offset=0&access_token=TOKEN"
```

### GET /api/v2/customers/with-stats/
**Статус**: ✅ Работает (оптимизировано)  
**Описание**: Список клиентов с агрегированной статистикой (2‑шаговая агрегация + кэш 5 минут). Поддерживает page/limit, keyset‑пагинацию и быстрый total.

```bash
# Страница 1 (page/limit)
curl "https://cvety.kz/api/v2/customers/with-stats/?page=1&limit=20&access_token=TOKEN"

# Keyset‑страница (после указанного ID)
curl "https://cvety.kz/api/v2/customers/with-stats/?after_id=171700&limit=20&access_token=TOKEN"

# Вернуть общий total (кэш 1 час)
curl "https://cvety.kz/api/v2/customers/with-stats/?page=1&limit=20&total=true&access_token=TOKEN"
```

**Параметры**:
- `page`: number (>=1)
- `limit`: number (1..100)
- `after_id`: number — ID клиента, после которого возвращать следующую страницу (альтернатива page/offset)
- `only_with_orders`: boolean — только клиенты с заказами
- `total`: boolean — вернуть `pagination.total` (подсчитан и закэширован на 1 час)

**Ответ**:
```json
{
  "success": true,
  "status": true,
  "data": {
    "customers": [
      {
        "id": 171700,
        "login": "77770550772@cvety.kz",
        "name": "Unknown",
        "original_name": "Unknown",
        "last_name": "",
        "email": "77770550772@cvety.kz",
        "phone": "+77770550772",
        "member_since": "2025-09-05T05:07:48+05:00",
        "total_orders": 1,
        "completed_orders": 1,
        "pending_orders": 0,
        "total_spent": 9500,
        "average_check": 9500,
        "last_order_date": "2025-09-05T05:07:48+05:00",
        "status": "active"
      }
    ],
    "pagination": {
      "total": 107555,          
      "page": 1,                 
      "limit": 20,
      "pages": 2,                
      "next_after_id": 171697    
    },
    "filters": { "only_with_orders": false }
  }
}
```

### GET /api/v2/customers/{id}
**Статус**: ✅ Работает  
**Описание**: Детали клиента. Текущая реализация возвращает заказы внутри `data.orders` (даже без `include`), форматы дат могут отличаться от ISO.

```bash
curl "https://cvety.kz/api/v2/customers/171690?access_token=TOKEN"
```

### GET /api/v2/customers/{id}/orders
**Статус**: ✅ Работает (REST‑алиас)  
**Описание**: Заказы клиента с пагинацией и нормализованными полями.

```bash
curl "https://cvety.kz/api/v2/customers/171690/orders?page=1&limit=20&access_token=TOKEN"
```

**Параметры**:
- `page`: number (>=1)
- `limit`: number (1..100)
- `status`: string (BX‑код, опционально)

**Ответ**:
```json
{
  "success": true,
  "status": true,
  "data": [
    { "id": 122576, "date": "2025-09-04T11:28:10+05:00", "total": 9500, "currency": "KZT", "status_id": "F" }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "pages": 1 }
}
```

---

## 📤 ЗАГРУЗКИ (Uploads) - Production ⚠️

### POST /api/v2/uploads/images
**Описание**: Загрузка изображений  
**Формат**: multipart/form-data

```bash
curl -X POST "https://cvety.kz/api/v2/uploads/images?access_token=TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### POST /api/v2/uploads/videos
**Описание**: Загрузка видео  
**Формат**: multipart/form-data

---

## 👤 ПРОФИЛЬ (Profile) - Local PHP API ✅

**Расположение**: `/Users/alekenov/cvety-local/public/api/v2/profile/`  
**Контроллер**: `ProfileController.php`

### GET /api/v2/profile
**Статус**: ✅ Работает локально  
**Описание**: Получение профиля флориста

**Ответ**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Администратор",
    "phone": "+7 (777) 000-00-01",
    "position": "owner",
    "bio": "Владелец цветочного магазина",
    "avatar": null,
    "can_edit": true,
    "positions": ["owner", "senior", "florist", "assistant"]
  }
}
```

### PUT /api/v2/profile
**Статус**: ✅ Работает локально  
**Описание**: Обновление профиля

```json
{
  "name": "Новое имя",
  "phone": "+7 (777) 123-45-67",
  "position": "senior",
  "bio": "Обновленная биография"
}
```

**Валидация**:
- `name`: string, 2-255 символов
- `phone`: телефонный формат
- `position`: enum (owner, senior, florist, assistant)
- `bio`: string, максимум 1000 символов

---

## 🏢 ИНФОРМАЦИЯ О МАГАЗИНЕ (Shop Info) - Local PHP API ✅

**Расположение**: `/Users/alekenov/cvety-local/public/api/v2/shop-info/`

### GET /api/v2/shop-info
**Статус**: ✅ Работает локально  
**Описание**: Информация о магазине

**Ответ**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Цветы.kz",
    "address": "г. Алматы, ул. Абая 150/230",
    "phone": "+7 (727) 378-88-88",
    "working_hours": "Пн-Вс: 9:00-21:00",
    "city": "Алматы",
    "social_media": {
      "instagram": "https://instagram.com/cvety.kz",
      "whatsapp": "+77273788888",
      "telegram": null
    }
  }
}
```

### PUT /api/v2/shop-info
**Статус**: ✅ Работает локально  
**Описание**: Обновление информации о магазине

---

## 👨‍💼 СОТРУДНИКИ (Colleagues) - Local PHP API ✅

**Расположение**: `/Users/alekenov/cvety-local/public/api/v2/colleagues/`

### GET /api/v2/colleagues
**Статус**: ✅ Работает локально  
**Описание**: Список сотрудников

**Параметры**:
- `isActive`: boolean - только активные
- `position`: string - фильтр по должности
- `limit`: number (по умолчанию 200)
- `offset`: number (по умолчанию 0)

### POST /api/v2/colleagues
**Статус**: ✅ Работает локально  
**Описание**: Создание нового сотрудника

```json
{
  "name": "John Doe",
  "phone": "+7 (777) 123-45-67",
  "position": "florist",
  "isActive": true
}
```

### PUT /api/v2/colleagues/{id}
**Статус**: ✅ Работает локально  
**Описание**: Обновление сотрудника

### PATCH /api/v2/colleagues/{id}/toggle
**Статус**: ✅ Работает локально  
**Описание**: Переключение статуса активности

### DELETE /api/v2/colleagues/{id}
**Статус**: ✅ Работает локально  
**Описание**: Удаление сотрудника

---

## 📦 ИНВЕНТАРЬ (Inventory) - Production ✅

### GET /api/v2/inventory
**Статус**: ✅ Работает  
**Описание**: Список складских позиций магазина (по умолчанию 17008), поиск и фильтры.

```bash
curl "https://cvety.kz/api/v2/inventory/?limit=20&offset=0&access_token=TOKEN"
curl -H "Authorization: Bearer TOKEN" "https://cvety.kz/api/v2/inventory/?search=роза&limit=20"
```

**Параметры**:
- `limit`: number (1..100)
- `offset`: number (>=0)
- `search` | `q`: string — поиск по имени/локации/цветку
- `service`: boolean — услуги (true) / товары (false)
- `active`: boolean — только активные
- `shopId`: number — магазин (по умолчанию 17008)
- `cityId` | заголовок `X-City`: number — город

**Ответ (сокращенно)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Лента",
      "cost": 150,
      "quantity": 20,
      "markup": 0,
      "location": "Склад-1",
      "image": "https://cvety.kz/upload/...",
      "images": ["https://cvety.kz/upload/..."],
      "service": false,
      "flower": "rose-red",
      "deactivate": false
    }
  ],
  "pagination": { "total": 250, "limit": 20, "offset": 0, "hasMore": true }
}
```

### GET /api/v2/inventory/item
**Статус**: ✅ Работает  
**Описание**: Получение позиции по `id`.

```bash
curl "https://cvety.kz/api/v2/inventory/item?id=123&access_token=TOKEN"
```

### POST /api/v2/inventory/create
**Статус**: ✅ Работает  
**Описание**: Создание новой позиции (multipart/form-data для изображений).

```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -F "name=Лента" -F "quantity=10" -F "cost=150" \
  -F "images[]=@/path/to/photo.jpg" \
  "https://cvety.kz/api/v2/inventory/create"
```

### POST /api/v2/inventory/update
**Статус**: ✅ Работает  
**Описание**: Обновление позиции (поддержка файлов `images[]`, флаги service/deleteImage, shopId).

```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -F "id=123" -F "name=Лента узкая" -F "quantity=12" -F "cost=140" \
  -F "deleteImage=true" \
  "https://cvety.kz/api/v2/inventory/update"
```

### GET /api/v2/inventory/history
**Статус**: ✅ Работает  
**Описание**: История движений по складу (store, shopId), с пагинацией.

```bash
curl -H "Authorization: Bearer TOKEN" "https://cvety.kz/api/v2/inventory/history?limit=50&offset=0&shopId=17008"
```

### 🌺 Управление цветами (Flowers API)

#### GET /api/flowers/search
**Статус**: ✅ Работает локально  
**Описание**: Поиск цветов по названию

#### POST /api/flowers/delivery
**Статус**: ✅ Работает локально  
**Описание**: Добавление поставки цветов

```json
{
  "flower_id": "rose-red",
  "quantity": 100,
  "supplier": "Цветочная база",
  "price": 120,
  "delivery_date": "2025-09-04"
}
```

#### POST /api/flowers/writeoff
**Статус**: ✅ Работает локально  
**Описание**: Списание цветов

```json
{
  "flower_id": "rose-red",
  "quantity": 10,
  "reason": "Некачественные",
  "note": "Повреждены при транспортировке"
}
```

---

## 🔄 ИНТЕГРАЦИЯ И СИНХРОНИЗАЦИЯ

### Автоматическое управление инвентарем

При создании/отмене заказов система автоматически:

1. **При создании заказа** (`validate_and_update_inventory("reserve")`):
   - Проверяет наличие товаров
   - Резервирует количество в складе
   - Списывает цветы по составу букетов
   - Создает записи в `flower_inventory_movements`

2. **При отмене заказа** (`validate_and_update_inventory("release")`):
   - Возвращает товары на склад
   - Восстанавливает цветы в инвентаре
   - Создает компенсирующие записи движения

### Структура данных

**Таблицы Supabase**:
- `flowers` - справочник цветов
- `flower_inventory_movements` - движения цветов
- `products` - продукция (букеты)
- `inventory_movements` - движения продукции
- `orders` / `order_items` - заказы
- `florist_profiles` - профили флористов
- `shop_info` - информация о магазине
- `colleagues` - сотрудники

---

## 🎯 РЕКОМЕНДАЦИИ ПО ИСПОЛЬЗОВАНИЮ

### Production endpoints (cvety.kz):
- ✅ Продукты: полностью рабочие для чтения
- ✅ Заказы: полностью рабочие
- ✅ Магазины: работают
- ✅ Клиенты: базовый функционал работает
- ⚠️ POST endpoints: требуют исправления 405 ошибок

### Local development endpoints:
- ✅ Profile API (PHP): готов к использованию
- ✅ Shop Info API (PHP): готов к использованию  
- ✅ Colleagues API (PHP): готов к использованию
- ✅ Inventory API (Python): полнофункциональная система управления складом

### Настройка разработки:

1. **Vite proxy** в `vite.config.ts`:
```javascript
proxy: {
  '^/api/v2/(profile|shop-info|colleagues)': {
    target: 'http://localhost:8001',  // Python API
    changeOrigin: true
  },
  '^/api/*': {
    target: 'https://cvety.kz',  // Production API
    changeOrigin: true
  }
}
```

2. **Python API запуск**: `uvicorn app:app --host 0.0.0.0 --port 8001`

3. **Подключение к базе**: SSH tunnel к production Supabase через `185.125.90.141`

Система полностью готова для комплексного CRM функционала с управлением продуктами, заказами, клиентами, инвентарем и персоналом.
