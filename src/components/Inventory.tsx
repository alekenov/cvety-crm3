import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { Plus, Search, Package, Clipboard, Loader2 } from "lucide-react";
import { useAppContext } from "../src/contexts/AppContext";
import type { InventoryItem } from "../src/types";
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
  service,
  onEdit 
}: InventoryItemProps) {
  const imageUrl = image || "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=100&h=100&fit=crop";
  
  return (
    <div 
      className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onEdit(id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 bg-cover bg-center rounded-full relative overflow-hidden flex-shrink-0"
            style={{ backgroundImage: `url('${imageUrl}')` }}
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-900">{name}</span>
              {service && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                  Услуга
                </span>
              )}
            </div>
            <div className="text-gray-700">
              {price} / {unit}
            </div>
            {lastDelivery && (
              <div className="text-gray-600 text-sm">
                Поставка: {getTimeAgo(lastDelivery)}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-gray-900 ${quantity === 0 ? 'text-red-600' : quantity < 10 ? 'text-orange-600' : ''}`}>
            {quantity} {unit}
          </div>
          {quantity === 0 && (
            <div className="text-xs text-red-500 mt-1">Нет в наличии</div>
          )}
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
  const { inventoryItems, isLoadingInventory, inventoryPagination, loadInventoryItems } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'flowers' | 'greenery' | 'accessories'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Filter items locally for category, use API for search
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      if (filter === 'all') return true;
      return item.category === filter;
    });
  }, [inventoryItems, filter]);

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      await loadInventoryItems({
        search: query.trim() || undefined,
        offset: 0
      });
    }, 300),
    [loadInventoryItems]
  );

  // Handle search with API
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Simple debounce implementation
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Handle filter change
  const handleFilterChange = async (newFilter: 'all' | 'flowers' | 'greenery' | 'accessories') => {
    setFilter(newFilter);
    
    // For API-level filtering, we could map categories to flower types
    let flowerFilter: string | undefined;
    if (newFilter === 'flowers') {
      flowerFilter = 'roses'; // Default to roses, could be enhanced
    }
    
    await loadInventoryItems({
      flower: flowerFilter,
      search: searchQuery.trim() || undefined,
      offset: 0
    });
  };

  const handleEditItem = (id: number) => {
    if (onViewItem) {
      onViewItem(id);
    }
  };

  const handleLoadMore = async () => {
    if (!inventoryPagination.hasMore || isLoadingInventory) return;
    
    await loadInventoryItems({
      search: searchQuery.trim() || undefined,
      offset: inventoryPagination.offset + inventoryPagination.limit
    });
  };

  const filterOptions = [
    { key: 'all', label: 'Все', count: inventoryItems.length },
    { key: 'flowers', label: 'Цветы', count: inventoryItems.filter(i => i.category === 'flowers').length },
    { key: 'greenery', label: 'Зелень', count: inventoryItems.filter(i => i.category === 'greenery').length },
    { key: 'accessories', label: 'Аксессуары', count: inventoryItems.filter(i => i.category === 'accessories').length }
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
        className="p-2"
        onClick={() => setShowSearch(!showSearch)}
      >
        <Search className="w-5 h-5 text-gray-600" />
      </Button>
    </>
  );

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Склад" actions={headerActions} />

      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="p-4 border-b border-gray-100">
        <FilterTabs 
          tabs={filterOptions} 
          activeTab={filter} 
          onTabChange={(tab) => handleFilterChange(tab as any)} 
        />
      </div>

      {/* Loading State */}
      {isLoadingInventory && inventoryItems.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
            <p className="text-gray-600">Загрузка товаров...</p>
          </div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="pb-20">
          {filteredItems.map((item) => (
            <InventoryItemComponent 
              key={item.id}
              {...item}
              onEdit={handleEditItem}
            />
          ))}

          {/* Load More Button */}
          {inventoryPagination.hasMore && (
            <div className="p-4 text-center border-t border-gray-100">
              <Button 
                variant="ghost" 
                onClick={handleLoadMore}
                disabled={isLoadingInventory}
                className="w-full"
              >
                {isLoadingInventory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Загрузка...
                  </>
                ) : (
                  `Показать ещё (осталось ${inventoryPagination.total - inventoryPagination.offset - inventoryPagination.limit})`
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="w-8 h-8 text-gray-400" />}
          title={searchQuery ? "Товары не найдены" : "Нет товаров на складе"}
          description={searchQuery ? `По запросу "${searchQuery}" ничего не найдено` : "Добавьте цветы и материалы для отслеживания остатков"}
        />
      )}
    </div>
  );
}