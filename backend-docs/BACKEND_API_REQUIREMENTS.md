# Backend API Requirements для цветочного магазина

## 📋 Обзор
Это документ описывает все API endpoints и структуры данных, необходимые для работы фронтенд приложения управления цветочным магазином.

## 🏗️ Архитектура системы

### Основные принципы:
1. **Складские материалы** - основа системы (цветы, зелень, аксессуары)
2. **Товары (букеты)** - состоят из складских материалов + работа флориста
3. **Серийная система** - каждая поставка создает новую серию с датой
4. **Себестоимость** - рассчитывается из стоимости материалов + работы флориста

### Связи компонентов:
```
Inventory Items (склад) ←→ Product Ingredients ←→ Products (товары)
                                ↓
                           Order Items (заказы)
```

## 🏗️ Основные сущности

### 1. 📦 Inventory Items (Складские товары)

#### Структура данных InventoryItem:
```typescript
interface InventoryItem {
  id: number;
  name: string;                         // Название товара на складе
  category: 'flowers' | 'greenery' | 'accessories';
  price: string;                        // Цена за единицу "450 ₸"
  unit: string;                         // Единица измерения
  quantity: number;                     // Текущий остаток
  minQuantity: number;                  // Минимальный остаток
  supplier: string;                     // Поставщик
  image: string;                        // URL изображения
  lastDelivery: string;                 // ISO дата последней поставки
  nextDelivery?: string;                // ISO дата следующей поставки
  createdAt: string;                    // ISO дата создания
  updatedAt: string;                    // ISO дата обновления
}

interface InventoryTransaction {
  id: number;
  inventoryItemId: number;
  type: 'receipt' | 'consumption' | 'adjustment' | 'waste';
  quantity: number;                     // Количество (может быть отрицательным)
  pricePerUnit?: string;                // Цена за единицу при поступлении
  referenceType?: string;               // Тип связанной операции
  referenceId?: string;                 // ID связанной операции
  comment?: string;                     // Комментарий
  createdAt: string;                    // ISO дата операции
  createdBy?: string;                   // Кто создал операцию
}
```

#### API Endpoints для складских товаров:

**GET /api/inventory**
- Возвращает список складских товаров
- Query параметры:
  - `category?: 'flowers' | 'greenery' | 'accessories'` - фильтр по категории
  - `lowStock?: boolean` - только товары с низким остатком
  - `limit?: number` - лимит записей
  - `offset?: number` - смещение

**GET /api/inventory/:id**
- Возвращает конкретный складской товар по ID

**POST /api/inventory**
- Создает новый складской товар
- Body: InventoryItem (без id, createdAt, updatedAt)

**PUT /api/inventory/:id**
- Обновляет складской товар
- Body: Partial<InventoryItem>

**DELETE /api/inventory/:id**
- Удаляет складской товар

**GET /api/inventory/:id/transactions**
- Возвращает историю движения товара
- Query параметры:
  - `type?: string` - фильтр по типу операции
  - `dateFrom?: string` - с какой даты
  - `dateTo?: string` - по какую дату

**POST /api/inventory/:id/transactions**
- Создает операцию движения товара (поступление/расход)
- Body: InventoryTransaction (без id, createdAt)

**GET /api/inventory/analytics**
- Возвращает аналитику по складу
```typescript
interface InventoryAnalytics {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: string;
  categoryBreakdown: {
    flowers: number;
    greenery: number;
    accessories: number;
  };
  recentTransactions: InventoryTransaction[];
}
```

### 2. 🌸 Products (Товары)

#### Структура данных Product:
```typescript
interface Product {
  id: number;
  image: string;                    // URL главного изображения
  images?: string[];               // Массив URL всех изображений
  title: string;                   // Название товара
  price: string;                   // Цена в формате "12 000 ₸"
  isAvailable: boolean;            // Активен ли товар
  createdAt: string;              // ISO дата создания
  type: 'vitrina' | 'catalog';    // Тип товара
  
  // Поля для типа 'vitrina'
  width?: string;                  // Ширина в см
  height?: string;                 // Высота в см
  
  // Поля для типа 'catalog'
  video?: string;                  // URL видео
  duration?: string;               // Время изготовления в минутах
  discount?: string;               // Процент скидки
  ingredients?: ProductIngredient[]; // Состав букета из складских материалов
  floristWorkCost?: string;        // Стоимость работы флориста
  colors?: string[];              // Цвета букета ['pink', 'red', 'white']
  catalogWidth?: string;          // Ширина каталожного товара
  catalogHeight?: string;         // Высота каталожного товара
  productionTime?: string;        // 'short' | 'medium' | 'long'
}

interface ProductIngredient {
  inventoryItemId: number;         // ID товара на складе
  name: string;                    // Название материала (для отображения)
  quantity: number;                // Количество единиц
  unit: string;                    // Единица измерения
  costPerUnit: string;             // Себестоимость за единицу
}
```

#### API Endpoints для товаров:

**GET /api/products**
- Возвращает список всех товаров
- Query параметры:
  - `type?: 'vitrina' | 'catalog'` - фильтр по типу
  - `isAvailable?: boolean` - фильтр по активности
  - `limit?: number` - лимит записей
  - `offset?: number` - смещение для пагинации

**GET /api/products/:id**
- Возвращает конкретный товар по ID

**POST /api/products**
- Создает новый товар
- Body: Product (без id и createdAt)

**PUT /api/products/:id**
- Обновляет существующий товар
- Body: Partial<Product>

**PATCH /api/products/:id/toggle**
- Переключает статус активности товара
- Body: `{ isAvailable: boolean }`

**DELETE /api/products/:id**
- Удаляет товар

**GET /api/products/:id/ingredients**
- Возвращает состав товара из складских материалов

**PUT /api/products/:id/ingredients**
- Обновляет состав товара
- Body: `{ ingredients: ProductIngredient[], floristWorkCost?: number }`

**POST /api/products/:id/calculate-cost**
- Рассчитывает себестоимость товара на основе текущих цен материалов
- Response: `{ materialsCost: number, floristWorkCost: number, totalCost: number }`

### 2. 📦 Orders (Заказы)

#### Структура данных Order:
```typescript
interface Order {
  id: string;
  number: string;                           // Номер заказа (40414)
  status: OrderStatus;                      // Статус заказа
  createdAt: string;                       // ISO дата создания
  updatedAt: string;                       // ISO дата обновления
  
  // Связи с товарами (Foreign Keys)
  mainProductId: number;                   // ID основного товара
  mainProduct?: Product;                   // Данные основного товара (join)
  additionalItems?: OrderItem[];           // Дополнительные товары
  
  // Связи с клиентами (Foreign Keys)
  recipientId: number;                     // ID получателя
  senderId: number;                        // ID отправителя
  recipient?: Customer;                    // Данные получателя (join)
  sender?: Customer;                       // Данные отправителя (join)
  
  // Доставка
  deliveryType: 'delivery' | 'pickup';    // Тип получения
  deliveryAddress?: string;                // Адрес доставки
  deliveryDate: 'today' | 'tomorrow';     // Дата доставки
  deliveryTime: string;                    // Время доставки
  deliveryCity: string;                    // Город доставки
  
  // Дополнительная информация
  postcard?: string;                       // Текст открытки
  comment?: string;                        // Комментарий к заказу
  anonymous: boolean;                      // Анонимная доставка
  
  // Оплата
  payment: {
    amount: number;                        // Сумма к оплате
    status: 'paid' | 'unpaid';            // Статус оплаты
    method?: string;                       // Способ оплаты
  };
  
  // Исполнение
  executor?: {
    florist?: string;                      // Флорист
    courier?: string;                      // Курьер
  };
  
  // Фото
  photoBeforeDelivery?: string;           // URL фото до доставки
  
  // История
  history?: OrderHistoryItem[];            // История изменений
}

type OrderStatus = 'new' | 'paid' | 'accepted' | 'assembled' | 'in-transit' | 'completed';

interface OrderItem {
  id?: number;
  productId: number;                       // ID товара со склада
  productTitle: string;                   // Название товара
  productImage: string;                   // Изображение товара
  quantity: number;                       // Количество
  unitPrice: number;                      // Цена за единицу
  totalPrice: number;                     // Общая стоимость
}

interface OrderHistoryItem {
  date: string;                           // ISO дата
  description: string;                    // Описание события
  author?: string;                        // Кто сделал изменение
}

interface CreateOrderRequest {
  mainProductId: number;                  // ID основного товара
  recipientId: number;                    // ID получателя
  senderId: number;                       // ID отправителя
  additionalItems?: {
    productId: number;
    quantity: number;
  }[];
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  deliveryCity: string;
  deliveryDate: 'today' | 'tomorrow';
  deliveryTime: string;
  postcard?: string;
  comment?: string;
  anonymous?: boolean;
  paymentAmount: number;
}
```

#### API Endpoints для заказов:

**GET /api/orders**
- Возвращает список заказов
- Query параметры:
  - `status?: OrderStatus` - фильтр по статусу
  - `date?: string` - фильтр по дате
  - `limit?: number` - лимит записей
  - `offset?: number` - смещение

**GET /api/orders/:id**
- Возвращает конкретный заказ по ID

**POST /api/orders**
- Создает новый заказ
- Body: CreateOrderRequest

**PUT /api/orders/:id**
- Обновляет заказ
- Body: Partial<Order>

**PATCH /api/orders/:id/status**
- Обновляет статус заказа
- Body: `{ status: OrderStatus, comment?: string }`

**POST /api/orders/:id/photo**
- Загружает фото до доставки
- Body: FormData с файлом

**DELETE /api/orders/:id**
- Удаляет заказ

**GET /api/orders/:id/with-details**
- Возвращает заказ с полной информацией о товарах и клиентах
- Включает данные товаров, клиентов и историю

**POST /api/orders/:id/items**
- Добавляет дополнительные товары к заказу
- Body: `{ items: [{ productId: number, quantity: number }] }`

**DELETE /api/orders/:id/items/:itemId**
- Удаляет дополнительный товар из заказа

**PUT /api/orders/:id/customer**
- Обновляет клиентские данные заказа
- Body: `{ recipientId?: number, senderId?: number }`

**POST /api/orders/calculate-cost**
- Рассчитывает общую стоимость заказа
- Body: `{ mainProductId: number, additionalItems?: OrderItem[] }`
- Response: `{ mainProductCost: number, additionalItemsCost: number, totalCost: number }`

### 3. 👥 Customers (Клиенты)

#### Структура данных Customer:
```typescript
interface Customer {
  id: number;
  name: string;                         // Имя клиента
  phone: string;                        // Телефон в формате "+7 (777) 123-45-67"
  email?: string;                       // Email (опционально)
  memberSince: string;                  // ISO дата регистрации
  totalOrders: number;                  // Общее количество заказов
  totalSpent: number;                   // Общая сумма потраченных денег
  lastOrderDate?: string;               // ISO дата последнего заказа
  status: 'active' | 'vip' | 'inactive'; // Статус клиента
  notes?: string;                       // Заметки о клиенте
  createdAt: string;                    // ISO дата создания
  updatedAt: string;                    // ISO дата обновления
}
```

#### API Endpoints для клиентов:

**GET /api/customers**
- Возвращает список клиентов
- Query параметры:
  - `status?: 'active' | 'vip' | 'inactive'` - фильтр по статусу
  - `search?: string` - поиск по имени или телефону
  - `limit?: number` - лимит записей
  - `offset?: number` - смещение

**GET /api/customers/:id**
- Возвращает конкретного клиента по ID

**POST /api/customers**
- Создает нового клиента
- Body: 
```typescript
interface CreateCustomerRequest {
  name: string;     // Имя клиента
  phone: string;    // Телефон в формате "+7 (777) 123-45-67"
  email?: string;   // Email (опционально)
  notes?: string;   // Заметки (опционально)
}
```

**PUT /api/customers/:id**
- Обновляет клиента
- Body: Partial<Customer>

**DELETE /api/customers/:id**
- Удаляет клиента

**GET /api/customers/:id/orders**
- Возвращает заказы клиента
- Query параметры:
  - `status?: OrderStatus` - фильтр по статусу заказов
  - `limit?: number` - лимит записей

### 4. 👤 Profile & Team (Профиль и команда)

#### Структура данных FloristProfile:
```typescript
interface FloristProfile {
  id: number;
  name: string;                         // Имя флориста
  phone: string;                        // Телефон
  position: 'owner' | 'senior' | 'florist' | 'assistant'; // Должность
  bio?: string;                         // О себе
  avatar?: string;                      // URL аватара
  createdAt: string;                    // ISO дата создания
  updatedAt: string;                    // ISO дата обновления
}

interface ShopInfo {
  id: number;
  name: string;                         // Название магазина
  address: string;                      // Адрес
  phone: string;                        // Телефон магазина
  workingHours: string;                 // Часы работы
  city: string;                         // Город
  socialMedia?: {                       // Социальные сети
    instagram?: string;
    whatsapp?: string;
    telegram?: string;
  };
  updatedAt: string;                    // ISO дата обновления
}

interface Colleague {
  id: number;
  name: string;                         // Имя коллеги
  phone: string;                        // Телефон
  position: 'owner' | 'senior' | 'florist' | 'assistant'; // Должность
  isActive: boolean;                    // Активен ли коллега
  joinedDate: string;                   // ISO дата присоединения
  createdAt: string;                    // ISO дата создания
  updatedAt: string;                    // ISO дата обновления
}
```

#### API Endpoints для профиля и команды:

**GET /api/profile**
- Возвращает профиль текущего флориста

**PUT /api/profile**
- Обновляет профиль флориста
- Body: Partial<FloristProfile>

**GET /api/shop-info**
- Возвращает информацию о магазине

**PUT /api/shop-info**
- Обновляет информацию о магазине
- Body: Partial<ShopInfo>

**GET /api/colleagues**
- Возвращает список коллег
- Query параметры:
  - `isActive?: boolean` - фильтр по активности
  - `position?: string` - фильтр по должности

**POST /api/colleagues**
- Добавляет нового коллегу
- Body: Colleague (без id, createdAt, updatedAt)

**PUT /api/colleagues/:id**
- Обновляет коллегу
- Body: Partial<Colleague>

**PATCH /api/colleagues/:id/toggle**
- Переключает статус активности коллеги
- Body: `{ isActive: boolean }`

**DELETE /api/colleagues/:id**
- Удаляет коллегу

### 5. 📸 File Upload (Загрузка файлов)

**POST /api/uploads/images**
- Загружает изображения для товаров
- Body: FormData
- Response: `{ urls: string[] }`

**POST /api/uploads/videos**
- Загружает видео для товаров
- Body: FormData  
- Response: `{ url: string }`

### 6. 📊 Analytics (Аналитика)

**GET /api/analytics/dashboard**
- Возвращает данные для дашборда
```typescript
interface DashboardData {
  orders: {
    total: number;
    today: number;
    pending: number;
  };
  revenue: {
    total: string;
    today: string;
    thisMonth: string;
  };
  customers: {
    total: number;
    returning: number;
    vip: number;
    new: number;
  };
  team: {
    total: number;
    active: number;
    florists: number;
    assistants: number;
  };
  products: {
    total: number;
    active: number;
    vitrina: number;
    catalog: number;
  };
}
```

## 🔐 Authentication (если требуется)

**POST /api/auth/login**
- Авторизация
- Body: `{ email: string, password: string }`
- Response: `{ token: string, user: User }`

**POST /api/auth/logout**
- Выход из системы

**GET /api/auth/me**
- Получение текущего пользователя
- Headers: `Authorization: Bearer <token>`

## 📋 Дополнительные требования

### Коды ошибок:
- `200` - Успех
- `201` - Создано
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `422` - Ошибка валидации
- `500` - Внутренняя ошибка сервера

### Формат ответов:
```typescript
// Успешный ответ
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Ошибка
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Список с пагинацией
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

### Валидация:
- Все обязательные поля должны проверяться
- Номера телефонов в формате "+7 (000) 000-00-00"
- Email адреса должны быть валидными
- Цены в формате "12 000 ₸"
- Даты в ISO формате

### Особенности:
- Поддержка загрузки множественных изображений для товаров
- Автоматическая генерация номеров заказов
- История изменений заказов
- Мягкое удаление записей (soft delete)
- Возможность деактивации товаров без удаления

## 🔧 Рекомендуемый Tech Stack:
- **Backend**: Node.js + Express / Python + FastAPI / .NET Core
- **Database**: PostgreSQL / MongoDB
- **File Storage**: AWS S3 / Google Cloud Storage / MinIO
- **Authentication**: JWT tokens
- **Validation**: Joi / Zod / Class-validator

## 📞 Интеграции:
- **SMS**: Для уведомлений о заказах
- **WhatsApp Business API**: Для связи с клиентами
- **Payment Gateway**: Kaspi, CloudPayments и др.
- **Push Notifications**: Для уведомлений исполнителей