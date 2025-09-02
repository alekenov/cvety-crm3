# Database Schema Documentation

## Overview

This document describes the complete MySQL database schema for the cvety.kz CRM system. The schema supports a flower delivery business operating across multiple cities in Kazakhstan.

## Database Configuration

- **Database Name**: `dbcvety`
- **Character Set**: `utf8mb4` (full Unicode support)
- **Collation**: `utf8mb4_unicode_ci`
- **Engine**: InnoDB (for transactions and foreign keys)

## Core Business Entities

### Product Management System

The product system supports two distinct product types:

#### Vitrina Products (Simple Products)
- Basic flower arrangements
- Fields: `title`, `price`, `width`, `height`, `images`
- Quick catalog items for standard arrangements

#### Catalog Products (Complex Products)  
- Custom arrangements with detailed specifications
- Additional fields: `composition`, `colors`, `production_time`, `videos`
- Fully customizable products

### Order Management System

Orders flow through a defined status pipeline:

```
new → paid → accepted → assembled → in-transit → completed
```

Each status change is tracked in `order_history` for audit purposes.

## Table Categories

### 1. User Management
- **`users`** - System users (admins, florists, couriers)
- **`user_sessions`** - Authentication sessions
- **`api_tokens`** - API access tokens

### 2. Location & Delivery
- **`cities`** - Supported delivery cities
- **`delivery_zones`** - Service areas within cities
- **`couriers`** - Delivery personnel

### 3. Product Catalog
- **`products`** - Main product table
- **`product_images`** - Multiple images per product
- **`product_videos`** - Video content for catalog items
- **`product_compositions`** - Flower ingredients
- **`product_colors`** - Available color options
- **`product_categories`** - Product categorization

### 4. Order Processing
- **`orders`** - Main order records
- **`order_items`** - Products within orders
- **`order_history`** - Status change tracking

### 5. Inventory Management
- **`inventory_items`** - Stock items (flowers, accessories)
- **`inventory_transactions`** - Stock movements
- **`inventory_categories`** - Item categorization

### 6. Communication
- **`notifications`** - WhatsApp/Telegram/SMS queue
- **`bot_conversations`** - Chatbot conversation state

### 7. Integration
- **`bitrix_sync_log`** - Legacy system synchronization
- **`file_uploads`** - Media file management

## Key Design Decisions

### Flexible Product Types
The `products` table uses a single table with conditional fields based on `type` enum:
- Vitrina: Uses `width`, `height` fields
- Catalog: Uses `catalog_width`, `catalog_height`, plus composition/color tables

### Multi-City Support
All relevant tables include `city_id` foreign key to support multi-city operations:
- Products can be city-specific
- Orders are always tied to a city
- Users and couriers are assigned to cities

### Audit Trail
Critical operations are tracked:
- Order status changes in `order_history`
- Inventory movements in `inventory_transactions`
- System integration in `bitrix_sync_log`

### Communication Integration
Built-in support for customer communication:
- Notification queue for automated messages
- Bot conversation state management
- Multiple communication channels (WhatsApp, Telegram, SMS)

## Sample Data Structure

### Product Example
```sql
-- Vitrina product (simple bouquet)
INSERT INTO products (title, type, price, width, height, is_available) 
VALUES ('Букет роз "Классик"', 'vitrina', 5000.00, '25', '40', true);

-- Catalog product (custom arrangement)
INSERT INTO products (title, type, price, catalog_width, catalog_height, production_time) 
VALUES ('Свадебный букет', 'catalog', 15000.00, '30-35', '45-50', '2-3 часа');
```

### Order Example
```sql
-- Order with delivery
INSERT INTO orders (
    order_number, customer_name, customer_phone, 
    city_id, delivery_address, delivery_date, 
    subtotal, delivery_cost, total_amount, status
) VALUES (
    'CV202508-000001', 'Айгуль Сатыбалдиева', '+77015211545',
    1, 'пр. Достык, 123, кв. 45', '2025-09-01',
    5000.00, 1000.00, 6000.00, 'new'
);
```

## Performance Optimizations

### Indexes
- **Primary Keys**: All tables have auto-increment primary keys
- **Foreign Keys**: All relationships indexed
- **Search Fields**: Phone numbers, emails, product titles
- **Date Fields**: Order dates, creation timestamps
- **Spatial**: Location coordinates for delivery optimization

### Views
- **`v_products_with_images`** - Products with primary images
- **`v_order_summary`** - Orders with aggregated information

## Integration Points

### Bitrix CRM Legacy System
- `xml_id` fields maintain references to legacy system
- `bitrix_sync_log` tracks synchronization operations
- Webhook-based bidirectional sync

### External Services
- **Kaspi Pay**: Payment processing integration
- **WhatsApp Business API**: Customer communication
- **Telegram Bot API**: Alternative communication channel
- **SMS Gateway**: Delivery notifications

## Migration Strategy

### From Legacy Bitrix System
1. Export Bitrix data via API or database dump
2. Map Bitrix fields to new schema using `xml_id` references
3. Transform data formats (especially JSON fields)
4. Maintain sync during transition period

### Data Validation Rules
- Phone numbers in international format (+77XXXXXXXXX)
- Coordinates in decimal degrees (WGS84)
- Prices in Kazakhstani Tenge (no currency conversion)
- Dates in local timezone (Asia/Almaty)

## Security Considerations

### Data Protection
- Password hashing using bcrypt
- API tokens with expiration
- Session management with IP validation
- SQL injection protection via prepared statements

### Access Control
- Role-based permissions (admin, manager, florist, courier)
- City-based data isolation
- Audit logging for sensitive operations

## Backup and Recovery

### Backup Strategy
- Daily full database backups
- Transaction log backups every 15 minutes
- Monthly archival to cold storage
- Point-in-time recovery capability

### Recovery Testing
- Monthly restore tests to staging environment
- Disaster recovery documentation
- RTO: 4 hours, RPO: 15 minutes

---

## Connection Information

**Production Database**
- Host: `185.125.90.141`
- Database: `dbcvety`
- Username: `usercvety`
- Password: `QQlPCtTA@z2%mhy`
- Port: `3306` (default MySQL)

**Character Set**: Ensure client connections use `utf8mb4` encoding for proper Unicode support.

This schema provides a complete foundation for the cvety.kz flower delivery CRM system with room for future expansion and optimization.