import React, { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Product } from '../src/types';
import { getTimeAgo } from '../src/utils/date';
// Removed URL utilities for clean routing
import { useAppContext } from '../src/contexts/AppContext';
import { useAppActions } from '../src/hooks/useAppActions';
// Import real API
import { fetchProducts, toggleProductActive, type ProductDTO } from '../api/products';
import { toast } from 'sonner';


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
              ? 'bg-blue-600 text-white'
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

function ProductItem({ id, image, title, price, isAvailable, createdAt, onToggle, onView, searchQuery }: Product & {
  onToggle: (id: number) => void;
  onView: (id: number) => void;
  searchQuery?: string;
}) {
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
}

export default function ProductsList() {
  const navigate = useNavigate();
  const state = useAppContext();
  const actions = useAppActions({
    setCurrentScreen: state.setCurrentScreen,
    navigateToScreen: state.navigateToScreen,
    navigateBack: state.navigateBack,
    setActiveTab: state.setActiveTab,
    setSelectedProductId: state.setSelectedProductId,
    setSelectedOrderId: state.setSelectedOrderId,
    setSelectedInventoryItemId: state.setSelectedInventoryItemId,
    setSelectedCustomerId: state.setSelectedCustomerId,
    setProducts: state.setProducts,
    setOrders: state.setOrders,
    setCustomers: state.setCustomers,
    products: state.products,
    customers: state.customers
  });
  
  // Real API data state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onAddProduct = () => navigate('/products/add');
  const onViewProduct = (id: number) => navigate(`/products/${id}`);
  // Prevent double-toggles while request is in-flight
  const inFlight = React.useRef<Set<number>>(new Set());

  const onToggleProduct = async (id: number) => {
    if (inFlight.current.has(id)) return;
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return;
    const prev = products[idx];
    const nextAvailable = !prev.isAvailable;
    // optimistic update
    setProducts(prevList => prevList.map(p => p.id === id ? { ...p, isAvailable: nextAvailable } : p));
    inFlight.current.add(id);
    try {
      await toggleProductActive(id, nextAvailable);
      toast.success(nextAvailable ? 'Товар включён' : 'Товар выключен');
    } catch (e: any) {
      // revert
      setProducts(prevList => prevList.map(p => p.id === id ? { ...p, isAvailable: !nextAvailable } : p));
      console.error('Failed to toggle product', e);
      toast.error('Не удалось изменить статус товара');
    } finally {
      inFlight.current.delete(id);
    }
  };
  // Local state without URL synchronization for clean routing
  const [filter, setFilter] = useState<'vitrina' | 'catalog'>('vitrina');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Function to load products from API
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchProducts({
        type: filter,
        limit: 100
      });
      
      if (response.success && response.data) {
        // Transform ProductDTO to Product
        const transformedProducts: Product[] = response.data.map((dto: ProductDTO) => ({
          id: dto.id,
          image: dto.image,
          images: dto.images,
          title: dto.title,
          price: dto.price,
          isAvailable: dto.isAvailable,
          createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
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
        }));
        
        setProducts(transformedProducts);
      } else {
        setError('Не удалось загрузить товары');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Ошибка при загрузке товаров');
    } finally {
      setIsLoading(false);
    }
  };

  // Load products on component mount and filter change
  useEffect(() => {
    loadProducts();
  }, [filter]);

  const handleFilterChange = (newFilter: 'vitrina' | 'catalog') => {
    setFilter(newFilter);
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

  const vitrinaProducts = products.filter((product: Product) => product.type === 'vitrina');
  const catalogProducts = products.filter((product: Product) => product.type === 'catalog');

  // Показываем только активные товары для обеих категорий
  let filteredProducts = filter === 'vitrina'
    ? vitrinaProducts.filter(p => p.isAvailable)
    : catalogProducts.filter(p => p.isAvailable);

  // Поиск по названию/цене
  const runSearch = (items: Product[], q: string) => {
    if (!q.trim()) return items;
    const lower = q.toLowerCase().trim();
    return items.filter(p =>
      p.title.toLowerCase().includes(lower) ||
      p.price.toLowerCase().includes(lower)
    );
  };
  filteredProducts = runSearch(filteredProducts, searchQuery);

  const activeVitrinaCount = vitrinaProducts.filter(p => p.isAvailable).length;
  const activeCatalogCount = catalogProducts.filter(p => p.isAvailable).length;

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
  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Повторить попытку
          </button>
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
          filteredProducts.map((product) => (
            <ProductItem 
              key={product.id}
              {...product}
              onToggle={onToggleProduct}
              onView={onViewProduct}
              searchQuery={searchQuery}
            />
          ))
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
