-- ====================================================
-- CVETY.KZ CRM DATABASE SCHEMA (MySQL 5.7+)
-- Complete backup schema for flower delivery CRM system
-- Generated: August 31, 2025
-- ====================================================

-- Database Creation
CREATE DATABASE IF NOT EXISTS dbcvety 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE dbcvety;

-- ====================================================
-- USER MANAGEMENT TABLES
-- ====================================================

-- System users (florists, admins, couriers, operators)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    role ENUM('admin', 'manager', 'florist', 'courier', 'operator') NOT NULL DEFAULT 'operator',
    city_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_login (login),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_city (city_id)
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_expires (expires_at)
);

-- API tokens for external integrations
CREATE TABLE api_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    user_id INT,
    permissions JSON,
    expires_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tokens_token (token),
    INDEX idx_tokens_user (user_id)
);

-- ====================================================
-- LOCATION AND DELIVERY TABLES
-- ====================================================

-- Supported cities for delivery
CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_kz VARCHAR(100), -- Kazakh translation
    subdomain VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    timezone VARCHAR(50) DEFAULT 'Asia/Almaty',
    coordinates POINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_cities_subdomain (subdomain),
    INDEX idx_cities_active (is_active)
);

-- Delivery zones within cities
CREATE TABLE delivery_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    polygon GEOMETRY NOT NULL,
    delivery_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    min_delivery_time INT NOT NULL DEFAULT 60, -- minutes
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_zones_city (city_id),
    SPATIAL INDEX idx_zones_polygon (polygon)
);

-- Courier information
CREATE TABLE couriers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    city_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    transport_type ENUM('foot', 'bicycle', 'motorcycle', 'car') NOT NULL DEFAULT 'car',
    max_orders_per_route INT DEFAULT 5,
    current_location POINT,
    is_available BOOLEAN DEFAULT TRUE,
    working_hours JSON, -- {"start": "09:00", "end": "21:00", "days": [1,2,3,4,5,6,7]}
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_couriers_city (city_id),
    INDEX idx_couriers_available (is_available),
    SPATIAL INDEX idx_couriers_location (current_location)
);

-- ====================================================
-- PRODUCT MANAGEMENT TABLES
-- ====================================================

-- Main products table (vitrina and catalog types)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    xml_id VARCHAR(100) UNIQUE, -- Bitrix integration ID
    title VARCHAR(255) NOT NULL,
    type ENUM('vitrina', 'catalog') NOT NULL DEFAULT 'vitrina',
    price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    
    -- Vitrina type fields
    width VARCHAR(20), -- e.g., "30", "25-30"
    height VARCHAR(20), -- e.g., "40", "35-45"
    
    -- Catalog type fields
    catalog_width VARCHAR(20),
    catalog_height VARCHAR(20),
    production_time VARCHAR(50), -- e.g., "2-3 часа", "1 день"
    
    -- Common fields
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_ready BOOLEAN DEFAULT FALSE, -- готов к продаже
    in_stock BOOLEAN DEFAULT TRUE,
    duration VARCHAR(50), -- срок годности
    
    -- SEO and metadata
    meta_title VARCHAR(255),
    meta_description TEXT,
    slug VARCHAR(255) UNIQUE,
    
    -- System fields
    owner_id INT, -- user who created/manages
    city_id INT, -- city-specific products
    sort_order INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_products_type (type),
    INDEX idx_products_available (is_available),
    INDEX idx_products_city (city_id),
    INDEX idx_products_owner (owner_id),
    INDEX idx_products_slug (slug),
    FULLTEXT idx_products_search (title, description)
);

-- Product images (multiple images per product)
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_images_product (product_id),
    INDEX idx_product_images_primary (is_primary)
);

-- Product videos (for catalog products)
CREATE TABLE product_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration INT, -- seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_videos_product (product_id)
);

-- Product composition (flowers in bouquets)
CREATE TABLE product_compositions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    component_name VARCHAR(100) NOT NULL, -- название цветка/зелени
    quantity VARCHAR(50) NOT NULL, -- "3 шт", "5-7 шт", "по сезону"
    sort_order INT DEFAULT 0,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_compositions_product (product_id)
);

-- Available colors for products
CREATE TABLE product_colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    color_name VARCHAR(50) NOT NULL, -- "Красный", "Розовый", "Белый"
    color_code VARCHAR(7), -- hex color code #ff0000
    is_available BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_colors_product (product_id)
);

-- Product categories/sections
CREATE TABLE product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_kz VARCHAR(100),
    slug VARCHAR(100) UNIQUE,
    image_url VARCHAR(500),
    description TEXT,
    parent_id INT NULL,
    sort_order INT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    INDEX idx_categories_parent (parent_id),
    INDEX idx_categories_slug (slug)
);

-- Many-to-many relationship: products to categories
CREATE TABLE product_category_relations (
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE
);

-- ====================================================
-- ORDER MANAGEMENT TABLES
-- ====================================================

-- Main orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- human-readable order number
    xml_id VARCHAR(100) UNIQUE, -- Bitrix integration ID
    
    -- Order status
    status ENUM('new', 'paid', 'accepted', 'assembled', 'in-transit', 'completed', 'cancelled') NOT NULL DEFAULT 'new',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    
    -- Customer information
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    
    -- Recipient information
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(20),
    
    -- Delivery information
    city_id INT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_coordinates POINT,
    delivery_date DATE NOT NULL,
    delivery_time TIME,
    delivery_time_range VARCHAR(50), -- "10:00-12:00"
    delivery_instructions TEXT,
    
    -- Pricing
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Payment information
    payment_method ENUM('kaspi', 'card', 'cash', 'transfer') DEFAULT 'kaspi',
    payment_reference VARCHAR(100), -- Kaspi Pay transaction ID
    
    -- Assignment
    florist_id INT, -- assigned florist
    courier_id INT, -- assigned courier
    
    -- Additional fields
    comment TEXT, -- customer comment
    internal_notes TEXT, -- internal staff notes
    source ENUM('web', 'whatsapp', 'telegram', 'phone', 'crm') DEFAULT 'web',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    accepted_at TIMESTAMP NULL,
    assembled_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (florist_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (courier_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_orders_status (status),
    INDEX idx_orders_city (city_id),
    INDEX idx_orders_delivery_date (delivery_date),
    INDEX idx_orders_florist (florist_id),
    INDEX idx_orders_courier (courier_id),
    INDEX idx_orders_phone (customer_phone),
    SPATIAL INDEX idx_orders_coordinates (delivery_coordinates)
);

-- Order items (products in each order)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    product_title VARCHAR(255) NOT NULL, -- snapshot of product name
    product_type ENUM('vitrina', 'catalog') NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Product customization
    selected_color VARCHAR(50),
    custom_message TEXT, -- message for card
    special_instructions TEXT,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
);

-- Order status history
CREATE TABLE order_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status_from ENUM('new', 'paid', 'accepted', 'assembled', 'in-transit', 'completed', 'cancelled'),
    status_to ENUM('new', 'paid', 'accepted', 'assembled', 'in-transit', 'completed', 'cancelled') NOT NULL,
    comment TEXT,
    changed_by INT, -- user who made the change
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_history_order (order_id),
    INDEX idx_order_history_date (changed_at)
);

-- ====================================================
-- INVENTORY MANAGEMENT TABLES
-- ====================================================

-- Inventory categories
CREATE TABLE inventory_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('flowers', 'greenery', 'accessories', 'packaging') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Inventory items (flowers, greenery, accessories)
CREATE TABLE inventory_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    unit ENUM('piece', 'bunch', 'kg', 'meter', 'pack') NOT NULL DEFAULT 'piece',
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    min_stock_level DECIMAL(10,2) DEFAULT 0.00,
    unit_cost DECIMAL(10,2),
    supplier VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    city_id INT,
    
    FOREIGN KEY (category_id) REFERENCES inventory_categories(id),
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_inventory_category (category_id),
    INDEX idx_inventory_city (city_id),
    INDEX idx_inventory_stock (current_stock)
);

-- Inventory transactions (stock movements)
CREATE TABLE inventory_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    transaction_type ENUM('purchase', 'usage', 'adjustment', 'waste', 'transfer') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reference_type ENUM('order', 'purchase', 'adjustment', 'manual') NOT NULL,
    reference_id INT, -- order_id, purchase_id, etc.
    comment TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_inventory_transactions_item (item_id),
    INDEX idx_inventory_transactions_date (created_at),
    INDEX idx_inventory_transactions_reference (reference_type, reference_id)
);

-- ====================================================
-- COMMUNICATION AND NOTIFICATIONS
-- ====================================================

-- Notification queue for WhatsApp, Telegram, SMS
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('whatsapp', 'telegram', 'sms', 'email') NOT NULL,
    recipient VARCHAR(255) NOT NULL, -- phone number or chat_id
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    order_id INT,
    template_name VARCHAR(100),
    template_vars JSON,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    error_message TEXT,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_notifications_status (status),
    INDEX idx_notifications_scheduled (scheduled_at),
    INDEX idx_notifications_order (order_id)
);

-- WhatsApp/Telegram bot conversations
CREATE TABLE bot_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform ENUM('whatsapp', 'telegram') NOT NULL,
    chat_id VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    customer_name VARCHAR(255),
    status ENUM('active', 'waiting', 'completed', 'blocked') DEFAULT 'active',
    context JSON, -- conversation state and variables
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_platform_chat (platform, chat_id),
    INDEX idx_conversations_phone (phone),
    INDEX idx_conversations_status (status)
);

-- ====================================================
-- INTEGRATION AND SYNCHRONIZATION
-- ====================================================

-- Bitrix synchronization log
CREATE TABLE bitrix_sync_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('product', 'order', 'customer', 'inventory') NOT NULL,
    entity_id INT NOT NULL,
    bitrix_id VARCHAR(100),
    operation ENUM('create', 'update', 'delete', 'sync') NOT NULL,
    direction ENUM('to_bitrix', 'from_bitrix', 'bidirectional') NOT NULL,
    status ENUM('pending', 'success', 'error') DEFAULT 'pending',
    request_data JSON,
    response_data JSON,
    error_message TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_bitrix_sync_entity (entity_type, entity_id),
    INDEX idx_bitrix_sync_status (status),
    INDEX idx_bitrix_sync_date (processed_at)
);

-- File uploads management
CREATE TABLE file_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'product', 'order', etc.
    entity_id INT,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_uploads_entity (entity_type, entity_id),
    INDEX idx_uploads_date (created_at)
);

-- ====================================================
-- SAMPLE DATA INSERTS
-- ====================================================

-- Insert default cities
INSERT INTO cities (id, name, name_kz, subdomain) VALUES
(1, 'Алматы', 'Алматы', 'almaty'),
(2, 'Астана', 'Астана', 'astana'),
(3, 'Шымкент', 'Шымкент', 'shymkent');

-- Insert default admin user
INSERT INTO users (login, email, password_hash, name, role, city_id) VALUES
('admin', 'admin@cvety.kz', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 1);

-- Insert default API token
INSERT INTO api_tokens (token, name, user_id) VALUES
('ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144', 'CRM3 Integration Token', 1);

-- Insert product categories
INSERT INTO product_categories (id, name, slug, image_url, sort_order) VALUES
(1, 'Букеты', 'bouquets', '/upload/sections/bouquets.jpg', 1),
(2, 'Растения', 'plants', '/upload/sections/plants.jpg', 2),
(3, 'Композиции', 'compositions', '/upload/sections/compositions.jpg', 3),
(4, 'Корзины', 'baskets', '/upload/sections/baskets.jpg', 4),
(5, 'Подарки', 'gifts', '/upload/sections/gifts.jpg', 5),
(6, 'Шары', 'balloons', '/upload/sections/balloons.jpg', 6),
(7, 'Открытки', 'cards', '/upload/sections/cards.jpg', 7);

-- Insert inventory categories
INSERT INTO inventory_categories (name, type) VALUES
('Розы', 'flowers'),
('Тюльпаны', 'flowers'),
('Хризантемы', 'flowers'),
('Эвкалипт', 'greenery'),
('Лента', 'accessories'),
('Упаковка', 'packaging');

-- ====================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_products_city_type_available ON products(city_id, type, is_available);
CREATE INDEX idx_orders_city_status_date ON orders(city_id, status, delivery_date);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
CREATE INDEX idx_inventory_city_category ON inventory_items(city_id, category_id);

-- ====================================================
-- TRIGGERS FOR AUTOMATION
-- ====================================================

-- Update product updated_at timestamp
DELIMITER $$
CREATE TRIGGER update_product_timestamp
    BEFORE UPDATE ON products
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- Auto-generate order number
DELIMITER $$
CREATE TRIGGER generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        SET NEW.order_number = CONCAT('CV', YEAR(CURDATE()), LPAD(MONTH(CURDATE()), 2, '0'), '-', LPAD(NEW.id, 6, '0'));
    END IF;
END$$
DELIMITER ;

-- ====================================================
-- VIEWS FOR REPORTING
-- ====================================================

-- Active products with main image
CREATE VIEW v_products_with_images AS
SELECT 
    p.*,
    pi.image_url as main_image,
    c.name as city_name,
    u.name as owner_name
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
LEFT JOIN cities c ON p.city_id = c.id
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.is_available = true;

-- Order summary with customer info
CREATE VIEW v_order_summary AS
SELECT 
    o.*,
    c.name as city_name,
    COUNT(oi.id) as item_count,
    f.name as florist_name,
    courier.name as courier_name
FROM orders o
LEFT JOIN cities c ON o.city_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN users f ON o.florist_id = f.id
LEFT JOIN users courier ON o.courier_id = courier.id
GROUP BY o.id;

-- ====================================================
-- END OF SCHEMA
-- ====================================================