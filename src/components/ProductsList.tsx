import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Product } from '../src/types';
import { getTimeAgo } from '../src/utils/date';
// Use React Query hooks instead of context
import { useProducts, useToggleProduct } from '../shared/hooks/useProducts';
import { useAppContext } from '../src/contexts/AppContext';
import { useAppActions } from '../src/hooks/useAppActions';
import { toast } from 'sonner';
// Import virtualization components
import { VirtualizedProductList, useVirtualization } from './VirtualizedProductList';


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

function EmptyState({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center mb-4">{description}</p>
    </div>
  );
}

function PageHeader({ title, actions }: { 
  title: string; 
  actions?: React.ReactNode; 
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div>
        <h1 className="text-gray-900">{title}</h1>
      </div>
      {actions && <div className="flex gap-1">{actions}</div>}
    </div>
  );
}

const ProductItem = React.memo(({ id, image, title, price, isAvailable, createdAt, onToggle, onView, searchQuery }: Product & {
  onToggle: (id: number) => void;
  onView: (id: number) => void;
  searchQuery?: string;
}) => {
  const handleSwitchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(id);
  };

  // Подсветка совпадений для строки поиска
  const highlightMatch = (text: string, query?: string) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
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
      onClick={() => onView(id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-24 rounded-lg relative overflow-hidden flex-shrink-0 bg-gray-100">
            {image ? (
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-xs" style={{ display: image ? 'none' : 'flex' }}>
              Нет фото
            </div>
            {!isAvailable && <div className="absolute inset-0 bg-white/60"></div>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                {highlightMatch(title, searchQuery)}
              </span>
              <div className={`px-2 py-0.5 rounded text-xs ${
                isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {isAvailable ? 'Активен' : 'Неактивен'}
              </div>
            </div>
            <div className={`text-gray-700 ${!isAvailable ? 'text-gray-500' : ''}`}>
              {highlightMatch(price, searchQuery)}
            </div>
            <div className="text-gray-600 text-sm">
              {title === 'Собранный букет' ? 'Только что' : getTimeAgo(createdAt)}
            </div>
          </div>
        </div>
        <Switch 
          checked={isAvailable} 
          onCheckedChange={() => onToggle(id)}
          onClick={handleSwitchClick}
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>
    </div>
  );
});

export default function ProductsList() {
  const navigate = useNavigate();
  const state = useAppContext();
  
  // Local state for UI
  const [filter, setFilter] = useState<'vitrina' | 'catalog'>('vitrina');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // React Query hooks
  const { data: productsResponse, isLoading, error, isError } = useProducts({ 
    type: filter, 
    limit: 100 
  });
  const toggleProductMutation = useToggleProduct();

  // Navigation handlers
  const onAddProduct = () => navigate('/products/add');
  const onViewProduct = (id: number) => navigate(`/products/${id}`);
  
  // Toggle with optimistic updates via React Query
  const onToggleProduct = (id: number) => {
    toggleProductMutation.mutate(id);
  };
  
  // Memoized products transformation for performance
  const products = useMemo(() => {
    if (!productsResponse?.data) return [];
    
    // Transform ProductDTO to Product format
    return productsResponse.data.map((dto: any) => ({
      id: dto.id,
      image: dto.image,
      images: dto.images,
      title: dto.title,
      price: dto.price,
      isAvailable: dto.isAvailable,
      createdAt: dto.createdAt || new Date(),
      type: dto.type,
      width: dto.width,
      height: dto.height,
      video: dto.video,
      duration: dto.duration,
      discount: dto.discount,
      composition: dto.composition,
      colors: dto.colors,
      catalogWidth: dto.catalogWidth,
      catalogHeight: dto.catalogHeight,
      productionTime: dto.productionTime
    } as Product));
  }, [productsResponse?.data]);

  // Memoized handlers for better performance
  const handleFilterChange = useCallback((newFilter: 'vitrina' | 'catalog') => {
    setFilter(newFilter);
  }, []);

  const handleSearchClick = useCallback(() => {
    setIsSearchOpen(prev => {
      if (!prev) {
        setSearchQuery('');
      }
      return !prev;
    });
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchOpen(false);
  }, []);

  // Memoized navigation handlers to prevent ProductItem re-renders
  const handleProductView = useCallback((id: number) => {
    onViewProduct(id);
  }, [onViewProduct]);
  
  const handleProductToggle = useCallback((id: number) => {
    onToggleProduct(id);
  }, [onToggleProduct]);

  // URL sync removed for cleaner routing

  // Memoized filtering for performance
  const { vitrinaProducts, catalogProducts, activeVitrinaCount, activeCatalogCount } = useMemo(() => {
    const vitrina = products.filter((product: Product) => product.type === 'vitrina');
    const catalog = products.filter((product: Product) => product.type === 'catalog');
    
    return {
      vitrinaProducts: vitrina,
      catalogProducts: catalog,
      activeVitrinaCount: vitrina.filter(p => p.isAvailable).length,
      activeCatalogCount: catalog.filter(p => p.isAvailable).length
    };
  }, [products]);

  // Memoized filtered and searched products
  const filteredProducts = useMemo(() => {
    // Filter by type and availability
    const baseProducts = filter === 'vitrina'
      ? vitrinaProducts.filter(p => p.isAvailable)
      : catalogProducts.filter(p => p.isAvailable);

    // Apply search filter
    if (!searchQuery.trim()) return baseProducts;
    
    const searchLower = searchQuery.toLowerCase().trim();
    return baseProducts.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.price.toLowerCase().includes(searchLower)
    );
  }, [filter, vitrinaProducts, catalogProducts, searchQuery]);

  // Virtualization settings
  const virtualization = useVirtualization(filteredProducts.length, 500);

  const tabs = [
    { key: 'vitrina', label: 'Витрина', count: activeVitrinaCount },
    { key: 'catalog', label: 'Каталог', count: activeCatalogCount }
  ];

  const headerActions = (
    <>
      <Button variant="ghost" size="sm" className="p-2" onClick={onAddProduct}>
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

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  // Error state  
  if (isError) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error?.message || 'Ошибка при загрузке товаров'}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Повторить попытку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Товары" actions={headerActions} />

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по названию товара или цене..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              Найдено: {filteredProducts.length} товаров
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="p-4 border-b border-gray-100">
        <FilterTabs 
          tabs={tabs} 
          activeTab={filter} 
          onTabChange={(tab) => handleFilterChange(tab as 'vitrina' | 'catalog')} 
        />
      </div>

      {/* Products List */}
      <div className="pb-20">
        {filteredProducts.length > 0 ? (
          virtualization.shouldVirtualize ? (
            <VirtualizedProductList
              products={filteredProducts}
              itemHeight={virtualization.itemHeight}
              height={virtualization.height}
              onToggle={handleProductToggle}
              onView={handleProductView}
              searchQuery={searchQuery}
              ItemComponent={ProductItem}
            />
          ) : (
            filteredProducts.map((product) => (
              <ProductItem 
                key={product.id}
                {...product}
                onToggle={handleProductToggle}
                onView={handleProductView}
                searchQuery={searchQuery}
              />
            ))
          )
        ) : (
          <EmptyState
            icon={searchQuery ? <Search className="w-8 h-8 text-gray-400" /> : <Plus className="w-8 h-8 text-gray-400" />}
            title={
              searchQuery ? 'По запросу ничего не найдено' :
              filter === 'vitrina' ? 'Нет товаров в витрине' : 'Нет товаров'
            }
            description={
              searchQuery
                ? `Попробуйте изменить поисковый запрос "${searchQuery}"`
                : filter === 'vitrina'
                  ? 'Включите товары в витрину, чтобы они отображались покупателям'
                  : 'Добавьте свой первый товар, чтобы начать продавать'
            }
          />
        )}
      </div>
    </div>
  );
}
