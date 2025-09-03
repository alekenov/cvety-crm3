import { useState, useEffect } from "react";
import { ArrowLeft, Camera, Share, Check, X, ShoppingCart, CreditCard, User, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import svgPaths from "../imports/svg-n764ux8j24";
import { fetchOrderDetail, type Order, type FrontStatus } from "../api/orders";

interface OrderDetailProps {
  orderId: string;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateStatus?: (status: string) => void;
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'новый':
        return 'border-red-500 text-red-500';
      case 'оплачен':
        return 'border-blue-500 text-blue-500';
      case 'принят':
        return 'border-pink-500 text-pink-500';
      case 'собран':
        return 'border-yellow-500 text-yellow-500';
      case 'в пути':
        return 'border-green-500 text-green-500';
      default:
        return 'border-gray-500 text-gray-500';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded text-sm bg-gray-100 text-gray-600`}>
      {status}
    </div>
  );
}

function OrderItem({ image, title, subtitle }: { image: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div 
        className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0"
        style={{ backgroundImage: `url('${image}')` }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-gray-900">{title}</div>
        {subtitle && (
          <div className="text-sm text-gray-600">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({ 
  date, 
  description, 
  isLast = false 
}: { 
  date: string; 
  description: string; 
  isLast?: boolean;
}) {
  // Определяем тип события по описанию
  const getEventInfo = (desc: string) => {
    if (desc.includes('Создание заказа')) {
      return {
        icon: <ShoppingCart className="w-4 h-4" />,
        color: 'bg-blue-500',
        title: 'Создание заказа',
        detail: 'Заказ был создан в системе'
      };
    }
    if (desc.includes('Оплата заказа')) {
      return {
        icon: <CreditCard className="w-4 h-4" />,
        color: 'bg-green-500',
        title: 'Оплата заказа',
        detail: desc.includes('Kaspi') ? 'Платёжная система: Kaspi' : 'Заказ был оплачен'
      };
    }
    if (desc.includes('стал ответственным')) {
      const florист = desc.match(/Флорист ([^с]+)/)?.[1]?.trim();
      return {
        icon: <User className="w-4 h-4" />,
        color: 'bg-gray-500',
        title: 'Назначен флорист',
        detail: florист ? `Флорист: ${florист}` : desc
      };
    }
    if (desc.includes('собран') || desc.includes('готов')) {
      return {
        icon: <Package className="w-4 h-4" />,
        color: 'bg-orange-500',
        title: 'Заказ собран',
        detail: 'Товар готов к доставке'
      };
    }
    if (desc.includes('доставка') || desc.includes('курьер')) {
      return {
        icon: <Truck className="w-4 h-4" />,
        color: 'bg-indigo-500',
        title: 'Доставка',
        detail: 'Заказ передан курьеру'
      };
    }
    if (desc.includes('завершен') || desc.includes('доставлен')) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'bg-emerald-500',
        title: 'Заказ завершен',
        detail: 'Заказ успешно доставлен'
      };
    }
    
    return {
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-gray-500',
      title: 'Обновление статуса',
      detail: desc
    };
  };

  // Конвертируем дату в относительное время
  const getRelativeTime = (dateStr: string) => {
    try {
      // Парсим дату в формате "04 фев 2021 16:42"
      const [day, month, year, time] = dateStr.split(' ');
      const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      const monthIndex = months.indexOf(month);
      const [hours, minutes] = time.split(':');
      
      const eventDate = new Date(parseInt(year), monthIndex, parseInt(day), parseInt(hours), parseInt(minutes));
      const now = new Date();
      const diffInMs = now.getTime() - eventDate.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInDays > 0) {
        return `${diffInDays} ${diffInDays === 1 ? 'день' : diffInDays < 5 ? 'дня' : 'дней'} назад`;
      } else if (diffInHours > 0) {
        return `${diffInHours} ${diffInHours === 1 ? 'час' : diffInHours < 5 ? 'часа' : 'часов'} назад`;
      } else {
        return 'Только что';
      }
    } catch {
      return dateStr;
    }
  };

  const eventInfo = getEventInfo(description);
  
  return (
    <div className="relative flex items-start gap-4 pb-6 last:pb-0 group hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-10 w-0.5 h-full bg-gradient-to-b from-gray-300 to-gray-200"></div>
      )}
      
      {/* Event icon */}
      <div className={`flex-shrink-0 w-12 h-12 ${eventInfo.color} rounded-full flex items-center justify-center text-white shadow-lg z-10 ring-4 ring-white group-hover:scale-105 transition-transform duration-200`}>
        {eventInfo.icon}
      </div>
      
      {/* Event content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-gray-900 group-hover:text-gray-800">{eventInfo.title}</h4>
          <div className="flex flex-col items-end ml-2">
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {getRelativeTime(date)}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
              {date.split(' ').slice(-1)[0]} {/* Показываем только время */}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed mb-2">{eventInfo.detail}</p>
        
        {/* Additional context from original description */}
        {description !== eventInfo.detail && (
          <div className="text-xs text-gray-500 bg-gray-100 rounded-md px-2 py-1 mt-1">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g clipPath="url(#clip0_24_391)">
        <path d={svgPaths.p94cd00} fill="#E5E5E5" />
        <path d={svgPaths.p22a1a000} fill="white" />
        <path d={svgPaths.p1f088100} fill="#64B161" />
        <g>
          <path d={svgPaths.p22a1a000} fill="white" />
          <path clipRule="evenodd" d={svgPaths.p11557400} fill="white" fillRule="evenodd" />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_24_391">
          <rect fill="white" height="24" width="24" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function OrderDetail({ orderId, onClose, onEdit, onDelete, onUpdateStatus }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<FrontStatus>('new');
  const [isEditing, setIsEditing] = useState(false);

  // Редактируемые поля
  const [editableData, setEditableData] = useState({
    postcard: '',
    comment: '',
    address: '',
    deliveryDate: '',
    recipientName: '',
    recipientPhone: '',
    senderName: '',
    senderPhone: '',
    senderEmail: ''
  });

  // Map status from API to Russian display text
  const getStatusDisplay = (status: FrontStatus): string => {
    const statusMap = {
      'new': 'Новый',
      'paid': 'Оплачен',
      'accepted': 'Принят',
      'assembled': 'Собран',
      'in-transit': 'В пути',
      'completed': 'Завершен'
    };
    return statusMap[status] || status;
  };

  // Load order data from API
  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchOrderDetail(orderId);
        if (result.success && result.data) {
          setOrder(result.data);
          setCurrentStatus(result.data.status);
          
          // Initialize editable data with real order data
          setEditableData({
            postcard: result.data.postcard || '',
            comment: result.data.comment || '',
            address: result.data.deliveryAddress || '',
            deliveryDate: `${result.data.deliveryDate === 'today' ? 'Сегодня' : result.data.deliveryDate === 'tomorrow' ? 'Завтра' : result.data.deliveryDate}, ${result.data.deliveryTime || 'время не указано'}`,
            recipientName: result.data.recipient.name || '',
            recipientPhone: result.data.recipient.phone || '',
            senderName: result.data.sender.name || '',
            senderPhone: result.data.sender.phone || '',
            senderEmail: result.data.sender.email || ''
          });
        } else {
          setError('Не удалось загрузить заказ');
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        setError('Ошибка при загрузке заказа');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Transform order data for display
  const orderData = order ? {
    number: order.number || order.id,
    status: getStatusDisplay(currentStatus),
    mainProduct: order.mainProduct ? {
      image: order.mainProduct.image,
      title: order.mainProduct.title,
      composition: order.mainProduct.composition || ''
    } : null,
    additionalItems: order.additionalItems?.map(item => ({
      image: item.productImage,
      title: item.productTitle,
      subtitle: `${item.quantity || 1} шт`
    })) || [],
    postcard: editableData.postcard,
    comment: editableData.comment,
    delivery: {
      city: order.deliveryCity,
      date: editableData.deliveryDate,
      address: editableData.address
    },
    recipient: {
      name: editableData.recipientName,
      phone: editableData.recipientPhone
    },
    sender: {
      name: editableData.senderName,
      phone: editableData.senderPhone,
      email: editableData.senderEmail
    },
    payment: {
      amount: order.payment.amount,
      status: order.payment.status === 'paid' ? 'Оплачено' : 'Не оплачено'
    },
    anonymous: order.anonymous,
    photoBeforeDelivery: order.photoBeforeDelivery || null,
    history: order.history || []
  } : null;

  const handleStatusUpdate = (newStatus: string) => {
    // Convert display status back to API format if needed
    const statusMap: Record<string, FrontStatus> = {
      'Новый': 'new',
      'Оплачен': 'paid',
      'Принят': 'accepted',
      'Собран': 'assembled',
      'В пути': 'in-transit',
      'Завершен': 'completed'
    };
    const apiStatus = statusMap[newStatus] || newStatus as FrontStatus;
    setCurrentStatus(apiStatus);
    onUpdateStatus?.(newStatus);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Сохранить изменения
      onEdit?.();
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    // Reset changes to original order data
    if (order) {
      setEditableData({
        postcard: order.postcard || '',
        comment: order.comment || '',
        address: order.deliveryAddress || '',
        deliveryDate: `${order.deliveryDate === 'today' ? 'Сегодня' : order.deliveryDate === 'tomorrow' ? 'Завтра' : order.deliveryDate}, ${order.deliveryTime || 'время не указано'}`,
        recipientName: order.recipient.name || '',
        recipientPhone: order.recipient.phone || '',
        senderName: order.sender.name || '',
        senderPhone: order.sender.phone || '',
        senderEmail: order.sender.email || ''
      });
    }
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof typeof editableData, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка заказа...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Заказ не найден'}</p>
          <Button onClick={onClose} variant="outline">
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white h-16 flex items-center border-b border-gray-200">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="p-2 ml-4"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <h1 className="text-gray-900 ml-4">
            № {orderData.number}
          </h1>
          <div className="ml-auto mr-4 flex items-center gap-2">
            <StatusBadge status={orderData.status} />
            <Button variant="ghost" size="sm" className="p-2">
              <Share className="w-6 h-6 text-gray-600" />
            </Button>
          </div>
        </div>

        <div className="px-4 pb-20">
          {/* Main Product */}
          {orderData.mainProduct && (
            <div className="py-4 border-b border-gray-200">
              <OrderItem 
                image={orderData.mainProduct.image}
                title={orderData.mainProduct.title}
                subtitle={orderData.mainProduct.composition && orderData.mainProduct.composition.length > 60 ? 
                  `${orderData.mainProduct.composition.substring(0, 60)}...` : 
                  orderData.mainProduct.composition}
              />
              <button className="text-gray-600 text-sm mt-1">Скрыть</button>
            </div>
          )}

          {/* Photo Before Delivery */}
          <div className="py-4 border-b border-gray-200">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-full">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-gray-500">
                  <Camera />
                </div>
                <span className="text-gray-900">Фото до доставки</span>
              </div>
              <div className="text-sm text-gray-600">Не добавлено</div>
            </div>
          </div>

          {/* Notify About Flower Replacement */}
          <div className="py-4">
            <Button 
              variant="outline" 
              className="w-full h-11 border-gray-200 text-gray-900"
            >
              Оповестить о замене цветка
            </Button>
          </div>

          {/* Additional Items */}
          <div className="py-4">
            {orderData.additionalItems.map((item, index) => (
              <OrderItem 
                key={index}
                image={item.image}
                title={item.title}
                subtitle={item.subtitle}
              />
            ))}
          </div>

          {/* Postcard */}
          <div className="py-4 border-b border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Открытка</div>
            {isEditing ? (
              <Textarea
                value={editableData.postcard}
                onChange={(e) => handleFieldChange('postcard', e.target.value)}
                className="w-full min-h-[80px] resize-none"
                placeholder="Текст открытки"
              />
            ) : (
              <div className="text-gray-900">
                {orderData.postcard}
              </div>
            )}
          </div>

          {/* Comment */}
          <div className="py-4 border-b border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Комментарий</div>
            {isEditing ? (
              <Textarea
                value={editableData.comment}
                onChange={(e) => handleFieldChange('comment', e.target.value)}
                className="w-full min-h-[60px] resize-none"
                placeholder="Комментарий к заказу"
              />
            ) : (
              <div className="text-gray-900">
                {orderData.comment}
              </div>
            )}
          </div>

          {/* Delivery, Contacts & Payment - Compact Grid */}
          <div className="py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-3">
              {/* Delivery */}
              <div className="bg-gray-50 p-3 rounded">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Город</div>
                    <div className="text-sm text-gray-900">{orderData.delivery.city}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Анонимно</div>
                    <div className="text-sm text-gray-900">{orderData.anonymous ? 'Да' : 'Нет'}</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-xs text-gray-600 mb-0.5">Время доставки</div>
                  {isEditing ? (
                    <Input
                      value={editableData.deliveryDate}
                      onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
                      placeholder="Время доставки"
                      className="text-sm h-8"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{orderData.delivery.date}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-0.5">Адрес</div>
                  {isEditing ? (
                    <Input
                      value={editableData.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      placeholder="Адрес доставки"
                      className="text-sm h-8"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{orderData.delivery.address}</div>
                  )}
                </div>
              </div>

              {/* Contacts */}
              <div className="bg-gray-50 p-3 rounded">
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Получатель</div>
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input
                          value={editableData.recipientName}
                          onChange={(e) => handleFieldChange('recipientName', e.target.value)}
                          placeholder="Имя получателя"
                          className="text-sm h-8"
                        />
                        <Input
                          type="tel"
                          value={editableData.recipientPhone}
                          onChange={(e) => handleFieldChange('recipientPhone', e.target.value)}
                          placeholder="Телефон получателя"
                          className="text-sm h-8"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{orderData.recipient.name}</span>
                        <span className="text-sm text-gray-600">{orderData.recipient.phone}</span>
                        <div className="w-4 h-4">
                          <WhatsAppIcon />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Отправитель</div>
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input
                          value={editableData.senderName}
                          onChange={(e) => handleFieldChange('senderName', e.target.value)}
                          placeholder="Имя отправителя"
                          className="text-sm h-8"
                        />
                        <Input
                          type="tel"
                          value={editableData.senderPhone}
                          onChange={(e) => handleFieldChange('senderPhone', e.target.value)}
                          placeholder="Телефон отправителя"
                          className="text-sm h-8"
                        />
                        <Input
                          value={editableData.senderEmail}
                          onChange={(e) => handleFieldChange('senderEmail', e.target.value)}
                          placeholder="Email отправителя"
                          type="email"
                          className="text-sm h-8"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {orderData.sender.name && (
                            <span className="text-sm text-gray-900">{orderData.sender.name}</span>
                          )}
                          <span className="text-sm text-gray-600">{orderData.sender.phone}</span>
                          <div className="w-4 h-4">
                            <WhatsAppIcon />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">{orderData.sender.email}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-gray-50 p-3 rounded">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Сумма к оплате</div>
                    <div className="text-sm text-gray-900">{orderData.payment.amount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Статус оплаты</div>
                    <div className="text-sm text-gray-900">{orderData.payment.status}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="py-6 border-t border-gray-200">
            <h3 className="text-gray-900 mb-4">Статус выполнения</h3>
            
            <div className="space-y-3">
              {/* Status */}
              <div className="flex justify-between items-center py-3 px-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    currentStatus === 'new' ? 'bg-red-500' :
                    currentStatus === 'paid' ? 'bg-blue-500' :
                    currentStatus === 'accepted' ? 'bg-gray-500' :
                    currentStatus === 'assembled' ? 'bg-yellow-500' :
                    currentStatus === 'in-transit' ? 'bg-green-500' :
                    'bg-gray-400'
                  }`}></div>
                  <div>
                    <div className="text-sm text-gray-600">Статус</div>
                    <div className="text-gray-900">{getStatusDisplay(currentStatus)}</div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Responsible */}
              <div className="flex justify-between items-center py-3 px-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm">
                    АМ
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Ответственный</div>
                    <div className="text-gray-900">Амина М</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Courier */}
              <div className="flex justify-between items-center py-3 px-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Курьер</div>
                    <div className="text-gray-500">Не назначен</div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="py-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-900">История заказа</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Timeline</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 space-y-0 border border-gray-200/50">
              {orderData.history.map((item, index) => (
                <HistoryItem 
                  key={index} 
                  date={item.date} 
                  description={item.description} 
                  isLast={index === orderData.history.length - 1}
                />
              ))}
              
              {/* Status indicator at the bottom */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Заказ активен • История обновляется автоматически</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="py-6 space-y-3">
            {!isEditing && (
              <Button 
                onClick={() => handleStatusUpdate('Оплачен')}
                className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white"
              >
                Оплачен
              </Button>
            )}
            
            {isEditing ? (
              <div className="flex gap-3">
                <Button 
                  onClick={handleEditToggle}
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Сохранить
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1 h-12 border-gray-300 text-gray-900 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Отмена
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline"
                onClick={handleEditToggle}
                className="w-full h-12 border-gray-200 text-gray-900 tracking-wide"
              >
                Редактировать
              </Button>
            )}
            
            {!isEditing && (
              <Button 
                variant="destructive"
                onClick={onDelete}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white tracking-wide"
              >
                УДАЛИТЬ
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}