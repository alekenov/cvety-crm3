import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { fetchProducts, toggleProductActive } from '../api/products';
import type { ProductDTO } from '../api/products';

// Convert ProductDTO to display format
interface Product {
  id: number;
  image: string;
  title: string;
  price: string;
  isAvailable: boolean;
  createdAt: Date;
  type: 'vitrina' | 'catalog';
  width?: string;
  height?: string;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} минут назад`;
  if (hours < 24) return `${hours} часов назад`;
  return `${days} дней назад`;
}

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

function ProductItem({ product, onToggle, onView }: {
  product: Product;
  onToggle: (id: number) => void;
  onView: (id: number) => void;
}) {
  const handleSwitchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(product.id);
  };

  return (
    <div 
      className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onView(product.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 bg-cover bg-center rounded-full relative overflow-hidden flex-shrink-0"
            style={{ backgroundImage: `url('${product.image}')` }}
          >
            {!product.isAvailable && <div className="absolute inset-0 bg-white/60"></div>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`${product.isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                {product.title}
              </span>
              <div className={`px-2 py-0.5 rounded text-xs ${
                product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {product.isAvailable ? 'Активен' : 'Неактивен'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-gray-700 ${!product.isAvailable ? 'text-gray-500' : ''}`}>
                {product.price}
              </div>
              {product.type === 'vitrina' && (product.width || product.height) && (
                <div className="text-sm text-gray-500">
                  {product.width && product.height ? 
                    `${product.width} × ${product.height} см` : 
                    product.width ? `Ш: ${product.width} см` : 
                    `В: ${product.height} см`}
                </div>
              )}
            </div>
            <div className="text-gray-600 text-sm">
              {getTimeAgo(product.createdAt)}
            </div>
          </div>
        </div>
        <Switch 
          checked={product.isAvailable} 
          onCheckedChange={() => onToggle(product.id)}
          onClick={handleSwitchClick}
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>
    </div>
  );
}

export default function ProductsList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'vitrina' | 'catalog'>('vitrina');

  // Convert ProductDTO to Product
  const convertDTOToProduct = (dto: ProductDTO): Product => {
    // Parse date with validation
    let createdDate = new Date();
    if (dto.createdAt) {
      const parsed = new Date(dto.createdAt);
      // Check if date is valid and not in the past (before year 2000)
      if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000) {
        createdDate = parsed;
      }
    }
    
    return {
      id: dto.id,
      image: dto.image,
      title: dto.title,
      price: dto.price,
      isAvailable: dto.isAvailable,
      createdAt: createdDate,
      type: dto.type,
      width: dto.width || dto.catalogWidth,
      height: dto.height || dto.catalogHeight,
    };
  };

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const result = await fetchProducts({ limit: 100 });
        if (result.success && result.data) {
          const convertedProducts = result.data.map(convertDTOToProduct);
          setProducts(convertedProducts);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleViewProduct = (id: number) => {
    navigate(`/products/${id}`);
  };

  const handleToggleProduct = async (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    try {
      // Optimistically update UI
      setProducts(prev => 
        prev.map(p => 
          p.id === id 
            ? { ...p, isAvailable: !p.isAvailable }
            : p
        )
      );
      
      // Call API
      await toggleProductActive(id, !product.isAvailable);
    } catch (error) {
      console.error('Failed to toggle product status:', error);
      // Revert on error
      setProducts(prev => 
        prev.map(p => 
          p.id === id 
            ? { ...p, isAvailable: product.isAvailable }
            : p
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

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
      <Button variant="ghost" size="sm" className="p-2" onClick={handleAddProduct}>
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
          onTabChange={(tab) => setFilter(tab as any)} 
        />
      </div>

      {/* Products List */}
      <div className="pb-20">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductItem 
              key={product.id}
              product={product}
              onToggle={handleToggleProduct}
              onView={handleViewProduct}
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