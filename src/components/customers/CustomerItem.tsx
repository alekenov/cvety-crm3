// Customer Item Component
// Extracted from Customers.tsx for better organization

import { Phone, Calendar, TrendingUp } from "lucide-react";
import { Customer } from "../../services/customerApi";

// Utility functions
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

// StatusBadge Component
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

interface CustomerItemProps extends Customer {
  onClick: (id: number) => void;
  ordersLoadFailed?: boolean;
  searchQuery?: string;
}

export function CustomerItem({ 
  id, 
  name, 
  phone, 
  memberSince, 
  totalOrders, 
  totalSpent, 
  status, 
  lastOrderDate, 
  onClick, 
  ordersLoadFailed,
  searchQuery
}: CustomerItemProps) {
  
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

  const highlight = (text: string) => {
    if (!searchQuery || !text) return text;
    const safe = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${safe})`, 'gi');
    return text.split(re).map((part, i) => (
      re.test(part) ? <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
    ));
  };

  return (
    <div 
      className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onClick(id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-900 truncate">{highlight(name)}</span>
            <StatusBadge 
              status={statusLabelMap[status]} 
              variant={statusVariantMap[status]} 
            />
            {ordersLoadFailed && (
              <div className="px-1 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                ⚠️ Не удалось загрузить заказы
              </div>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Phone className="w-3 h-3 mr-1" />
            <span>{highlight(phone)}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 gap-3">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Клиент с {formatDate(memberSince)}
            </div>
            {lastOrderDate && (
              <div>
                Последний заказ: {formatDate(lastOrderDate)}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-900 mb-1">
            {formatCurrency(totalSpent)}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <TrendingUp className="w-3 h-3 mr-1" />
            {totalOrders} заказ{totalOrders !== 1 ? (totalOrders < 5 ? 'а' : 'ов') : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
