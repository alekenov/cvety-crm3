import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar, Phone, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CustomerAPI, Customer } from "../services/customerApi";
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



function CustomerItem({ id, name, phone, memberSince, totalOrders, totalSpent, status, lastOrderDate, onClick }: CustomerItemProps) {
  
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
          <div className="text-sm text-gray-900 mb-1">
            {totalOrders} {totalOrders === 1 ? 'заказ' : totalOrders < 5 ? 'заказа' : 'заказов'}
          </div>
          <div className="text-sm text-gray-600">
            {formatCurrency(totalSpent)}
          </div>
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
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerWithAvatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'vip' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load customers from API on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiCustomers = await CustomerAPI.fetchCustomers(20, 0, true); // Fetch 20 customers with order data for testing
      setCustomers(apiCustomers as CustomerWithAvatar[]);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError('Не удалось загрузить список клиентов');
      // Fall back to prop customers if available
      if (propCustomers && propCustomers.length > 0) {
        setCustomers(propCustomers as CustomerWithAvatar[]);
      }
    } finally {
      setIsLoading(false);
    }
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
          filteredCustomers.map((customer) => (
            <CustomerItem
              key={customer.id}
              {...customer}
              onClick={handleCustomerClick}
            />
          ))
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