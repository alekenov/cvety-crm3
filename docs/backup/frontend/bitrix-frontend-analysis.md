# Legacy Bitrix Frontend Analysis

## Complete Frontend Architecture Documentation

### Core Framework: Bitrix CRM
The cvety.kz CRM system is built on Bitrix Framework, a PHP-based enterprise CRM solution.

## HTML Structure and Layout

### Main Page Structure
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <!-- Meta tags and configuration -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- Bitrix CSS Assets -->
  <link href="/local/components/crm/system.auth.authorize/templates/.default/style.css" rel="stylesheet">
  <link href="/local/templates/cvety.crm/css/main.css" rel="stylesheet">
  <link href="/local/templates/cvety.crm/css/small-fixes.css" rel="stylesheet">
  <link href="/local/templates/cvety.crm/components/bitrix/menu/crm_new/style.css" rel="stylesheet">
</head>

<body class="bitrix-template">
  <!-- Authentication/Product Management Interface -->
  <div id="crm-container">
    <!-- Product listing and management components -->
  </div>
</body>
</html>
```

## CSS File Structure

### 1. Main Stylesheet (`/local/templates/cvety.crm/css/main.css`)
- Core CRM interface styling
- Product grid layouts
- Form styling and components
- Responsive design rules

### 2. Component Stylesheets
- **Authentication**: `/local/components/crm/system.auth.authorize/templates/.default/style.css`
- **Navigation Menu**: `/local/templates/cvety.crm/components/bitrix/menu/crm_new/style.css`
- **Small Fixes**: `/local/templates/cvety.crm/css/small-fixes.css`

## JavaScript Architecture

### Browser Detection and Initialization
```javascript
// Browser/device detection script
(function() {
  var userAgent = navigator.userAgent.toLowerCase();
  var classes = [];
  
  // Device type detection
  if (/android|iphone|ipad|ipod|blackberry|opera mini|iemobile/i.test(userAgent)) {
    classes.push('mobile-device');
  } else {
    classes.push('desktop-device');
  }
  
  // Browser detection
  if (userAgent.indexOf('chrome') > -1) classes.push('browser-chrome');
  if (userAgent.indexOf('firefox') > -1) classes.push('browser-firefox');
  
  document.documentElement.className += ' ' + classes.join(' ');
})();
```

### Bitrix Framework Core Files
1. **`/bitrix/js/main/core/core_ajax.js`** - AJAX functionality
2. **`/bitrix/js/main/core/core_promise.js`** - Promise polyfills  
3. **`/bitrix/js/main/polyfill/promise/js/promise.js`** - Promise compatibility
4. **`/bitrix/js/main/loadext/loadext.js`** - Dynamic loading system

### Configuration Objects

#### Authentication Configuration
```javascript
window.jsParams = {
  mode: "auth",
  loginUrl: "/crm/products/?login=yes",
  registerUrl: "/crm/products/?register=yes",
  bitrixSessId: "generated-session-token"
};
```

#### Product Sections Configuration
```javascript
window.productSections = [
  { id: 1, name: "Букеты", image: "/upload/sections/bouquets.jpg" },
  { id: 2, name: "Растения", image: "/upload/sections/plants.jpg" },
  { id: 3, name: "Композиции", image: "/upload/sections/compositions.jpg" },
  { id: 4, name: "Корзины", image: "/upload/sections/baskets.jpg" },
  { id: 5, name: "Подарки", image: "/upload/sections/gifts.jpg" },
  { id: 6, name: "Шары", image: "/upload/sections/balloons.jpg" },
  { id: 7, name: "Открытки", image: "/upload/sections/cards.jpg" }
];
```

#### Cities Configuration
```javascript
window.cities = [
  { id: 1, name: "Алматы", url: "almaty.cvety.kz" },
  { id: 2, name: "Астана", url: "astana.cvety.kz" },
  { id: 3, name: "Шымкент", url: "shymkent.cvety.kz" },
  // ... 16 more cities
];
```

#### Time Schedule Configuration
```javascript
window.timeSchedule = {
  hourly: [
    "00:00", "01:00", "02:00", ..., "23:00"
  ],
  quarterHourly: [
    "00:00", "00:15", "00:30", "00:45",
    "01:00", "01:15", "01:30", "01:45",
    // ... continues to 23:45
  ]
};
```

## Form Structures

### Authentication Forms
```html
<!-- Login Form -->
<form name="system_auth_form" action="/crm/products/?login=yes" method="post">
  <input type="hidden" name="AUTH_FORM" value="Y">
  <input type="hidden" name="TYPE" value="AUTH">
  <input type="text" name="USER_LOGIN" placeholder="Логин" required>
  <input type="password" name="USER_PASSWORD" placeholder="Пароль" required>
  <input type="checkbox" name="USER_REMEMBER" value="Y"> Запомнить
  <input type="submit" name="Login" value="Войти">
</form>

<!-- Registration Form -->
<form name="system_auth_form" action="/crm/products/?register=yes" method="post">
  <input type="hidden" name="AUTH_FORM" value="Y">
  <input type="hidden" name="TYPE" value="REGISTRATION">
  <input type="text" name="USER_LOGIN" placeholder="Логин" required>
  <input type="email" name="USER_EMAIL" placeholder="Email" required>
  <input type="password" name="USER_PASSWORD" placeholder="Пароль" required>
  <input type="password" name="USER_CONFIRM_PASSWORD" placeholder="Подтверждение пароля" required>
  <input type="submit" name="Register" value="Зарегистрироваться">
</form>
```

### Product Management Forms
```html
<!-- Product Creation/Edit Form -->
<form name="product_form" action="/crm/products/" method="post" enctype="multipart/form-data">
  <input type="hidden" name="sessid" value="generated-bitrix-sessid">
  <input type="hidden" name="action" value="save_product">
  
  <select name="product_type">
    <option value="vitrina">Витрина</option>
    <option value="catalog">Каталог</option>
  </select>
  
  <input type="text" name="title" placeholder="Название товара" required>
  <input type="number" name="price" placeholder="Цена" required>
  <input type="file" name="images[]" multiple accept="image/*">
  <input type="file" name="video" accept="video/*">
  
  <input type="text" name="width" placeholder="Ширина">
  <input type="text" name="height" placeholder="Высота">
  
  <textarea name="composition" placeholder="Состав букета"></textarea>
  <input type="text" name="colors" placeholder="Доступные цвета">
  
  <input type="submit" value="Сохранить товар">
</form>
```

## AJAX Endpoints

### Analytics and Tracking
- **`/bitrix/tools/conversion/ajax_counter.php`** - User behavior tracking
- **`/crm/products/ajax.php`** - Product operations
- **`/crm/orders/ajax.php`** - Order management

### API Integration Points
- **Session Management**: Uses `bitrix_sessid` for CSRF protection
- **File Uploads**: Multipart form data to `/upload/handler.php`
- **Real-time Updates**: WebSocket-like polling for order status

## Authentication Components

### Session Management
```javascript
// Bitrix session handling
window.BX = {
  sessid: "generated-session-id",
  message: function(text) {
    // User notification system
  },
  ajax: {
    request: function(params) {
      // AJAX request wrapper
    }
  }
};
```

### Permission System
```javascript
// User permissions configuration
window.userPermissions = {
  canEditProducts: true,
  canDeleteProducts: false,
  canViewOrders: true,
  canEditOrders: true,
  accessLevel: "manager" // admin, manager, operator
};
```

## Product Interface Components

### Product Grid Layout
- **Grid System**: CSS Grid with responsive breakpoints
- **Card Components**: Product thumbnail, title, price, status
- **Filter Panel**: Type, availability, price range, date
- **Pagination**: Server-side pagination with page controls

### Product Detail Modal
- **Image Gallery**: Multiple image display with zoom
- **Video Player**: HTML5 video with custom controls  
- **Form Fields**: Editable product properties
- **Action Buttons**: Save, delete, duplicate, status toggle

## Technical Characteristics

### Browser Support
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+
- **Legacy Support**: IE11 via polyfills
- **Mobile**: Responsive design with touch optimization

### Localization
- **Primary Language**: Russian
- **Fallback**: Kazakh
- **Date/Time**: Kazakhstan timezone (GMT+6)
- **Currency**: Kazakhstani Tenge (₸)

### Performance Optimizations
- **Lazy Loading**: Images loaded on scroll
- **Caching**: Browser cache headers for static assets
- **Compression**: Gzip compression for CSS/JS
- **CDN**: Local asset delivery optimization

---

## Restoration Notes

To restore this frontend:

1. **Server Requirements**: PHP 7.4+, Apache/Nginx, Bitrix Framework
2. **Database**: MySQL 5.7+ with Bitrix schema
3. **File Structure**: Preserve `/local/` and `/bitrix/` directories
4. **Configuration**: Restore `bitrix/.settings.php` and database connection
5. **Assets**: Upload all CSS, JS, and image files to correct paths
6. **Permissions**: Set proper file/folder permissions for Bitrix operation

This documentation provides the complete frontend structure needed to recreate or restore the legacy Bitrix CRM system.