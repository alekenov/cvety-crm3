# Схема базы данных для цветочного магазина

## 📋 Обзор
Эта схема базы данных поддерживает все функции приложения управления цветочным магазином: товары (витрина/каталог), заказы, клиенты, файлы и аналитика.

## 🏗️ Архитектурные принципы

### Основная концепция:
1. **inventory_items** - складские материалы (цветы, зелень, аксессуары)
2. **products** - готовые товары (букеты)  
3. **product_ingredients** - связь товаров со складскими материалами
4. **orders** - заказы клиентов

### Принцип работы:
- Букет = Складские материалы + Работа флориста
- Каждый товар имеет рецепт (ingredients) из складских материалов
- При создании заказа списываются материалы со склада
- Серийная система: новая поставка = новая серия товара

## 🗄️ Основные таблицы

### 1. 📦 inventory_items (Складские товары)

```sql
CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('flowers', 'greenery', 'accessories')),
    price DECIMAL(10,2) NOT NULL,         -- цена за единицу
    unit VARCHAR(20) NOT NULL,            -- единица измерения (шт, ветка, метр, грамм)
    quantity INTEGER NOT NULL DEFAULT 0,  -- текущий остаток
    min_quantity INTEGER NOT NULL DEFAULT 0, -- минимальный остаток
    supplier VARCHAR(255),
    image_url VARCHAR(500),
    last_delivery DATE,
    next_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_inventory_category (category),
    INDEX idx_inventory_quantity (quantity),
    INDEX idx_inventory_low_stock (quantity, min_quantity)
);
```

### 2. 📋 product_ingredients (Состав товаров)

```sql
CREATE TABLE product_ingredients (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    inventory_item_id BIGINT NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,       -- количество на единицу товара
    cost_per_unit DECIMAL(10,2) NOT NULL, -- себестоимость за единицу
    sort_order INTEGER DEFAULT 0,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id),
    INDEX idx_ingredients_product (product_id),
    INDEX idx_ingredients_inventory (inventory_item_id)
);
```

### 3. 📦 inventory_transactions (Движение товаров на складе)

```sql
CREATE TABLE inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('receipt', 'consumption', 'adjustment', 'waste')),
    quantity DECIMAL(8,2) NOT NULL,       -- может быть отрицательным для расходов
    price_per_unit DECIMAL(10,2),         -- цена за единицу при поступлении
    reference_type VARCHAR(50),           -- тип связанной операции (order, adjustment, receipt)
    reference_id VARCHAR(50),             -- ID связанной операции
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_transactions_item (inventory_item_id),
    INDEX idx_transactions_date (created_at DESC),
    INDEX idx_transactions_type (transaction_type)
);
```

### 4. 🌸 products (Товары)

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price VARCHAR(50) NOT NULL,           -- "12 000 ₸"
    type VARCHAR(20) NOT NULL CHECK (type IN ('vitrina', 'catalog')),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Поля для витрины
    width VARCHAR(10),                    -- в см
    height VARCHAR(10),                   -- в см
    
    -- Поля для каталога
    catalog_width VARCHAR(10),
    catalog_height VARCHAR(10),
    duration VARCHAR(10),                 -- время изготовления в минутах
    discount VARCHAR(10),                 -- процент скидки
    florist_work_cost DECIMAL(10,2),      -- стоимость работы флориста
    production_time VARCHAR(20) CHECK (production_time IN ('short', 'medium', 'long')),
    
    -- Индексы
    INDEX idx_products_type (type),
    INDEX idx_products_available (is_available),
    INDEX idx_products_created (created_at DESC)
);
```

### 2. 📸 product_images (Изображения товаров)

```sql
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_main BOOLEAN DEFAULT false,        -- главное изображение
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_images_product (product_id),
    INDEX idx_product_images_main (product_id, is_main)
);
```

### 3. 🎥 product_videos (Видео товаров)

```sql
CREATE TABLE product_videos (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_videos_product (product_id)
);
```

### 4. 🌺 product_ingredients (Состав товаров из складских материалов)

```sql
CREATE TABLE product_ingredients (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    inventory_item_id BIGINT NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,       -- количество на единицу товара
    cost_per_unit DECIMAL(10,2) NOT NULL, -- себестоимость за единицу
    sort_order INTEGER DEFAULT 0,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id),
    INDEX idx_ingredients_product (product_id),
    INDEX idx_ingredients_inventory (inventory_item_id),
    
    UNIQUE KEY unique_product_ingredient (product_id, inventory_item_id)
);
```

### 5. 🎨 product_colors (Цвета товаров)

```sql
CREATE TABLE product_colors (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    color VARCHAR(50) NOT NULL,           -- 'pink', 'red', 'white', 'mix'
    sort_order INTEGER DEFAULT 0,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_colors_product (product_id)
);
```

### 6. 👥 customers (Клиенты)

```sql
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    member_since DATE NOT NULL DEFAULT CURRENT_DATE,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    last_order_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'vip', 'inactive')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_customers_phone (phone),
    INDEX idx_customers_email (email),
    INDEX idx_customers_status (status),
    INDEX idx_customers_last_order (last_order_date DESC)
);
```

### 7. 📦 orders (Заказы)

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new' 
        CHECK (status IN ('new', 'paid', 'accepted', 'assembled', 'in-transit', 'completed')),
    
    -- Связи с товарами (Foreign Keys)
    main_product_id BIGINT NOT NULL,
    
    -- Связи с клиентами (Foreign Keys)
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    
    -- Доставка
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
    delivery_address TEXT,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_date VARCHAR(20) NOT NULL CHECK (delivery_date IN ('today', 'tomorrow')),
    delivery_time VARCHAR(20) NOT NULL,
    
    -- Дополнительная информация
    postcard TEXT,
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    
    -- Оплата
    payment_amount DECIMAL(12,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
    payment_method VARCHAR(50),
    
    -- Исполнители
    florist VARCHAR(255),
    courier VARCHAR(255),
    
    -- Фото
    photo_before_delivery VARCHAR(500),
    
    -- Временные метки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Внешние ключи с CASCADE для целостности данных
    FOREIGN KEY (main_product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (recipient_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (sender_id) REFERENCES customers(id) ON DELETE RESTRICT,
    
    -- Индексы для производительности
    INDEX idx_orders_status (status),
    INDEX idx_orders_number (order_number),
    INDEX idx_orders_date (created_at DESC),
    INDEX idx_orders_delivery_city (delivery_city),
    INDEX idx_orders_delivery_date (delivery_date),
    INDEX idx_orders_main_product (main_product_id),
    INDEX idx_orders_recipient (recipient_id),
    INDEX idx_orders_sender (sender_id)
);
```

**Объяснение связей:**
- `main_product_id` → `products.id` - каждый заказ связан с основным товаром
- `recipient_id` → `customers.id` - каждый заказ имеет получателя из базы клиентов  
- `sender_id` → `customers.id` - каждый заказ имеет отправителя из базы клиентов
- `ON DELETE RESTRICT` - предотвращает удаление товаров/клиентов, если есть связанные заказы

### 8. 🛍️ order_items (Дополнительные товары в заказе)

```sql
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id BIGINT NOT NULL,            -- Связь с товаром
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,     -- Цена на момент заказа
    total_price DECIMAL(10,2) NOT NULL,    -- Общая стоимость (quantity * unit_price)
    sort_order INTEGER DEFAULT 0,
    
    -- Внешние ключи
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Индексы
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
);
```

**Объяснение связей:**
- `order_id` → `orders.id` - связь с заказом
- `product_id` → `products.id` - связь с товаром из каталога
- Сохраняем цены на момент заказа для истории

### 9. 📚 order_history (История заказов)

```sql
CREATE TABLE order_history (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL,
    description TEXT NOT NULL,
    author VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_history_order (order_id),
    INDEX idx_order_history_date (created_at DESC)
);
```

### 10. 👤 florist_profiles (Профили флористов)

```sql
CREATE TABLE florist_profiles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    position VARCHAR(20) NOT NULL CHECK (position IN ('owner', 'senior', 'florist', 'assistant')),
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_florist_profiles_position (position)
);
```

### 11. 🏪 shop_info (Информация о магазине)

```sql
CREATE TABLE shop_info (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    working_hours VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    instagram VARCHAR(255),
    whatsapp VARCHAR(20),
    telegram VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 12. 👥 colleagues (Коллеги)

```sql
CREATE TABLE colleagues (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    position VARCHAR(20) NOT NULL CHECK (position IN ('owner', 'senior', 'florist', 'assistant')),
    is_active BOOLEAN DEFAULT true,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_colleagues_position (position),
    INDEX idx_colleagues_active (is_active),
    INDEX idx_colleagues_joined (joined_date DESC)
);
```

### 13. 👤 users (Пользователи системы)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'florist', 'courier', 'manager')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);
```

### 14. 📁 uploaded_files (Загруженные файлы)

```sql
CREATE TABLE uploaded_files (
    id BIGSERIAL PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(20) CHECK (file_type IN ('image', 'video')),
    uploaded_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_files_type (file_type),
    INDEX idx_files_date (created_at DESC)
);
```

### 15. 🔑 user_sessions (Сессии пользователей)

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (token_hash),
    INDEX idx_sessions_expires (expires_at)
);
```

## 🔗 Связи между таблицами

### Один ко многим:
- `products` → `product_images` (1:N)
- `products` → `product_videos` (1:N)
- `products` → `product_ingredients` (1:N)
- `inventory_items` → `product_ingredients` (1:N)
- `products` → `product_colors` (1:N)
- `orders` → `order_items` (1:N)
- `orders` → `order_history` (1:N)
- `users` → `user_sessions` (1:N)
- `users` → `uploaded_files` (1:N)
- `customers` → `orders` (1:N) - как получатель и отправитель

### Многие к одному:
- `orders` → `products` (N:1) - основной товар через main_product_id
- `orders` → `customers` (N:1) - получатель через recipient_id
- `orders` → `customers` (N:1) - отправитель через sender_id
- `order_items` → `orders` (N:1) - дополнительные товары в заказе
- `order_items` → `products` (N:1) - связь с товарами
- `product_ingredients` → `products` (N:1) - состав товаров
- `product_ingredients` → `inventory_items` (N:1) - складские материалы

## 📊 Триггеры и функции

### 1. Автоматическое обновление updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем к таблицам
CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_florist_profiles_updated_at
    BEFORE UPDATE ON florist_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_colleagues_updated_at
    BEFORE UPDATE ON colleagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 2. Автоматическая генерация номера заказа

```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number = '4' || LPAD((40000 + nextval('order_number_seq'))::text, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();
```

### 3. Логирование изменений заказа

```sql
CREATE OR REPLACE FUNCTION log_order_changes()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO order_history (order_id, description, author)
        VALUES (NEW.id, 'Заказ создан', 'система');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO order_history (order_id, description, author)
            VALUES (NEW.id, 'Статус изменен с "' || OLD.status || '" на "' || NEW.status || '"', 'система');
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_order_changes
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_order_changes();
```

### 4. Автоматическое списание материалов при создании заказа

```sql
CREATE OR REPLACE FUNCTION consume_inventory_for_order()
RETURNS TRIGGER AS $
DECLARE
    ingredient RECORD;
BEGIN
    -- Списываем материалы для основного товара
    FOR ingredient IN 
        SELECT pi.inventory_item_id, pi.quantity 
        FROM product_ingredients pi 
        WHERE pi.product_id = NEW.main_product_id
    LOOP
        -- Списываем со склада
        UPDATE inventory_items 
        SET quantity = quantity - ingredient.quantity 
        WHERE id = ingredient.inventory_item_id;
        
        -- Логируем транзакцию
        INSERT INTO inventory_transactions (
            inventory_item_id, 
            transaction_type, 
            quantity, 
            reference_type, 
            reference_id, 
            comment
        ) VALUES (
            ingredient.inventory_item_id,
            'consumption',
            -ingredient.quantity,
            'order',
            NEW.id::text,
            'Списание для заказа ' || NEW.order_number
        );
    END LOOP;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_consume_inventory_for_order
    AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION consume_inventory_for_order();
```

## 🔍 Полезные представления (Views)

### 1. Товары с изображениями

```sql
CREATE VIEW products_with_images AS
SELECT 
    p.*,
    pi.image_url as main_image,
    (
        SELECT COUNT(*) 
        FROM product_images pi2 
        WHERE pi2.product_id = p.id
    ) as images_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = true;
```

### 2. Полная информация о заказах с товарами и клиентами

```sql
CREATE VIEW orders_full AS
SELECT 
    o.*,
    -- Данные получателя
    r.name as recipient_name,
    r.phone as recipient_phone,
    r.email as recipient_email,
    r.status as recipient_status,
    -- Данные отправителя  
    s.name as sender_name,
    s.phone as sender_phone,
    s.email as sender_email,
    s.status as sender_status,
    -- Данные основного товара
    p.title as product_title,
    p.price as product_price,
    p.type as product_type,
    pi.image_url as product_image,
    -- Количество дополнительных товаров
    (
        SELECT COUNT(*) 
        FROM order_items oi 
        WHERE oi.order_id = o.id
    ) as additional_items_count,
    -- Общая стоимость дополнительных товаров
    (
        SELECT COALESCE(SUM(oi.total_price), 0)
        FROM order_items oi 
        WHERE oi.order_id = o.id
    ) as additional_items_total
FROM orders o
JOIN customers r ON o.recipient_id = r.id
JOIN customers s ON o.sender_id = s.id
JOIN products p ON o.main_product_id = p.id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = true;
```

### 3. Статистика товаров

```sql
CREATE VIEW products_stats AS
SELECT 
    type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_available = true) as active_count,
    COUNT(*) FILTER (WHERE is_available = false) as inactive_count
FROM products
GROUP BY type;
```

### 4. Статистика клиентов

```sql
CREATE VIEW customers_stats AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(total_spent) as avg_spent,
    SUM(total_orders) as total_orders
FROM customers
GROUP BY status;
```

### 5. Информация о команде

```sql
CREATE VIEW team_stats AS
SELECT 
    position,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_count
FROM colleagues
GROUP BY position;
```

### 6. Полная информация о товарах с составом

```sql
CREATE VIEW products_with_ingredients AS
SELECT 
    p.*,
    pi.image_url as main_image,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'inventory_item_id', pr.inventory_item_id,
                'name', ii.name,
                'quantity', pr.quantity,
                'unit', ii.unit,
                'cost_per_unit', pr.cost_per_unit
            ) ORDER BY pr.sort_order
        ) FILTER (WHERE pr.id IS NOT NULL), 
        '[]'::json
    ) as ingredients
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = true
LEFT JOIN product_ingredients pr ON p.id = pr.product_id
LEFT JOIN inventory_items ii ON pr.inventory_item_id = ii.id
GROUP BY p.id, pi.image_url;
```

### 7. Статистика заказов по товарам и клиентам

```sql
CREATE VIEW order_statistics AS
SELECT 
    -- Статистика по товарам
    p.id as product_id,
    p.title as product_title,
    COUNT(o.id) as orders_count,
    SUM(o.payment_amount) as total_revenue,
    -- Статистика по клиентам
    c.id as customer_id,
    c.name as customer_name,
    c.status as customer_status,
    COUNT(DISTINCT CASE WHEN o.recipient_id = c.id THEN o.id END) as orders_as_recipient,
    COUNT(DISTINCT CASE WHEN o.sender_id = c.id THEN o.id END) as orders_as_sender
FROM products p
LEFT JOIN orders o ON p.id = o.main_product_id
LEFT JOIN customers c ON (o.recipient_id = c.id OR o.sender_id = c.id)
GROUP BY p.id, p.title, c.id, c.name, c.status;
```

## 📈 Индексы для производительности

```sql
-- Составные индексы для частых запросов
CREATE INDEX idx_orders_status_date ON orders(status, created_at DESC);
CREATE INDEX idx_orders_delivery_date_city ON orders(delivery_date, delivery_city);
CREATE INDEX idx_products_type_available ON products(type, is_available);

-- Индексы для поиска
CREATE INDEX idx_customers_name ON customers USING gin(to_tsvector('russian', name));
CREATE INDEX idx_products_title ON products USING gin(to_tsvector('russian', title));

-- Индексы для внешних ключей
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_ingredients_product_id ON product_ingredients(product_id);
CREATE INDEX idx_product_ingredients_inventory_id ON product_ingredients(inventory_item_id);
```

## 🔐 Права доступа

```sql
-- Создание ролей
CREATE ROLE app_admin;
CREATE ROLE app_user;
CREATE ROLE app_readonly;

-- Права для администратора
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- Права для обычного пользователя
GRANT SELECT, INSERT, UPDATE, DELETE ON products, orders, customers, order_items, order_history TO app_user;
GRANT SELECT, INSERT, UPDATE ON product_images, product_videos, product_ingredients, product_colors TO app_user;
GRANT SELECT, INSERT, UPDATE ON florist_profiles, shop_info, colleagues TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Права только для чтения
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
```

## 📋 Начальные данные

```sql
-- Администратор по умолчанию
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@flowershop.com', '$2b$12$...', 'Администратор', 'admin');

-- Профиль флориста по умолчанию
INSERT INTO florist_profiles (name, phone, position, bio) VALUES 
('Анна Иванова', '+7 (777) 123-45-67', 'owner', 'Профессиональный флорист с многолетним опытом.');

-- Информация о магазине по умолчанию  
INSERT INTO shop_info (name, address, phone, working_hours, city) VALUES 
('Цветочная лавка', 'ул. Абая, 123', '+7 (777) 123-45-67', 'Пн-Вс: 9:00-21:00', 'Алматы');

-- Статусы заказов (справочная информация в коде)
-- new, paid, accepted, assembled, in-transit, completed

-- Типы товаров (справочная информация в коде) 
-- vitrina, catalog

-- Время изготовления (справочная информация в коде)
-- short, medium, long
```

## ⚡ Рекомендации по оптимизации

### 1. Партиционирование
```sql
-- Партиционирование заказов по месяцам
CREATE TABLE orders_partitioned (
    LIKE orders INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024_01 PARTITION OF orders_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 2. Архивирование
```sql
-- Архивная таблица для старых заказов
CREATE TABLE orders_archive (LIKE orders INCLUDING ALL);
```

### 3. Мониторинг
```sql
-- Медленные запросы
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Размеры таблиц
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔧 Рекомендуемые настройки PostgreSQL

```ini
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

## 📱 Backup и восстановление

```bash
# Создание бекапа
pg_dump -h localhost -U postgres -d flowershop_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление
psql -h localhost -U postgres -d flowershop_db_new < backup_20241228_120000.sql

# Автоматический бекап (cron)
0 2 * * * pg_dump -h localhost -U postgres -d flowershop_db > /backups/daily_$(date +\%Y\%m\%d).sql
```

## 🚀 Миграции

Все изменения схемы должны выполняться через миграции с версионированием:

```sql
-- migration_001_initial_schema.sql
-- migration_002_add_product_groups.sql
-- migration_003_add_notifications.sql
```

## 📞 Интеграции

База данных готова для интеграции с:
- **SMS сервисами** (номера телефонов в стандартном формате)
- **Payment системами** (поля для transaction_id)
- **File storage** (URLs для изображений и видео)
- **Analytics** (временные метки и статусы для отчетов)