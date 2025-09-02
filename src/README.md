# 🌸 Flower Shop Management Application

Приложение для управления цветочным магазином с системой товаров, заказов, клиентов и складом.

## 🏗️ Архитектура

### 📁 Структура проекта

```
/
├── App.tsx                    # Главный компонент приложения
├── components/               # Legacy компоненты (постепенно мигрируем)
├── src/                     # Централизованная система дизайна
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── common/         # Общие компоненты (StatusBadge, FilterTabs, etc.)
│   │   ├── forms/          # Компоненты форм
│   │   ├── layout/         # Компоненты макета
│   │   ├── products/       # Компоненты товаров
│   │   └── ui/             # UI компоненты
│   ├── hooks/              # Кастомные хуки
│   │   ├── useAppState.ts  # Управление состоянием приложения
│   │   └── useAppActions.ts # Действия приложения
│   ├── types/              # TypeScript типы
│   ├── utils/              # Утилиты
│   ├── constants/          # Константы
│   └── index.ts            # Главный экспорт системы дизайна
└── styles/
    └── globals.css         # Глобальные стили (Tailwind v4)
```

## 🔧 Технологии

- **React** + **TypeScript** - основной стек
- **Tailwind CSS v4** - стили
- **ShadCN UI** - компоненты
- **Lucide React** - иконки
- **Vite** - сборщик

## 🎯 Рефакторинг

### ✅ Что уже сделано:

1. **Централизованная система типов** в `/src/types/`
2. **Модульная архитектура** в `/src/components/`
3. **Хуки для управления состоянием** (`useAppState`, `useAppActions`)
4. **Очистка App.tsx** от дублированного кода
5. **Переиспользуемые компоненты** (`StatusBadge`, `FilterTabs`, `EmptyState`, `PageHeader`)

### 🚧 В процессе:

- Миграция legacy компонентов в `/src/components/`
- Унификация использования централизованных компонентов
- Оптимизация производительности

### 📋 Следующие шаги:

1. Мигрировать оставшиеся компоненты в централизованную систему
2. Добавить документацию для компонентов
3. Настроить тесты
4. Оптимизировать бандл

## 🚀 Запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## 📖 Использование

### Импорты из централизованной системы:

```typescript
// Правильно - используйте централизованную систему
import { Product, Customer, Order } from './src/types';
import { StatusBadge, FilterTabs } from './src/components/common';
import { useAppState, useAppActions } from './src/hooks';

// Неправильно - не дублируйте типы и компоненты
interface Product { ... } // ❌
function StatusBadge() { ... } // ❌
```

### Создание новых компонентов:

```typescript
// /src/components/my-module/MyComponent/MyComponent.tsx
import { SomeType } from '../../types';
import { SomeComponent } from '../common';

export function MyComponent() {
  // компонент
}

// /src/components/my-module/MyComponent/index.ts
export { MyComponent } from './MyComponent';

// /src/components/my-module/index.ts
export { MyComponent } from './MyComponent';

// /src/components/index.ts
export * from './my-module';
```

## 🎨 Дизайн система

### Цвета

Используются CSS переменные из `globals.css`:
- `--primary: #7c3aed` (фиолетовый)
- `--background: #ffffff`
- `--foreground: oklch(0.145 0 0)` (темно-серый)

### Типографика

Базовые размеры настроены в `globals.css`:
- Базовый размер: `14px`
- Средний вес: `500`
- Обычный вес: `400`

### Компоненты

- **StatusBadge** - индикаторы статуса
- **FilterTabs** - табы для фильтрации
- **EmptyState** - пустые состояния
- **PageHeader** - заголовки страниц

## 🔗 API интеграция

Подготовлена структура для интеграции с backend:

- `BACKEND_API_REQUIREMENTS.md` - требования к API
- `DATABASE_SCHEMA.md` - схема базы данных
- `openapi.yaml` - OpenAPI спецификация

## 📱 Экраны

Приложение поддерживает следующие экраны:

- **Товары** - управление товарами витрины и каталога
- **Заказы** - обработка заказов клиентов
- **Склад** - управление инвентарем
- **Клиенты** - база клиентов
- **Профиль** - настройки флориста и команды

## 🤝 Contributing

1. Используйте централизованную систему типов и компонентов
2. Следуйте архитектуре модулей в `/src/`
3. Добавляйте типы в `/src/types/`
4. Создавайте переиспользуемые компоненты в `/src/components/`
5. Документируйте изменения

---

**Версия**: 2.0.0 (после рефакторинга)  
**Обновлено**: Декабрь 2024