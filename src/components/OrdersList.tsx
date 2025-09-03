import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package } from 'lucide-react';
import { Button } from './ui/button';
import { fetchOrders, changeOrderStatus, type FrontStatus, type Order } from '../api/orders';
import { getTimeAgo } from '../utils/date';

// Status badge component matching original design
function StatusBadge({ status, variant = 'default' }: { status: string; variant?: 'default' | 'success' | 'warning' | 'error' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700'
  };
  
  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${variants[variant]}`}>
      {status}
    </div>
  );
}

// Filter tabs component
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

// Empty state component
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

// Page header component
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

const STATUS_CONFIG = {
  new: { label: 'Новый', border: 'border-red-500', text: 'text-red-500' },
  paid: { label: 'Оплачен', border: 'border-blue-500', text: 'text-blue-500' },
  accepted: { label: 'Принят', border: 'border-pink-500', text: 'text-pink-500' },
  assembled: { label: 'Собран', border: 'border-yellow-500', text: 'text-yellow-500' },
  'in-transit': { label: 'В пути', border: 'border-green-500', text: 'text-green-500' },
  completed: { label: 'Завершен', border: 'border-gray-500', text: 'text-gray-500' }
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'paid', label: 'Оплаченные' },
  { key: 'accepted', label: 'Принятые' },
  { key: 'assembled', label: 'Собранные' }
];

const ACTION_BUTTONS = {
  new: 'Оплачен',
  paid: 'Принять',
  accepted: '+ Фото',
  assembled: '→ Курьеру',
  'in-transit': 'Завершить'
};

function OrderStatusBadge({ status }: { status: FrontStatus }) {
  const config = STATUS_CONFIG[status];
  const variantMap = {
    new: 'error' as const,
    paid: 'default' as const,
    accepted: 'warning' as const,
    assembled: 'warning' as const,
    'in-transit': 'success' as const,
    completed: 'default' as const
  };
  
  return (
    <StatusBadge 
      status={config.label} 
      variant={variantMap[status]} 
    />
  );
}

// Order item component matching original design
function OrderItem({ 
  order, 
  onClick, 
  onStatusChange 
}: { 
  order: Order; 
  onClick?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: FrontStatus) => void;
}) {
  const handleStatusClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const statusFlow = {
      new: 'paid',
      paid: 'accepted', 
      accepted: 'assembled',
      assembled: 'in-transit',
      'in-transit': 'completed'
    } as const;
    
    const newStatus = statusFlow[order.status];
    if (newStatus && onStatusChange) {
      await onStatusChange(order.id, newStatus);
    }
  };

  // Get all product images (main + additional)
  const allProductImages = [
    { image: order.mainProduct.image, id: order.mainProduct.id },
    ...(order.additionalItems?.map(item => ({ 
      image: item.productImage, 
      id: item.productId 
    })) || [])
  ].filter(item => item.image); // Filter out items without images

  // Show max 3 images + counter for the rest
  const maxVisible = 3;
  const visibleImages = allProductImages.slice(0, maxVisible);
  const extraCount = allProductImages.length > maxVisible ? allProductImages.length - maxVisible : 0;
  
  return (
    <div 
      className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onClick?.(order.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-900">{order.number}</span>
            <OrderStatusBadge status={order.status} />
            {order.payment.amount && order.payment.amount !== '0 ₸' && (
              <span className="text-gray-700 font-medium ml-2">{order.payment.amount}</span>
            )}
          </div>
          <div className="text-gray-700">
            {order.deliveryType === 'pickup' ? (
              'Самовывоз'
            ) : (
              <>
                {order.deliveryCity || 'Город не указан'}
                {order.deliveryAddress && order.deliveryAddress !== 'Узнать у получателя' && (
                  <>, {order.deliveryAddress}</>
                )}
              </>
            )}
          </div>
          <div className="text-gray-600 text-sm">
            {order.deliveryDate === 'today' ? 'Сегодня' : order.deliveryDate === 'tomorrow' ? 'Завтра' : order.deliveryDate}
            {order.deliveryTime && (
              order.deliveryTime === 'Узнать время у получателя' 
                ? ', время уточнить' 
                : `, ${order.deliveryTime}`
            )}
            {' • '}{getTimeAgo(order.createdAt)}
          </div>
        </div>
        {order.status !== 'completed' && ACTION_BUTTONS[order.status] && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-900 hover:bg-gray-100 hover:border-gray-300"
            onClick={handleStatusClick}
          >
            {ACTION_BUTTONS[order.status]}
          </Button>
        )}
      </div>

      {order.executor?.florist && (
        <div className="mb-3 text-sm text-gray-600">
          {order.executor.florist} • Флорист
        </div>
      )}

      {/* Product preview with overlapping circles */}
      {visibleImages.length > 0 && (
        <div className="flex items-center">
          {visibleImages.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="w-12 h-12 rounded-full border-2 border-white bg-cover bg-center"
              style={{ 
                backgroundImage: `url('${product.image}')`,
                marginLeft: index > 0 ? '-8px' : '0',
                zIndex: visibleImages.length - index
              }}
            />
          ))}
          {extraCount > 0 && (
            <div 
              className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center"
              style={{ marginLeft: '-8px' }}
            >
              <span className="text-gray-600 text-sm">+{extraCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type FilterType = 'all' | FrontStatus;

export default function OrdersList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = activeFilter === 'all' ? {} : { status: activeFilter };
        const result = await fetchOrders({ ...params, limit: 50 });
        
        if (result.success && result.data) {
          setOrders(result.data);
        } else {
          setError('Не удалось загрузить заказы');
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
        setError('Ошибка при загрузке заказов');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, [activeFilter]);

  const handleAddOrder = () => {
    navigate('/orders/add');
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleStatusChange = async (orderId: string, newStatus: FrontStatus) => {
    try {
      await changeOrderStatus(orderId, newStatus);
      // Update local state optimistically
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Failed to change order status:', error);
    }
  };

  // Filter out completed orders and apply status filter
  const filteredOrders = activeFilter === 'all' 
    ? orders.filter(order => order.status !== 'completed')
    : orders.filter(order => order.status === activeFilter && order.status !== 'completed');

  // Count orders by status for tabs (excluding completed)
  const statusCounts = {
    all: orders.filter(o => o.status !== 'completed').length,
    new: orders.filter(o => o.status === 'new').length,
    paid: orders.filter(o => o.status === 'paid').length,
    accepted: orders.filter(o => o.status === 'accepted').length,
    assembled: orders.filter(o => o.status === 'assembled').length,
  };

  const tabsWithCounts = FILTER_OPTIONS.map(tab => ({
    ...tab,
    count: statusCounts[tab.key as keyof typeof statusCounts]
  }));

  const headerActions = (
    <>
      <Button variant="ghost" size="sm" className="p-2" onClick={handleAddOrder}>
        <Plus className="w-5 h-5 text-gray-600" />
      </Button>
      <Button variant="ghost" size="sm" className="p-2">
        <Search className="w-5 h-5 text-gray-600" />
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка заказов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Заказы" actions={headerActions} />

      {/* Filter Tabs */}
      <div className="p-4 border-b border-gray-100">
        <FilterTabs 
          tabs={tabsWithCounts} 
          activeTab={activeFilter} 
          onTabChange={(tab) => setActiveFilter(tab as FilterType)} 
        />
      </div>

      {/* Orders List */}
      <div className="pb-20">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderItem 
              key={order.id} 
              order={order} 
              onClick={handleViewOrder}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <EmptyState
            icon={<Search className="w-8 h-8 text-gray-400" />}
            title="Заказов не найдено"
            description="Попробуйте изменить фильтр или добавить новый заказ"
          />
        )}
      </div>
    </div>
  );
}