import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Product } from '../src/types';
import { getTimeAgo } from '../src/utils/date';
import { useAppContext } from '../src/contexts/AppContext';
import { useAppActions } from '../src/hooks/useAppActions';


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

function ProductItem({ id, image, title, price, isAvailable, createdAt, onToggle, onView }: Product & {
  onToggle: (id: number) => void;
  onView: (id: number) => void;
}) {
  const handleSwitchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(id);
  };

  return (
    <div 
      className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onView(id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 bg-cover bg-center rounded-full relative overflow-hidden flex-shrink-0"
            style={{ backgroundImage: `url('${image}')` }}
          >
            {!isAvailable && <div className="absolute inset-0 bg-white/60"></div>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                {title}
              </span>
              <div className={`px-2 py-0.5 rounded text-xs ${
                isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {isAvailable ? 'Активен' : 'Неактивен'}
              </div>
            </div>
            <div className={`text-gray-700 ${!isAvailable ? 'text-gray-500' : ''}`}>
              {price}
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
  
  const products = state.products;
  const onAddProduct = () => navigate('/products/add');
  const onViewProduct = (id: number) => navigate(`/products/${id}`);
  const onToggleProduct = actions.toggleProductStatus;
  // Initialize filter from URL or default to 'vitrina'
  const getInitialFilter = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterFromUrl = urlParams.get('filter');
    if (filterFromUrl === 'catalog') return 'catalog';
    if (filterFromUrl === 'vitrina') return 'vitrina';
    return 'vitrina';
  };
  
  const [filter, setFilter] = useState<'vitrina' | 'catalog'>(getInitialFilter());

  const handleFilterChange = (newFilter: 'vitrina' | 'catalog') => {
    setFilter(newFilter);
    // Update URL with filter parameter
    const url = new URL(window.location.href);
    url.searchParams.set('filter', newFilter);
    window.history.pushState({}, '', url.toString());
  };

  const vitrinaProducts = products.filter((product: Product) => product.type === 'vitrina');
  // For catalog: exclude products with "Собранный букет" in title (these are ready-made products)
  const catalogProducts = products.filter((product: Product) => 
    product.type === 'catalog' && !product.title.includes('Собранный букет')
  );

  // IMPORTANT: Show only products of the selected type, no mixing
  // Show all products including inactive ones (users can toggle them with switches)
  const filteredProducts = filter === 'vitrina' 
    ? vitrinaProducts
    : catalogProducts;

  const vitrinaCount = vitrinaProducts.length;
  const catalogCount = catalogProducts.length;

  const tabs = [
    { key: 'vitrina', label: 'Витрина', count: vitrinaCount },
    { key: 'catalog', label: 'Каталог', count: catalogCount }
  ];

  const headerActions = (
    <>
      <Button variant="ghost" size="sm" className="p-2" onClick={onAddProduct}>
        <Plus className="w-5 h-5 text-gray-600" />
      </Button>
      <Button variant="ghost" size="sm" className="p-2">
        <Search className="w-5 h-5 text-gray-600" />
      </Button>
    </>
  );

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Товары" actions={headerActions} />

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
            />
          ))
        ) : (
          <EmptyState
            icon={<Plus className="w-8 h-8 text-gray-400" />}
            title={filter === 'vitrina' ? 'Нет товаров в витрине' : 'Нет товаров в каталоге'}
            description={
              filter === 'vitrina' 
                ? 'Включите товары в витрину, чтобы они отображались покупателям'
                : 'Добавьте товары в каталог, чтобы начать продавать'
            }
          />
        )}
      </div>
    </div>
  );
}
