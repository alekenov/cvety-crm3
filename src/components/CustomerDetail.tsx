import { useState } from "react";
import { ArrowLeft, Phone, Calendar, TrendingUp, Plus, Edit3, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface Customer {
  id: number;
  name?: string;
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
  onClose: () => void;
  onUpdateCustomer: (customer: Customer) => void;
  onViewOrder?: (orderId: string) => void;
}

// Мок-данные заказов для примера
const mockOrders: Order[] = [
  // Заказы для первого клиента (Анны Кожемякиной)
  {
    id: '1',
    number: '40421',
    date: new Date(2024, 8, 2),
    total: 25000,
    status: 'delivered',
    items: [
      { name: 'Букет роз "Страсть"', quantity: 1, price: 18000 },
      { name: 'Упаковка премиум', quantity: 1, price: 3000 },
      { name: 'Открытка', quantity: 1, price: 500 }
    ]
  },
  {
    id: '2',
    number: '40412',
    date: new Date(2024, 7, 25),
    total: 15000,
    status: 'delivered',
    items: [
      { name: 'Букет роз красных', quantity: 25, price: 600 }
    ]
  },
  {
    id: '3',
    number: '40401',
    date: new Date(2024, 7, 18),
    total: 8500,
    status: 'delivered',
    items: [
      { name: 'Букет тюльпанов', quantity: 1, price: 8500 }
    ]
  },
  {
    id: '4',
    number: '40395',
    date: new Date(2024, 6, 10),
    total: 32000,
    status: 'delivered',
    items: [
      { name: 'Свадебный букет невесты', quantity: 1, price: 22000 },
      { name: 'Бутоньерка жениха', quantity: 1, price: 3500 },
      { name: 'Декор стола', quantity: 3, price: 2167 }
    ]
  },
  {
    id: '5',
    number: '40387',
    date: new Date(2024, 5, 20),
    total: 12000,
    status: 'cancelled',
    items: [
      { name: 'Композиция на День рождения', quantity: 1, price: 12000 }
    ]
  },
  
  // Заказы для второго клиента
  {
    id: '6',
    number: '40418',
    date: new Date(2024, 8, 1),
    total: 9500,
    status: 'delivered',
    items: [
      { name: 'Букет хризантем', quantity: 1, price: 7500 },
      { name: 'Доставка', quantity: 1, price: 2000 }
    ]
  },
  {
    id: '7',
    number: '40407',
    date: new Date(2024, 7, 15),
    total: 6800,
    status: 'delivered',
    items: [
      { name: 'Букет гербер', quantity: 1, price: 6800 }
    ]
  },
  {
    id: '8',
    number: '40392',
    date: new Date(2024, 6, 8),
    total: 14500,
    status: 'delivered',
    items: [
      { name: 'Корзина цветов', quantity: 1, price: 14500 }
    ]
  },

  // Заказы для третьего клиента
  {
    id: '9',
    number: '40415',
    date: new Date(2024, 7, 28),
    total: 18900,
    status: 'delivered',
    items: [
      { name: 'Букет пионов', quantity: 1, price: 16000 },
      { name: 'Ваза', quantity: 1, price: 2900 }
    ]
  },
  {
    id: '10',
    number: '40403',
    date: new Date(2024, 6, 22),
    total: 11200,
    status: 'delivered',
    items: [
      { name: 'Букет лилий', quantity: 1, price: 11200 }
    ]
  },

  // Заказы для четвертого клиента
  {
    id: '11',
    number: '40420',
    date: new Date(2024, 8, 3),
    total: 7300,
    status: 'ready',
    items: [
      { name: 'Букет ромашек', quantity: 1, price: 5500 },
      { name: 'Упаковка', quantity: 1, price: 800 },
      { name: 'Лента', quantity: 1, price: 1000 }
    ]
  },
  {
    id: '12',
    number: '40408',
    date: new Date(2024, 7, 12),
    total: 13700,
    status: 'delivered',
    items: [
      { name: 'Букет орхидей', quantity: 1, price: 13700 }
    ]
  },

  // Заказы для пятого клиента
  {
    id: '13',
    number: '40419',
    date: new Date(2024, 8, 4),
    total: 22100,
    status: 'in_progress',
    items: [
      { name: 'Композиция "Элегант"', quantity: 1, price: 19500 },
      { name: 'Подставка', quantity: 1, price: 2600 }
    ]
  },
  {
    id: '14',
    number: '40410',
    date: new Date(2024, 7, 20),
    total: 8900,
    status: 'delivered',
    items: [
      { name: 'Букет альстромерий', quantity: 1, price: 8900 }
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

export function CustomerDetail({ customerId, customers, onClose, onUpdateCustomer, onViewOrder }: CustomerDetailProps) {
  const customer = customers.find(c => c.id === customerId);
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
    in_progress: { label: 'В работе', color: 'bg-orange-100 text-orange-700' },
    ready: { label: 'Готов', color: 'bg-green-100 text-green-700' },
    delivered: { label: 'Доставлен', color: 'bg-gray-100 text-gray-700' },
    cancelled: { label: 'Отменен', color: 'bg-red-100 text-red-700' }
  };

  // Фильтруем заказы этого клиента (в реальном приложении это будет API запрос)
  const getCustomerOrders = (customerId: number) => {
    const orderRanges = {
      1: [1, 5],  // Анна Кожемякина - 5 заказов
      2: [6, 8],  // Второй клиент - 3 заказа 
      3: [9, 10], // Третий клиент - 2 заказа
      4: [11, 12], // Четвертый клиент - 2 заказа
      5: [13, 14]  // Пятый клиент - 2 заказа
    };
    
    const range = orderRanges[customerId as keyof typeof orderRanges];
    if (!range) return [];
    
    return mockOrders.filter(order => {
      const orderId = parseInt(order.id);
      return orderId >= range[0] && orderId <= range[1];
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const customerOrders = getCustomerOrders(customerId);

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
            <h2 className={`${customer.name && customer.name.trim() ? 'text-gray-900' : 'text-gray-600'}`}>
              {customer.name && customer.name.trim() ? customer.name : `Клиент ${customer.phone}`}
            </h2>
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
              <div className="text-sm text-gray-500">потрачен��</div>
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
                      <div className={`px-2 py-0.5 rounded text-xs ${orderStatusConfig[order.status].color}`}>
                        {orderStatusConfig[order.status].label}
                      </div>
                    </div>
                    <span className="text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1">
                    {formatOrderDate(order.date)}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {order.items.length === 1 ? (
                      order.items[0].name
                    ) : (
                      `${order.items[0].name}${order.items.length > 1 ? ` +${order.items.length - 1}` : ''}`
                    )}
                  </div>
                  
                  {order.items.length > 1 && (
                    <div className="text-xs text-gray-400 mt-1">
                      {order.items.length} позиций в заказе
                    </div>
                  )}
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