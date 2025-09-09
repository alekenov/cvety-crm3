import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { fetchOrders, changeOrderStatus, type FrontStatus, type Order } from '../api/orders';
import { getTimeAgo } from '../utils/date';
import { usePerformanceTracking } from '../utils/performance';
import { useInView } from 'react-intersection-observer';
import { urlManager, parseDateFromURL, formatDateForURL } from '../src/utils/url';

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
  onStatusChange,
  searchQuery
}: { 
  order: Order; 
  onClick?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: FrontStatus) => void;
  searchQuery?: string;
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

  // Highlight matches for search
  const highlightMatch = (text: string, query?: string) => {
    if (!query || !text) return text;
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safe})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => (
      regex.test(part) ? <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
    ));
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
            <span className="text-gray-900">{highlightMatch(order.number, searchQuery)}</span>
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
          {/* Matched fields preview */}
          {searchQuery && (
            <div className="text-sm text-gray-600 mt-1 space-y-0.5">
              {order.sender?.name && order.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
                <div>Отправитель: {highlightMatch(order.sender.name, searchQuery)}</div>
              )}
              {order.recipient?.name && order.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
                <div>Получатель: {highlightMatch(order.recipient.name, searchQuery)}</div>
              )}
              {order.sender?.phone && searchQuery.replace(/\D/g, '') && order.sender.phone.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, '')) && (
                <div>Тел. отправителя: {highlightMatch(order.sender.phone, searchQuery)}</div>
              )}
              {order.recipient?.phone && searchQuery.replace(/\D/g, '') && order.recipient.phone.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, '')) && (
                <div>Тел. получателя: {highlightMatch(order.recipient.phone, searchQuery)}</div>
              )}
            </div>
          )}
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
              className="w-12 h-12 rounded-full border-2 border-white overflow-hidden"
              style={{ 
                marginLeft: index > 0 ? '-8px' : '0',
                zIndex: visibleImages.length - index
              }}
            >
              <img
                src={product.image}
                alt="Товар"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
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
  // Performance tracking
  usePerformanceTracking('OrdersList');
  
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Initialize from URL
  const urlParams = urlManager.getParams();
  const [activeFilter, setActiveFilter] = useState<FilterType>((urlParams.filter as FilterType) || 'all');
  const [isSearchOpen, setIsSearchOpen] = useState(!!urlParams.search);
  const [searchQuery, setSearchQuery] = useState(urlParams.search || '');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(parseDateFromURL(urlParams.date));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 30;

  // Date helpers
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const toDateKey = (d: Date) => d.toDateString();

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px', // Start loading 200px before reaching the element
  });

  // Load orders (initial or reset)
  const loadOrders = async (reset: boolean = true) => {
    try {
      if (reset) {
        setIsLoading(true);
        setCurrentOffset(0);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const offset = reset ? 0 : currentOffset;
      const params = activeFilter === 'all' ? {} : { status: activeFilter };
      const result = await fetchOrders({ 
        ...params, 
        limit: PAGE_SIZE, 
        offset: offset 
      });

      if (result.success && result.data) {
        if (reset) {
          setOrders(result.data);
        } else {
          // Append new orders, avoid duplicates
          setOrders(prev => {
            const existingIds = new Set(prev.map(order => order.id));
            const newOrders = result.data.filter(order => !existingIds.has(order.id));
            return [...prev, ...newOrders];
          });
        }
        
        // Update pagination state
        setHasMore(result.data.length === PAGE_SIZE);
        if (!reset) {
          setCurrentOffset(offset + PAGE_SIZE);
        }
      } else {
        setError('Не удалось загрузить заказы');
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      setError('Ошибка при загрузке заказов');
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load more orders for infinite scroll
  const loadMoreOrders = async () => {
    if (isLoadingMore || !hasMore) return;
    await loadOrders(false);
  };

  // Initial load and filter changes
  useEffect(() => {
    loadOrders(true);
  }, [activeFilter]);

  // Sync state to URL
  useEffect(() => {
    // filter
    urlManager.setOrdersFilter(activeFilter, undefined);
  }, [activeFilter]);

  useEffect(() => {
    // search
    urlManager.setOrdersSearch(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    // date
    urlManager.setOrdersDate(selectedDate ? formatDateForURL(selectedDate) : '');
  }, [selectedDate]);

  // Listen to back/forward to rehydrate state
  useEffect(() => {
    const onPop = () => {
      const p = urlManager.getParams();
      setActiveFilter((p.filter as FilterType) || 'all');
      setSearchQuery(p.search || '');
      setIsSearchOpen(!!p.search);
      setSelectedDate(parseDateFromURL(p.date));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Infinite scroll effect
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      console.log('🔄 Infinite scroll triggered for orders');
      loadMoreOrders();
    }
  }, [inView, hasMore, isLoadingMore]);

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

  // Search function
  const searchOrders = (list: Order[], query: string) => {
    if (!query.trim()) return list;
    const q = query.toLowerCase().trim();
    return list.filter(order => {
      if (order.number?.toLowerCase().includes(q)) return true;
      if (order.sender?.name && order.sender.name.toLowerCase().includes(q)) return true;
      if (order.recipient?.name && order.recipient.name.toLowerCase().includes(q)) return true;
      const cleanQ = q.replace(/\D/g, '');
      if (cleanQ) {
        const s = order.sender?.phone?.replace(/\D/g, '') || '';
        const r = order.recipient?.phone?.replace(/\D/g, '') || '';
        if (s.includes(cleanQ) || r.includes(cleanQ)) return true;
      }
      return false;
    });
  };

  // Date filter
  const filterByDate = (list: Order[], date?: Date) => {
    if (!date) return list;
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const sameDay = (dt: Date) => dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    const toDate = (o: Order): Date | null => {
      if (o.deliveryDate === 'today') return new Date();
      if (o.deliveryDate === 'tomorrow') { const t = new Date(); t.setDate(t.getDate() + 1); return t; }
      const parsed = new Date(o.deliveryDate);
      return isNaN(parsed.getTime()) ? null : parsed;
    };
    return list.filter(o => {
      const dt = toDate(o);
      return dt ? sameDay(dt) : false;
    });
  };

  // Derived list with filters
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [] as Order[];
    let list = activeFilter === 'all'
      ? orders.filter(order => order.status !== 'completed')
      : orders.filter(order => order.status === activeFilter && order.status !== 'completed');
    list = filterByDate(list, selectedDate);
    list = searchOrders(list, searchQuery);
    return list;
  }, [orders, activeFilter, selectedDate, searchQuery]);

  // Count orders by status for tabs (excluding completed) - memoized
  const statusCounts = useMemo(() => ({
    all: orders.filter(o => o.status !== 'completed').length,
    new: orders.filter(o => o.status === 'new').length,
    paid: orders.filter(o => o.status === 'paid').length,
    accepted: orders.filter(o => o.status === 'accepted').length,
    assembled: orders.filter(o => o.status === 'assembled').length,
  }), [orders]);

  const tabsWithCounts = FILTER_OPTIONS.map(tab => ({
    ...tab,
    count: statusCounts[tab.key as keyof typeof statusCounts]
  }));

  // Build calendar markers by delivery date
  const orderCountsByDate = useMemo(() => {
    const map = new Map<string, number>();
    const normalize = (o: Order): Date | null => {
      if (o.deliveryDate === 'today') return new Date();
      if (o.deliveryDate === 'tomorrow') { const t = new Date(); t.setDate(t.getDate() + 1); return t; }
      const d = new Date(o.deliveryDate);
      return isNaN(d.getTime()) ? null : d;
    };
    orders.forEach(o => {
      const d = normalize(o);
      if (d) {
        const key = toDateKey(d);
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return map;
  }, [orders]);

  const headerActions = (
    <>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <CalendarIcon className="w-5 h-5 text-gray-600" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => { setSelectedDate(d || undefined); setIsCalendarOpen(false); }}
            modifiers={{
              hasOrders: (date) => orderCountsByDate.has(toDateKey(date))
            }}
            modifiersClassNames={{ hasOrders: 'bg-blue-100 text-blue-900 font-medium relative' }}
            components={{
              DayContent: ({ date }) => {
                const count = orderCountsByDate.get(toDateKey(date));
                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span>{date.getDate()}</span>
                    {count && count > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                        {count > 9 ? '9+' : count}
                      </div>
                    )}
                  </div>
                );
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Button variant="ghost" size="sm" className="p-2" onClick={() => setIsSearchOpen(v => !v)}>
        <Search className="w-5 h-5 text-gray-600" />
      </Button>
      <Button variant="ghost" size="sm" className="p-2" onClick={handleAddOrder}>
        <Plus className="w-5 h-5 text-gray-600" />
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

      {/* Date Filter Bar */}
      {selectedDate && (
        <div className="p-4 border-b border-gray-100 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900">Заказы на {formatDateForDisplay(selectedDate)}</span>
              <div className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-sm">{filteredOrders.length}</div>
            </div>
            <button onClick={() => setSelectedDate(undefined)} className="text-blue-600 hover:text-blue-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Input
              type="text"
              placeholder="Поиск по номеру заказа, имени или телефону..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">Найдено: {filteredOrders.length} заказов</div>
          )}
        </div>
      )}

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
          <>
            {filteredOrders.map((order) => (
              <OrderItem 
                key={order.id} 
                order={order} 
                onClick={handleViewOrder}
                onStatusChange={handleStatusChange}
                searchQuery={searchQuery}
              />
            ))}
            
            {/* Infinite scroll trigger */}
            {hasMore && (
              <div 
                ref={loadMoreRef}
                className="h-16 flex items-center justify-center border-t border-gray-100"
              >
                {isLoadingMore && (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    Загрузка заказов...
                  </div>
                )}
              </div>
            )}

            {/* Manual load more button (fallback) */}
            {!hasMore && filteredOrders.length >= PAGE_SIZE && (
              <div className="p-4 text-center border-t border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Показано {filteredOrders.length} заказов
                </p>
              </div>
            )}
          </>
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
