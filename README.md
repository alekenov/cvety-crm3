
# CRM3 - Cvety.kz CRM System

Современная React-приложение для управления CRM системой Cvety.kz.

## Особенности

- ⚡ React 18 + Vite
- 🎨 Tailwind CSS + shadcn/ui
- 🚦 React Router для навигации  
- 📦 TypeScript поддержка
- 🔗 Интеграция с FastAPI backend
- 📱 Адаптивный дизайн

## Структура проекта

```
/Users/alekenov/crm3/
├── src/
│   ├── api/           # API интеграция с backend
│   ├── components/    # React компоненты
│   ├── pages/         # Страницы приложения
│   ├── ui/           # UI компоненты (shadcn/ui)
│   └── assets/       # Статические файлы
├── build/            # Production build
└── package.json      # Зависимости проекта
```

## Установка и запуск

```bash
# Перейти в директорию проекта
cd /Users/alekenov/crm3

# Установить зависимости
npm install

# Запустить в режиме разработки
npm run dev

# Собрать для production
npm run build
```

## Конфигурация

Настройки API находятся в `.env` файле:
- `VITE_API_BASE` - URL FastAPI backend
- `VITE_API_TOKEN` - API токен для авторизации
- `VITE_CITY_ID` - ID города (по умолчанию Алматы)

## API интеграция

Приложение интегрируется с FastAPI backend через:
- `/src/api/client.ts` - HTTP клиент
- `/src/api/config.ts` - Конфигурация API
- `/src/api/products.ts` - Методы для работы с товарами
- `/src/api/orders.ts` - Методы для работы с заказами

## Запуск

```bash
# Приложение будет доступно по адресу:
http://localhost:3005 (или другой свободный порт)
```

Консолидированная версия из двух проектов (crm3 и crm3-main), оставлена более полная версия с API интеграцией и роутингом.

## Environment variables

Создайте файл `.env` (можно скопировать из `.env.example`) и задайте:

- `VITE_API_TOKEN` — обязательный API access token (в коде больше нет значения по умолчанию)
- `VITE_CITY_ID` — ID города (по умолчанию `2`)
- `VITE_SHOP_ID` — необязательный фильтр магазина для каталога

Без `VITE_API_TOKEN` запросы к cvety.kz будут возвращать ошибку авторизации. В dev и prod используется прокси из `server.js`, поэтому все base URL остаются относительными.
  
