import { useState } from "react";
import { ArrowLeft, Phone, Calendar, TrendingUp, Plus, Edit3, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ApiOrder } from "../services/customerApi";

interface Customer {
  id: number;
  name: string;
  phone: string;
  memberSince: Date;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  status: 'active' | 'vip' | 'inactive';
  notes?: string;
}

interface Order {
  id: string;
  number: string;
  date: Date;
  total: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface CustomerDetailProps {
  customerId: number;
  customers: Customer[];
  orders?: ApiOrder[]; // Real orders from API
  onClose: () => void;
  onUpdateCustomer: (customer: Customer) => void;
  onViewOrder?: (orderId: string) => void;
}

// Мок-данные заказов для примера
const mockOrders: Order[] = [
  {
    id: '1',
    number: '40412',
    date: new Date(2024, 7, 25),
    total: 15000,
    status: 'delivered',
    items: [
      { name: 'Букет роз', quantity: 1, price: 15000 }
    ]
  },
  {
    id: '2', 
    number: '40401',
    date: new Date(2024, 7, 18),
    total: 8500,
    status: 'delivered',
    items: [
      { name: 'Букет тюльпанов', quantity: 1, price: 8500 }
    ]
  },
  {
    id: '3',
    number: '40395',
    date: new Date(2024, 6, 10),
    total: 22000,
    status: 'delivered',
    items: [
      { name: 'Свадебный букет', quantity: 1, price: 22000 }
    ]
  },
  {
    id: '4',
    number: '40387',
    date: new Date(2024, 5, 20),
    total: 12000,
    status: 'cancelled',
    items: [
      { name: 'Композиция', quantity: 1, price: 12000 }
    ]
  }
];

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

function formatOrderDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function CustomerDetail({ customerId, customers, orders, onClose, onUpdateCustomer, onViewOrder }: CustomerDetailProps) {
  const customer = customers.find(c => {
    // Convert both to numbers for comparison to handle string/number mismatch
    const customerIdNum = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
    const searchIdNum = typeof customerId === 'string' ? parseInt(customerId, 10) : customerId;
    return customerIdNum === searchIdNum;
  });
  
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(customer?.notes || '');

  if (!customer) {
    return (
      <div className="bg-white min-h-screen max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-2">Клиент не найден</h2>
          <Button onClick={onClose} variant="outline">
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    active: { label: 'Активный', color: 'border-green-500 text-green-500' },
    vip: { label: 'VIP', color: 'border-gray-600 text-gray-600' },
    inactive: { label: 'Неактивный', color: 'border-gray-400 text-gray-400' }
  };

  const orderStatusConfig = {
    pending: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Подтвержден', color: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'В работе', color: 'bg-gray-100 text-gray-700' },
    ready: { label: 'Готов', color: 'bg-green-100 text-green-700' },
    delivered: { label: 'Доставлен', color: 'bg-gray-100 text-gray-700' },
    cancelled: { label: 'Отменен', color: 'bg-red-100 text-red-700' }
  };

  // Transform real API orders to display format
  const customerOrders = (orders || []).map(apiOrder => {
    // Parse date safely - API might return invalid date format
    let orderDate: Date;
    try {
      orderDate = new Date(apiOrder.DATE_INSERT.value);
      // If date is invalid, use current date as fallback
      if (isNaN(orderDate.getTime())) {
        orderDate = new Date();
      }
    } catch {
      orderDate = new Date();
    }

    return {
      id: apiOrder.ID.toString(),
      number: apiOrder.ID.toString(), // Use order ID as number for now  
      date: orderDate,
      total: Number(apiOrder.PRICE),
      status: 'delivered' as const, // Default status, can be enhanced later
      items: [
        { name: `Заказ #${apiOrder.ID}`, quantity: 1, price: Number(apiOrder.PRICE) }
      ]
    };
  });

  const handleSaveNotes = () => {
    const updatedCustomer = { ...customer, notes };
    onUpdateCustomer(updatedCustomer);
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setNotes(customer.notes || '');
    setIsEditingNotes(false);
  };

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 mr-3"
          onClick={onClose}
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1 className="text-gray-900">Клиент</h1>
      </div>

      <div className="pb-6">
        {/* Customer Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">{customer.name}</h2>
            <div className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
              {statusConfig[customer.status].label}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-3" />
              <span>{customer.phone}</span>
            </div>
            

            
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-3" />
              <span>Клиент с {formatDate(customer.memberSince)}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-gray-900">{customer.totalOrders}</div>
              <div className="text-sm text-gray-500">
                {customer.totalOrders === 1 ? 'заказ' : customer.totalOrders < 5 ? 'заказа' : 'заказов'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-900">{formatCurrency(customer.totalSpent)}</div>
              <div className="text-sm text-gray-500">потрачено</div>
            </div>
            <div className="text-center">
              <div className="text-gray-900">
                {Math.round(customer.totalSpent / customer.totalOrders)}₸
              </div>
              <div className="text-sm text-gray-500">средний чек</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900">Заметки</h3>
            {!isEditingNotes && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1"
                onClick={() => setIsEditingNotes(true)}
              >
                <Edit3 className="w-4 h-4 text-gray-500" />
              </Button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Добавьте заметку о клиенте..."
                className="min-h-[80px] resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveNotes}
                  className="bg-gray-800 hover:bg-gray-900"
                >
                  Сохранить
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancelNotes}
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">
              {customer.notes || (
                <span className="text-gray-400 italic">Нажмите для добавления заметки...</span>
              )}
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-gray-900">История заказов</h3>
          </div>

          {customerOrders.length > 0 ? (
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <div 
                  key={order.id}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onViewOrder?.(order.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">#{order.number}</span>
                      <div className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                        {orderStatusConfig[order.status].label}
                      </div>
                    </div>
                    <span className="text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1">
                    {formatOrderDate(order.date)}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {order.items.map(item => item.name).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="text-gray-900 mb-1">Нет заказов</h4>
              <p className="text-sm text-gray-500">Заказы этого клиента появятся здесь</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}