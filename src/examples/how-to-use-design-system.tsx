/**
 * Примеры использования дизайн системы
 * 
 * Этот файл показывает, как правильно использовать компоненты
 * из централизованной дизайн системы
 */

import React, { useState } from 'react';

// ✅ ПРАВИЛЬНО: Импорты из дизайн системы
import { 
  Button, 
  Input, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../src/components'; // UI компоненты

import { 
  StatusBadge, 
  FilterTabs, 
  EmptyState, 
  PageHeader 
} from '../src/components'; // Общие компоненты

import { 
  ColorPicker 
} from '../src/components'; // Формы

import { 
  MobileLayout, 
  TabNavigation 
} from '../src/components'; // Макет

import { 
  getTimeAgo, 
  formatCurrency, 
  formatDate 
} from '../src/utils'; // Утилиты

import { 
  bouquetColors, 
  productionTimeOptions 
} from '../src/constants'; // Константы

import type { 
  Product, 
  Order, 
  Customer 
} from '../src/types'; // Типы

import { Plus, Search, Package } from 'lucide-react';

// ❌ НЕПРАВИЛЬНО: Прямые импорты
// import { Button } from '../components/ui/button';
// import { StatusBadge } from '../components/common/StatusBadge/StatusBadge';

export function ExamplePage() {
  const [filter, setFilter] = useState('all');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Пример данных
  const orders: Order[] = [];
  const tabs = [
    { key: 'all', label: 'Все', count: 10 },
    { key: 'new', label: 'Новые', count: 3 },
    { key: 'completed', label: 'Выполненные', count: 7 }
  ];

  const navigationTabs = [
    { key: 'orders', label: 'Заказы', icon: <Package className="w-5 h-5" /> },
    { key: 'products', label: 'Товары', icon: <Plus className="w-5 h-5" /> }
  ];

  const headerActions = (
    <>
      <Button variant="ghost" size="sm">
        <Plus className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="sm">
        <Search className="w-5 h-5" />
      </Button>
    </>
  );

  return (
    <MobileLayout>
      {/* Заголовок страницы */}
      <PageHeader 
        title="Пример страницы"
        subtitle="Демонстрация дизайн системы"
        actions={headerActions}
      />

      <div className="p-4 space-y-6">
        {/* Статус бэйджи */}
        <section>
          <h3 className="mb-3">Статус бэйджи</h3>
          <div className="flex gap-2">
            <StatusBadge status="Активен" variant="success" />
            <StatusBadge status="Ожидает" variant="warning" />
            <StatusBadge status="Отменен" variant="error" />
            <StatusBadge status="Обычный" variant="default" />
          </div>
        </section>

        {/* Фильтрация */}
        <section>
          <h3 className="mb-3">Фильтрация</h3>
          <FilterTabs 
            tabs={tabs}
            activeTab={filter}
            onTabChange={setFilter}
          />
        </section>

        {/* Выбор цвета */}
        <section>
          <h3 className="mb-3">Выбор цвета</h3>
          <ColorPicker
            colors={bouquetColors}
            selectedColors={selectedColors}
            onChange={setSelectedColors}
            multiple={true}
          />
        </section>

        {/* Утилиты */}
        <section>
          <h3 className="mb-3">Утилиты</h3>
          <div className="space-y-2 text-sm">
            <p>Время: {getTimeAgo(new Date(Date.now() - 2 * 60 * 60 * 1000))}</p>
            <p>Валюта: {formatCurrency(15000)}</p>
            <p>Дата: {formatDate(new Date(2024, 0, 15))}</p>
          </div>
        </section>

        {/* Пустое состояние */}
        <section>
          <h3 className="mb-3">Пустое состояние</h3>
          <EmptyState
            icon={<Package className="w-8 h-8 text-gray-400" />}
            title="Нет заказов"
            description="Заказы появятся здесь после создания"
            action={
              <Button className="bg-gray-800 hover:bg-gray-900">
                Создать заказ
              </Button>
            }
          />
        </section>

        {/* Формы */}
        <section>
          <h3 className="mb-3">Формы</h3>
          <div className="space-y-4">
            <Input placeholder="Название товара" />
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Время изготовления" />
              </SelectTrigger>
              <SelectContent>
                {productionTimeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button className="bg-gray-800 hover:bg-gray-900">
                Сохранить
              </Button>
              <Button variant="outline">
                Отмена
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Навигация */}
      <TabNavigation
        tabs={navigationTabs}
        activeTab="orders"
        onTabChange={(tab) => console.log('Tab changed:', tab)}
      />
    </MobileLayout>
  );
}

/**
 * Пример создания нового компонента с использованием дизайн системы
 */
export function ProductCard() {
  const product: Partial<Product> = {
    id: 1,
    title: 'Букет роз',
    price: '12 000 ₸',
    isAvailable: true,
    createdAt: new Date()
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4>{product.title}</h4>
        <StatusBadge 
          status={product.isAvailable ? 'Активен' : 'Неактивен'} 
          variant={product.isAvailable ? 'success' : 'default'}
        />
      </div>
      
      <p className="text-gray-600 mb-2">{product.price}</p>
      
      <p className="text-sm text-gray-500">
        {product.createdAt && getTimeAgo(product.createdAt)}
      </p>
      
      <div className="flex gap-2 mt-3">
        <Button size="sm" className="bg-gray-800 hover:bg-gray-900">
          Редактировать
        </Button>
        <Button size="sm" variant="outline">
          Просмотр
        </Button>
      </div>
    </div>
  );
}