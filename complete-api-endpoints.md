# Полная документация всех API endpoints cvety.kz

**Обновлено**: 2025-09-04  
**Источники**: Production API + Local Development APIs

## 🏗️ Архитектура API

### 1. Production API (https://cvety.kz)
- **Базовый URL**: `https://cvety.kz/api/v2/`
- **Авторизация**: `?access_token=ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144`
- **Формат**: REST API с JSON ответами

### 2. Local Development APIs
- **PHP API**: `/Users/alekenov/cvety-local/public/api/v2/`
- **Python API**: `localhost:8001` (FastAPI с Supabase)
- **Proxy**: Vite dev server проксирует локальные endpoints

---

## 📦 ПРОДУКТЫ (Products) - Production ✅

### GET /api/v2/products
**Статус**: ✅ Работает  
**Описание**: Получение списка всех продуктов

```bash
curl "https://cvety.kz/api/v2/products?type=vitrina&limit=10&access_token=TOKEN"
```

**Параметры**:
- `type`: `vitrina` | `catalog`
- `isAvailable`: boolean
- `limit`: number (по умолчанию 20, max 100)
- `offset`: number (по умолчанию 0)

### GET /api/v2/products/detail
**Статус**: ✅ Работает  
**Описание**: Детальная информация о товаре

```bash
curl "https://cvety.kz/api/v2/products/detail?id=696885&access_token=TOKEN"
```

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

### GET /api/v2/orders/detail
**Статус**: ✅ Работает  
**Описание**: Детали заказа

```bash
curl "https://cvety.kz/api/v2/orders/detail?id=122578&access_token=TOKEN"
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
**Статус**: ⚠️ Требует проверки  
**Описание**: Изменение статуса заказа

```bash
curl -X POST "https://cvety.kz/api/v2/order/change-status?access_token=TOKEN" \
  --data "id=122578&statusId=AP&comment=Принято"
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
**Описание**: Список клиентов с базовой статистикой

```bash
curl "https://cvety.kz/api/v2/customers/?access_token=TOKEN"
```

### GET /api/v2/customers/orders.php
**Статус**: ⚠️ Требует CUSTOMER_ID  
**Описание**: Заказы конкретного клиента

```bash
curl "https://cvety.kz/api/v2/customers/orders.php?CUSTOMER_ID=171690&access_token=TOKEN"
```

### GET /api/v2/customers/with-stats/
**Статус**: ❌ 500 Internal Server Error  
**Проблема**: Отсутствует файл index.php

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

## 📦 ИНВЕНТАРЬ (Inventory) - Local Python API ✅

**Базовый URL**: `localhost:8001` (FastAPI)  
**База данных**: Supabase

### 🌸 Управление цветами

#### GET /crm/inventory
**Статус**: ✅ Работает локально  
**Описание**: Страница управления инвентарем цветов

**Параметры**:
- `search`: string - поиск по названию
- `page`: number - номер страницы

#### POST /api/inventory/update
**Статус**: ✅ Работает локально  
**Описание**: Обновление количества одного товара

```json
{
  "product_id": "123",
  "quantity": 10,
  "note": "Пополнение склада"
}
```

#### POST /api/inventory/bulk-update
**Статус**: ✅ Работает локально  
**Описание**: Массовое обновление количества

```json
{
  "updates": [
    {"product_id": "123", "quantity": 15},
    {"product_id": "124", "quantity": 8}
  ]
}
```

#### GET /api/inventory/low-stock
**Статус**: ✅ Работает локально  
**Описание**: Товары с низким остатком

**Параметры**:
- `threshold`: number (по умолчанию 5) - порог низкого остатка

#### POST /api/inventory/delivery
**Статус**: ✅ Работает локально  
**Описание**: Добавление поставки товаров

```json
{
  "flower_id": "rose-red",
  "quantity": 50,
  "supplier": "Поставщик роз",
  "price": 150,
  "note": "Еженедельная поставка"
}
```

#### POST /api/inventory/writeoff
**Статус**: ✅ Работает локально  
**Описание**: Списание товаров со склада

```json
{
  "flower_id": "rose-red",
  "quantity": 5,
  "reason": "Увядшие цветы",
  "note": "Не проданы в срок"
}
```

#### GET /api/inventory/history
**Статус**: ✅ Работает локально  
**Описание**: История движения товаров

**Параметры**:
- `flower_id`: string (optional) - конкретный цветок
- `limit`: number (по умолчанию 50)

**Ответ**:
```json
{
  "success": true,
  "data": [
    {
      "id": "mov_123",
      "flower_id": "rose-red",
      "flower_name": "Роза красная",
      "movement_type": "delivery",
      "quantity": 50,
      "reason": "Поставка от поставщика",
      "created_at": "2025-09-04T10:00:00Z"
    }
  ]
}
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