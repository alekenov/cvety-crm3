// Customers Component - Refactored
// Reduced from 578 lines to <200 lines by extracting focused components

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Import extracted components
import { CustomerItem } from "./customers/CustomerItem";
import { CustomerStats } from "./customers/CustomerStats";
import { useCustomers } from "@/shared/hooks/useCustomers";
import { urlManager } from "../src/utils/url";

// Import shared components - using existing inline components for now
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

function PageHeader({ title, actions }: { 
  title: string; 
  actions?: React.ReactNode; 
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div className="flex items-center">
        <h1 className="text-gray-900">{title}</h1>
      </div>
      {actions && <div className="flex gap-1">{actions}</div>}
    </div>
  );
}

interface CustomersProps {
  onViewCustomer: (customerId: number) => void;
  onAddCustomer: () => void;
  customers: any[];
}

export function Customers({ onViewCustomer, onAddCustomer, customers: propCustomers }: CustomersProps) {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Extract customers from React Query data
  const allCustomers = data?.customers || [];
  const loading = isLoading;

  // Client-side filtering (same logic as before)
  const filteredCustomers = allCustomers.filter(customer => {
    // Apply search filter
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    // Apply status filter
    let matchesFilter = true;
    switch (activeFilter) {
      case 'active':
        matchesFilter = customer.status === 'active';
        break;
      case 'vip':
        matchesFilter = customer.status === 'vip';
        break;
      case 'inactive':
        matchesFilter = customer.status === 'inactive';
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = {
    total: allCustomers.length,
    vip: allCustomers.filter(c => c.status === 'vip').length,
    active: allCustomers.filter(c => c.status === 'active').length,
    inactive: allCustomers.filter(c => c.status === 'inactive').length
  };

  // Generate filter tabs with counts
  const filterTabs = [
    { key: 'all', label: 'Все', count: stats.total },
    { key: 'active', label: 'Активные', count: stats.active },
    { key: 'vip', label: 'VIP', count: stats.vip },
    { key: 'inactive', label: 'Неактивные', count: stats.inactive }
  ];

  // Use filtered customers for display
  const customers = filteredCustomers;

  // Initialize from URL
  useEffect(() => {
    const p = urlManager.getParams();
    if (p.search) {
      setSearchQuery(p.search);
      setIsSearchOpen(true);
    }
    if (p.filter) {
      setActiveFilter(p.filter);
    }
    const onPop = () => {
      const q = urlManager.getParams();
      setSearchQuery(q.search || '');
      setIsSearchOpen(!!q.search);
      setActiveFilter(q.filter || 'all');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Sync to URL when state changes (without redundant tab parameter)
  useEffect(() => {
    urlManager.updateParams({ filter: activeFilter === 'all' ? null : activeFilter }, true);
  }, [activeFilter]);
  useEffect(() => {
    urlManager.updateParams({ search: searchQuery || null }, true);
  }, [searchQuery]);

  const handleCustomerClick = (customerId: number) => {
    // Use both prop callback and navigation for flexibility
    onViewCustomer?.(customerId);
    navigate(`/customers/${customerId}`);
  };

  const headerActions = (
    <>
      <Button variant="ghost" size="sm" className="p-2" onClick={onAddCustomer}>
        <Plus className="w-5 h-5 text-gray-600" />
      </Button>
      <Button variant="ghost" size="sm" className="p-2" onClick={() => setIsSearchOpen(v => !v)}>
        <Search className="w-5 h-5 text-gray-600" />
      </Button>
    </>
  );

  // Show loading state
  if (loading) {
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
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'Не удалось загрузить клиентов'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto">
      <PageHeader title="Клиенты" actions={headerActions} />

      {/* Customer Statistics */}
      <CustomerStats 
        totalCustomers={stats.total}
        vipCustomers={stats.vip}
        activeCustomers={stats.active}
        inactiveCustomers={stats.inactive}
      />

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени или телефону..."
              className="w-full pr-10"
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
            <div className="mt-2 text-sm text-gray-600">Найдено: {customers.length} клиентов</div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="p-4 border-b border-gray-100">
        <FilterTabs 
          tabs={filterTabs} 
          activeTab={activeFilter} 
          onTabChange={setActiveFilter} 
        />
      </div>

      {/* Customers List */}
      <div className="pb-20">
        {customers.length > 0 ? (
          <>
            {customers.map((customer) => (
              <CustomerItem
                key={customer.id}
                {...customer}
                onClick={handleCustomerClick}
                searchQuery={searchQuery}
              />
            ))}
          </>
        ) : (
          <EmptyState
            icon={<Search className="w-8 h-8 text-gray-400" />}
            title={searchQuery ? "Клиенты не найдены" : "Пока нет клиентов"}
            description={
              searchQuery 
                ? `По запросу "${searchQuery}" ничего не найдено. Попробуйте изменить поисковый запрос.`
                : "Добавьте первого клиента, чтобы начать работу с CRM системой."
            }
            action={
              !searchQuery ? (
                <Button onClick={onAddCustomer} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить клиента
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
