import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar, Phone, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CustomerAPI, Customer } from "../services/customerApi";
import { usePerformanceTracking } from "../utils/performance";
import { useInView } from 'react-intersection-observer';
// Temporary inline components to avoid import issues
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
              ? 'bg-gray-800 text-white'
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

// Customer interface is now imported from customerApi.ts
// Adding avatar field to match the API Customer type
interface CustomerWithAvatar extends Customer {
  avatar?: string;
}

interface CustomerItemProps extends CustomerWithAvatar {
  onClick: (id: number) => void;
  ordersLoadFailed?: boolean;
}

// Mock data removed - now using real API data
/* const mockCustomers: CustomerWithAvatar[] = [
  {
    id: 1,
    name: "Анна Петрова",
    phone: "+7 (777) 123-45-67",
    email: "anna.petrova@gmail.com",
    memberSince: new Date(2023, 2, 15),
    totalOrders: 12,
    totalSpent: 156000,
    lastOrderDate: new Date(2024, 7, 20),
    status: 'vip'
  },
  {
    id: 2,
    name: "Мария Козлова",
    phone: "+7 (777) 234-56-78",
    memberSince: new Date(2023, 5, 8),
    totalOrders: 7,
    totalSpent: 84500,
    lastOrderDate: new Date(2024, 7, 18),
    status: 'active'
  },
  {
    id: 3,
    name: "Елена Сидорова",
    phone: "+7 (777) 345-67-89",
    email: "elena.s@mail.ru",
    memberSince: new Date(2022, 11, 3),
    totalOrders: 25,
    totalSpent: 320000,
    lastOrderDate: new Date(2024, 7, 25),
    status: 'vip'
  },
  {
    id: 4,
    name: "Ольга Иванова",
    phone: "+7 (777) 456-78-90",
    memberSince: new Date(2024, 1, 20),
    totalOrders: 3,
    totalSpent: 42000,
    lastOrderDate: new Date(2024, 6, 15),
    status: 'active'
  },
  {
    id: 5,
    name: "Наталья Богданова",
    phone: "+7 (777) 567-89-01",
    memberSince: new Date(2023, 8, 12),
    totalOrders: 15,
    totalSpent: 198000,
    lastOrderDate: new Date(2024, 5, 10),
    status: 'vip'
  },
  {
    id: 6,
    name: "Светлана Морозова",
    phone: "+7 (777) 678-90-12",
    memberSince: new Date(2024, 0, 5),
    totalOrders: 2,
    totalSpent: 25000,
    lastOrderDate: new Date(2024, 3, 8),
    status: 'inactive'
  },
  {
    id: 7,
    name: "Александра Попова",
    phone: "+7 (777) 789-01-23",
    email: "alex.popova@yandex.kz",
    memberSince: new Date(2023, 6, 25),
    totalOrders: 9,
    totalSpent: 112000,
    lastOrderDate: new Date(2024, 7, 12),
    status: 'active'
  },
  {
    id: 8,
    name: "Ирина Новикова",
    phone: "+7 (777) 890-12-34",
    memberSince: new Date(2023, 10, 18),
    totalOrders: 6,
    totalSpent: 78000,
    lastOrderDate: new Date(2024, 4, 22),
    status: 'active'
  }
]; */

function formatDate(date: Date): string {
  const now = new Date();
  const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
  
  if (diffInMonths === 0) {
    return 'Этот месяц';
  } else if (diffInMonths === 1) {
    return '1 месяц назад';
  } else if (diffInMonths < 12) {
    return `${diffInMonths} мес. назад`;
  } else {
    const years = Math.floor(diffInMonths / 12);
    return `${years} ${years === 1 ? 'год' : 'года'} назад`;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0
  }).format(amount).replace('KZT', '₸');
}



function CustomerItem({ id, name, phone, memberSince, totalOrders, totalSpent, status, lastOrderDate, onClick, ordersLoadFailed }: CustomerItemProps) {
  
  const statusVariantMap = {
    active: 'success' as const,
    vip: 'warning' as const,
    inactive: 'default' as const
  };

  const statusLabelMap = {
    active: 'Активный',
    vip: 'VIP',
    inactive: 'Неактивный'
  };

  return (
    <div 
      className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onClick(id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-900 truncate">{name}</span>
            <StatusBadge 
              status={statusLabelMap[status]} 
              variant={statusVariantMap[status]} 
            />
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Phone className="w-3 h-3 mr-1" />
            {phone}
          </div>
          
          <div className="text-sm text-gray-500">
            Клиент с {formatDate(memberSince)}
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          {ordersLoadFailed ? (
            <>
              <div className="text-sm text-gray-400 mb-1" title="Не удалось загрузить данные о заказах">
                — заказов
              </div>
              <div className="text-sm text-gray-400">
                —
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-900 mb-1">
                {totalOrders} {totalOrders === 1 ? 'заказ' : totalOrders < 5 ? 'заказа' : 'заказов'}
              </div>
              <div className="text-sm text-gray-600">
                {formatCurrency(totalSpent)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface CustomersProps {
  onNavigateBack: () => void;
  onViewCustomer: (customerId: number) => void;
  onAddCustomer?: () => void;
  customers: CustomerWithAvatar[];
}

export function Customers({ onNavigateBack, onViewCustomer, onAddCustomer, customers: propCustomers }: CustomersProps) {
  // Performance tracking
  usePerformanceTracking('Customers');
  
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerWithAvatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'vip' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const PAGE_SIZE = 20;

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px', // Start loading 100px before reaching the element
  });

  // Load customers from API on component mount
  useEffect(() => {
    loadCustomers(0, false); // Load first page
  }, []);

  // Infinite scroll effect
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && !showAll && !searchQuery) {
      console.log('🔄 Infinite scroll triggered');
      loadMoreCustomers();
    }
  }, [inView, hasMore, isLoadingMore, showAll, searchQuery]);

  const loadCustomers = async (page: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      const limit = showAll ? 300 : PAGE_SIZE; 
      const actualPage = page + 1; // API pages are 1-based

      console.log(`🔄 Loading customers: page=${actualPage}, limit=${limit}, append=${append}`);

      // 1) Try fast aggregated endpoint to avoid N+1
      try {
        const { customers: statsCustomers, pagination } = await CustomerAPI.getCustomersWithStats(actualPage, limit);

        if (statsCustomers && statsCustomers.length > 0) {
          console.log(`✅ Loaded ${statsCustomers.length} customers (aggregated)`);

          if (append) {
            setCustomers(prev => {
              const existingIds = new Set(prev.map(c => c.id));
              const newCustomers = statsCustomers.filter(c => !existingIds.has(c.id));
              return [...prev, ...newCustomers];
            });
          } else {
            setCustomers(statsCustomers as CustomerWithAvatar[]);
          }

          setHasMore(actualPage < (pagination.pages || 0) && !showAll);
          if (append) setCurrentPage(page); else setCurrentPage(0);
          return; // done
        } else {
          console.warn('⚠️ Aggregated endpoint returned empty result, falling back');
        }
      } catch (aggErr) {
        console.warn('⚠️ Aggregated customers endpoint failed, falling back:', aggErr);
      }

      // 2) Fallback: list with order statistics (may be slower but shows real data)
      const customerList = await CustomerAPI.fetchCustomers(limit, page * PAGE_SIZE, true);
      console.log(`✅ Loaded ${customerList.length} customers (fallback, with order statistics)`);

      if (append) {
        setCustomers(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newCustomers = customerList.filter(c => !existingIds.has(c.id));
          return [...prev, ...newCustomers];
        });
      } else {
        setCustomers(customerList as CustomerWithAvatar[]);
      }

      setHasMore(customerList.length === PAGE_SIZE && !showAll);
      if (append) setCurrentPage(page); else setCurrentPage(0);

    } catch (err) {
      console.error('Failed to load customers:', err);
      setError('Не удалось загрузить список клиентов');
      // Fall back to prop customers if available
      if (propCustomers && propCustomers.length > 0 && !append) {
        setCustomers(propCustomers as CustomerWithAvatar[]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  
  const loadMoreCustomers = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    await loadCustomers(nextPage, true);
  };
  
  const loadAllCustomers = async () => {
    setShowAll(true);
    setCurrentPage(0);
    await loadCustomers(0, false); // Reload from start with higher limit
  };
  
  const resetToPagedView = async () => {
    setShowAll(false);
    setCurrentPage(0);
    await loadCustomers(0, false); // Reload first page only
  };

  // Фильтрация клиентов
  const filteredCustomers = customers.filter(customer => {
    const matchesFilter = filter === 'all' || customer.status === filter;
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // Подсчет статистики
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    vip: customers.filter(c => c.status === 'vip').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0)
  };

  const handleCustomerClick = (customerId: number) => {
    // Use React Router navigation for customer detail view
    navigate(`/customers/${customerId}`);
  };

  const headerActions = (
    <>
      <Button variant="ghost" size="sm" className="p-2" onClick={onAddCustomer}>
        <Plus className="w-5 h-5 text-gray-600" />
      </Button>
      <Button variant="ghost" size="sm" className="p-2">
        <Search className="w-5 h-5 text-gray-600" />
      </Button>
    </>
  );

  const filterOptions = [
    { key: 'all', label: 'Все', count: stats.total },
    { key: 'vip', label: 'VIP', count: stats.vip },
    { key: 'active', label: 'Активные', count: stats.active },
    { key: 'inactive', label: 'Неактивные', count: stats.inactive }
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка клиентов...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && customers.length === 0) {
    return (
      <div className="bg-white min-h-screen max-w-md mx-auto flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadCustomers} variant="outline">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto">
      <PageHeader title="Клиенты" actions={headerActions} />

      {/* Stats */}


      {/* Filter Tags */}
      <div className="p-4 border-b border-gray-100">
        <FilterTabs 
          tabs={filterOptions} 
          activeTab={filter} 
          onTabChange={(tab) => setFilter(tab as any)} 
        />
      </div>

      {/* Customers List */}
      <div className="pb-20">
        {filteredCustomers.length > 0 ? (
          <>
            {filteredCustomers.map((customer) => (
              <CustomerItem
                key={customer.id}
                {...customer}
                onClick={handleCustomerClick}
              />
            ))}
            
            {/* Infinite Scroll Trigger & Manual Controls */}
            {!searchQuery && (
              <div>
                {/* Infinite scroll trigger - invisible element */}
                {!showAll && hasMore && (
                  <div 
                    ref={loadMoreRef}
                    className="h-10 flex items-center justify-center"
                  >
                    {isLoadingMore && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Загрузка клиентов...
                      </div>
                    )}
                  </div>
                )}

                {/* Manual controls section */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <div className="text-center space-y-3">
                    {/* Show current stats */}
                    <p className="text-sm text-gray-600">
                      Показано {filteredCustomers.length} из {showAll ? 'всех' : 'загруженных'} клиентов
                    </p>
                    
                    {/* Manual action buttons */}
                    <div className="flex flex-col gap-2">
                      {!showAll && hasMore && (
                        <Button 
                          onClick={loadMoreCustomers}
                          disabled={isLoadingMore}
                          variant="outline"
                          className="w-full"
                        >
                          {isLoadingMore ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                              Загрузка...
                            </>
                          ) : (
                            `Загрузить еще ${PAGE_SIZE} клиентов`
                          )}
                        </Button>
                      )}
                      
                      {!showAll && (
                        <Button 
                          onClick={loadAllCustomers}
                          variant="ghost"
                          className="w-full text-blue-600 hover:text-blue-700"
                          disabled={isLoadingMore}
                        >
                          Показать всех клиентов (может быть медленно)
                        </Button>
                      )}
                      
                      {showAll && (
                        <Button 
                          onClick={resetToPagedView}
                          variant="ghost"
                          className="w-full text-gray-600 hover:text-gray-700"
                        >
                          Вернуться к автозагрузке
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<TrendingUp className="w-8 h-8 text-gray-400" />}
            title={searchQuery ? 'Клиенты не найдены' : 'Нет клиентов'}
            description={
              searchQuery 
                ? 'Попробуйте изменить поисковый запрос'
                : 'Клиенты появятся после первых заказов'
            }
          />
        )}
      </div>
    </div>
  );
}
