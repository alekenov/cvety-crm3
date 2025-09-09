import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Search, Package, Clipboard, X } from "lucide-react";
import { toast } from "sonner";
import { useInventory } from "@/shared/hooks/useInventory";
import { urlManager } from "../src/utils/url";
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
          className={`px-3 py-1 rounded text-sm transition-colors flex items-center gap-2 ${
            activeTab === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={`${activeTab === tab.key ? 'bg-white/20 text-primary-foreground' : 'bg-white text-gray-600'} px-1.5 py-0.5 rounded text-xs leading-none`}>
              {tab.count}
            </span>
          )}
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

// Import the InventoryItem type from the hook
import type { InventoryItem } from "@/shared/hooks/useInventory";

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
  searchQuery?: string;
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
  onEdit,
  searchQuery
}: InventoryItemProps) {
  // Функция для подсветки совпадений в поиске
  const highlightMatch = (text: string, query?: string) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div 
      className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onEdit(id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-4">
          <div 
            className="w-20 h-24 bg-cover bg-center rounded-lg relative overflow-hidden flex-shrink-0"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div>
            <div className="mb-1">
              <span className="text-gray-900">{highlightMatch(name, searchQuery)}</span>
            </div>
            <div className="text-gray-700">
              {highlightMatch(price, searchQuery)} / {unit}
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
  const params = urlManager.getParams();
  const initialFilter = (['all','flowers','greenery','accessories'] as const).includes((params.filter as any)) ? (params.filter as any) : 'all';
  const [filter, setFilter] = useState<'all' | 'flowers' | 'greenery' | 'accessories'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState(params.search || '');
  const [isSearchOpen, setIsSearchOpen] = useState(!!params.search);

  // Use React Query hook for data fetching
  const { data, isLoading, error, refetch } = useInventory();
  
  // Extract items from React Query data
  const allItems = data?.items || [];

  // Функция поиска товаров на складе
  const searchItems = (items: InventoryItem[], query: string) => {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase().trim();
    
    return items.filter(item => {
      return item.name.toLowerCase().includes(lowerQuery) ||
             item.price.toLowerCase().includes(lowerQuery) ||
             item.unit.toLowerCase().includes(lowerQuery);
    });
  };

  let filteredItems = allItems.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  // Применяем поиск
  filteredItems = searchItems(filteredItems, searchQuery);

  const handleEditItem = (id: number) => {
    if (onViewItem) {
      onViewItem(id);
    }
  };

  const handleSearchClick = () => {
    const newIsSearchOpen = !isSearchOpen;
    setIsSearchOpen(newIsSearchOpen);
    if (!newIsSearchOpen) {
      setSearchQuery('');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  // Sync state with URL and listen to history (without redundant tab parameter)
  useEffect(() => {
    urlManager.updateParams({ filter: filter === 'all' ? null : filter }, true);
  }, [filter]);
  useEffect(() => {
    urlManager.updateParams({ search: searchQuery || null }, true);
  }, [searchQuery]);
  useEffect(() => {
    const onPop = () => {
      const p = urlManager.getParams();
      setSearchQuery(p.search || '');
      setIsSearchOpen(!!p.search);
      const allowed = ['all','flowers','greenery','accessories'];
      setFilter((allowed.includes(p.filter || '') ? (p.filter as any) : 'all'));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const counts = useMemo(() => ({
    all: allItems.length,
    flowers: allItems.filter(i => i.category === 'flowers').length,
    greenery: allItems.filter(i => i.category === 'greenery').length,
    accessories: allItems.filter(i => i.category === 'accessories').length,
  }), [allItems]);

  const filterOptions = [
    { key: 'all', label: 'Все', count: counts.all },
    { key: 'flowers', label: 'Цветы', count: counts.flowers },
    { key: 'greenery', label: 'Зелень', count: counts.greenery },
    { key: 'accessories', label: 'Аксессуары', count: counts.accessories }
  ];

  const headerActions = (
    <>
      <Button variant="ghost" size="sm" className="p-2" onClick={onStartAudit}>
        <Clipboard className="w-5 h-5 text-gray-600" />
      </Button>
      <Button variant="ghost" size="sm" className="p-2" onClick={onAddItem}>
        <Plus className="w-5 h-5 text-gray-600" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`p-2 ${isSearchOpen ? 'bg-gray-100' : ''}`}
        onClick={handleSearchClick}
      >
        <Search className="w-5 h-5 text-gray-600" />
      </Button>
    </>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader title="Склад" actions={headerActions} />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Загрузка склада...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && filteredItems.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader title="Склад" actions={headerActions} />
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="text-red-500 text-center mb-4">
            {error instanceof Error ? error.message : 'Не удалось загрузить данные склада'}
          </div>
          <Button onClick={() => refetch()}>Попробовать снова</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Склад" actions={headerActions} />

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Input
              type="text"
              placeholder="Поиск по названию, цене или единице измерения..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-10"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              Найдено: {filteredItems.length} позиций
            </div>
          )}
        </div>
      )}

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
              searchQuery={searchQuery}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={searchQuery ? <Search className="w-8 h-8 text-gray-400" /> : <Package className="w-8 h-8 text-gray-400" />}
          title={searchQuery ? "По запросу ничего не найдено" : "Нет товаров на складе"}
          description={
            searchQuery 
              ? `Попробуйте изменить поисковый запрос "${searchQuery}"`
              : "Добавьте цветы и материалы для отслеживания остатков"
          }
        />
      )}
    </div>
  );
}
