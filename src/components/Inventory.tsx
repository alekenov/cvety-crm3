import { useState } from "react";
import { Button } from "./ui/button";
import { Plus, Search, Package, Clipboard } from "lucide-react";
// Temporary inline components to avoid import issues

function FilterTabs({ tabs, activeTab, onTabChange }: { 
  tabs: Array<{ key: string; label: string; count?: number }>; 
  activeTab: string; 
  onTabChange: (tab: string) => void; 
}) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            activeTab === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && ` (${tab.count})`}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description, action }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  action?: React.ReactNode; 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center mb-4">{description}</p>
      {action}
    </div>
  );
}

function PageHeader({ title, subtitle, onBack, actions }: { 
  title: string; 
  subtitle?: string; 
  onBack?: () => void; 
  actions?: React.ReactNode; 
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div className="flex items-center">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 mr-3">
            {/* ArrowLeft icon will be imported separately if needed */}
          </Button>
        )}
        <div>
          <h1 className="text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex gap-1">{actions}</div>}
    </div>
  );
}

interface InventoryItem {
  id: number;
  name: string;
  category: 'flowers' | 'greenery' | 'accessories';
  price: string; // за единицу
  unit: string; // штука, грамм, метр
  quantity: number; // текущий остаток
  lastDelivery: Date;
  image: string;
}

const mockInventoryItems: InventoryItem[] = [
  {
    id: 1,
    name: "Розы красные",
    category: 'flowers',
    price: "450 ₸",
    unit: "шт",
    quantity: 85,
    lastDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=100&h=100&fit=crop"
  },
  {
    id: 2,
    name: "Тюльпаны белые",
    category: 'flowers',
    price: "320 ₸",
    unit: "шт",
    quantity: 12,
    lastDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=100&h=100&fit=crop"
  },
  {
    id: 3,
    name: "Лилии розовые",
    category: 'flowers',
    price: "650 ₸",
    unit: "шт",
    quantity: 24,
    lastDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1565011523534-747a8601f1a4?w=100&h=100&fit=crop"
  },
  {
    id: 4,
    name: "Эвкалипт",
    category: 'greenery',
    price: "180 ₸",
    unit: "ветка",
    quantity: 45,
    lastDelivery: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1586744687037-b4f9c5d1fcd8?w=100&h=100&fit=crop"
  },
  {
    id: 5,
    name: "Хризантемы желтые",
    category: 'flowers',
    price: "280 ₸",
    unit: "шт",
    quantity: 8,
    lastDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1572731973537-34afe46c4bc6?w=100&h=100&fit=crop"
  },
  {
    id: 6,
    name: "Лента атласная",
    category: 'accessories',
    price: "25 ₸",
    unit: "метр",
    quantity: 150,
    lastDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=100&fit=crop"
  },
  {
    id: 7,
    name: "Гипсофила",
    category: 'flowers',
    price: "120 ₸",
    unit: "ветка",
    quantity: 3,
    lastDelivery: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop"
  }
];

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Сегодня';
  } else if (diffInDays === 1) {
    return 'Вчера';
  } else if (diffInDays > 0) {
    return `${diffInDays} дн. назад`;
  } else {
    // Future date
    const futureDays = Math.abs(diffInDays);
    if (futureDays === 1) {
      return 'Завтра';
    } else {
      return `Через ${futureDays} дн.`;
    }
  }
}

interface InventoryItemProps extends InventoryItem {
  onEdit: (id: number) => void;
}

function InventoryItemComponent({ 
  id, 
  name, 
  category, 
  price, 
  unit, 
  quantity, 
  lastDelivery, 
  image,
  onEdit 
}: InventoryItemProps) {
  return (
    <div 
      className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onEdit(id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 bg-cover bg-center rounded-full relative overflow-hidden flex-shrink-0"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div>
            <div className="mb-1">
              <span className="text-gray-900">{name}</span>
            </div>
            <div className="text-gray-700">
              {price} / {unit}
            </div>
            <div className="text-gray-600 text-sm">
              Поставка: {getTimeAgo(lastDelivery)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-900">
            {quantity} {unit}
          </div>
        </div>
      </div>
    </div>
  );
}

interface InventoryProps {
  onAddItem?: () => void;
  onViewItem?: (itemId: number) => void;
  onStartAudit?: () => void;
}

export function Inventory({ onAddItem, onViewItem, onStartAudit }: InventoryProps) {
  const [filter, setFilter] = useState<'all' | 'flowers' | 'greenery' | 'accessories'>('all');
  const [items] = useState<InventoryItem[]>(mockInventoryItems);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const handleEditItem = (id: number) => {
    if (onViewItem) {
      onViewItem(id);
    }
  };

  const filterOptions = [
    { key: 'all', label: 'Все' },
    { key: 'flowers', label: 'Цветы' },
    { key: 'greenery', label: 'Зелень' },
    { key: 'accessories', label: 'Аксессуары' }
  ];

  const headerActions = (
    <>
      <Button variant="ghost" size="sm" className="p-2" onClick={onStartAudit}>
        <Clipboard className="w-5 h-5 text-gray-600" />
      </Button>
      <Button variant="ghost" size="sm" className="p-2" onClick={onAddItem}>
        <Plus className="w-5 h-5 text-gray-600" />
      </Button>
      <Button variant="ghost" size="sm" className="p-2">
        <Search className="w-5 h-5 text-gray-600" />
      </Button>
    </>
  );

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Склад" actions={headerActions} />

      {/* Filter Tabs */}
      <div className="p-4 border-b border-gray-100">
        <FilterTabs 
          tabs={filterOptions} 
          activeTab={filter} 
          onTabChange={(tab) => setFilter(tab as any)} 
        />
      </div>

      {/* Items List */}
      {filteredItems.length > 0 ? (
        <div className="pb-20">
          {filteredItems.map((item) => (
            <InventoryItemComponent 
              key={item.id}
              {...item}
              onEdit={handleEditItem}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="w-8 h-8 text-gray-400" />}
          title="Нет товаров на складе"
          description="Добавьте цветы и материалы для отслеживания остатков"
        />
      )}
    </div>
  );
}