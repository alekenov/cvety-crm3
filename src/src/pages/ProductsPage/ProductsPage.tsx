import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button, Switch } from '../../components/ui';
import { FilterTabs, EmptyState, PageHeader } from '../../components/common';
import { getTimeAgo } from '../../utils';
import type { Product } from '../../types';

interface ProductItemProps extends Product {
  onToggle: (id: number) => void;
  onView: (id: number) => void;
}

function ProductItem({ 
  id, image, title, price, isAvailable, createdAt, onToggle, onView 
}: ProductItemProps) {
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
              {getTimeAgo(createdAt)}
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

interface ProductsPageProps {
  products: Product[];
  onAddProduct: () => void;
  onViewProduct: (id: number) => void;
  onToggleProduct: (id: number) => void;
}

export function ProductsPage({ 
  products, onAddProduct, onViewProduct, onToggleProduct 
}: ProductsPageProps) {
  const [filter, setFilter] = useState<'vitrina' | 'catalog'>('vitrina');

  const vitrinaProducts = products.filter(product => product.type === 'vitrina');
  const catalogProducts = products.filter(product => product.type === 'catalog');

  const filteredProducts = filter === 'vitrina' 
    ? vitrinaProducts.filter(product => product.isAvailable)
    : catalogProducts;

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
      <Button variant="ghost" size="sm" className="p-2">
        <Search className="w-5 h-5 text-gray-600" />
      </Button>
    </>
  );

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Товары" actions={headerActions} />

      {/* Filter Tags */}
      <div className="p-4 border-b border-gray-100">
        <FilterTabs tabs={tabs} activeTab={filter} onTabChange={(tab) => setFilter(tab as any)} />
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
            title={filter === 'vitrina' ? 'Нет товаров в витрине' : 'Нет товаров'}
            description={
              filter === 'vitrina' 
                ? 'Включите товары в витрину, чтобы они отображались покупателям'
                : 'Добавьте свой первый товар, чтобы начать продавать'
            }
          />
        )}
      </div>
    </div>
  );
}