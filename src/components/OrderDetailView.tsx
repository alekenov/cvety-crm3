import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Share, Check, X, ShoppingCart, CreditCard, User, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { fetchOrderDetail, changeOrderStatus, deleteOrder, type FrontStatus, type Order } from '../api/orders';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

// Status configuration
const STATUS_CONFIG = {
  new: { label: 'Новый', color: 'bg-red-500' },
  paid: { label: 'Оплачен', color: 'bg-blue-500' },
  accepted: { label: 'Принят', color: 'bg-pink-500' },
  assembled: { label: 'Собран', color: 'bg-yellow-500' },
  'in-transit': { label: 'В пути', color: 'bg-green-500' },
  completed: { label: 'Завершен', color: 'bg-gray-500' }
};

// Status badge component
function StatusBadge({ status }: { status: string }) {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded text-sm bg-gray-100 text-gray-600`}>
      {status}
    </div>
  );
}

// Order item component for products
function OrderItem({ image, title, subtitle }: { image: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div 
        className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0 bg-gray-200"
        style={{ backgroundImage: image ? `url('${image}')` : undefined }}
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

// History item component
function HistoryItem({ 
  date, 
  description, 
  isLast = false 
}: { 
  date: string; 
  description: string; 
  isLast?: boolean;
}) {
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
      const florrist = desc.match(/Флорист ([^с]+)/)?.[1]?.trim();
      return {
        icon: <User className="w-4 h-4" />,
        color: 'bg-gray-500',
        title: 'Назначен флорист',
        detail: florrist ? `Флорист: ${florrist}` : desc
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

  const eventInfo = getEventInfo(description);
  
  return (
    <div className="relative flex items-start gap-4 pb-6 last:pb-0 group hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors">
      {!isLast && (
        <div className="absolute left-6 top-10 w-0.5 h-full bg-gradient-to-b from-gray-300 to-gray-200"></div>
      )}
      
      <div className={`flex-shrink-0 w-12 h-12 ${eventInfo.color} rounded-full flex items-center justify-center text-white shadow-lg z-10 ring-4 ring-white group-hover:scale-105 transition-transform duration-200`}>
        {eventInfo.icon}
      </div>
      
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-gray-900 group-hover:text-gray-800">{eventInfo.title}</h4>
          <span className="text-xs text-gray-600 whitespace-nowrap">{date}</span>
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed mb-2">{eventInfo.detail}</p>
        
        {description !== eventInfo.detail && (
          <div className="text-xs text-gray-500 bg-gray-100 rounded-md px-2 py-1 mt-1">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable fields
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

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchOrderDetail(id);
        if (result.success && result.data) {
          setOrder(result.data);
          // Initialize editable data from loaded order
          setEditableData({
            postcard: result.data.postcard || '',
            comment: result.data.comment || '',
            address: result.data.deliveryAddress || '',
            deliveryDate: `${result.data.deliveryDate}, ${result.data.deliveryTime}`,
            recipientName: result.data.recipient?.name || '',
            recipientPhone: result.data.recipient?.phone || '',
            senderName: result.data.sender?.name || '',
            senderPhone: result.data.sender?.phone || '',
            senderEmail: result.data.sender?.email || ''
          });
        } else {
          setError('Не удалось загрузить заказ');
        }
      } catch (error) {
        console.error('Failed to load order:', error);
        setError('Ошибка при загрузке заказа');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus: FrontStatus) => {
    if (!order) return;
    
    try {
      await changeOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async () => {
    if (!order || !confirm('Вы уверены, что хотите удалить этот заказ?')) return;
    
    try {
      await deleteOrder(order.id);
      navigate('/orders');
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes - in real app would send to API
      console.log('Saving changes:', editableData);
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    // Reset to original data
    if (order) {
      setEditableData({
        postcard: order.postcard || '',
        comment: order.comment || '',
        address: order.deliveryAddress || '',
        deliveryDate: `${order.deliveryDate}, ${order.deliveryTime}`,
        recipientName: order.recipient?.name || '',
        recipientPhone: order.recipient?.phone || '',
        senderName: order.sender?.name || '',
        senderPhone: order.sender?.phone || '',
        senderEmail: order.sender?.email || ''
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка заказа...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Заказ не найден'}</p>
          <Button 
            onClick={() => navigate('/orders')}
            className="mt-4"
          >
            Вернуться к заказам
          </Button>
        </div>
      </div>
    );
  }

  // Get status configuration
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
  
  // Format delivery date
  const formatDeliveryDate = () => {
    let date = order.deliveryDate === 'today' ? 'Сегодня' : 
               order.deliveryDate === 'tomorrow' ? 'Завтра' : 
               order.deliveryDate;
    
    if (order.deliveryTime) {
      if (order.deliveryTime === 'Узнать время у получателя') {
        date += ', в течение дня';
      } else {
        date += `, ${order.deliveryTime}`;
      }
    }
    return date;
  };

  // Get next status for button
  const getNextStatus = (): FrontStatus | null => {
    const statusFlow: Record<FrontStatus, FrontStatus> = {
      'new': 'paid',
      'paid': 'accepted',
      'accepted': 'assembled',
      'assembled': 'in-transit',
      'in-transit': 'completed',
      'completed': 'completed'
    };
    return order.status !== 'completed' ? statusFlow[order.status] : null;
  };

  const nextStatus = getNextStatus();
  const nextStatusLabel = nextStatus ? STATUS_CONFIG[nextStatus].label : null;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white h-16 flex items-center border-b border-gray-200">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/orders')}
            className="p-2 ml-4"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <h1 className="text-gray-900 ml-4">
            № {order.number}
          </h1>
          <div className="ml-auto mr-4 flex items-center gap-2">
            <StatusBadge status={statusConfig.label} />
            <Button variant="ghost" size="sm" className="p-2">
              <Share className="w-6 h-6 text-gray-600" />
            </Button>
          </div>
        </div>

        <div className="px-4 pb-20">
          {/* Main Product */}
          <div className="py-4 border-b border-gray-200">
            <OrderItem 
              image={order.mainProduct.image}
              title={order.mainProduct.title}
              subtitle={order.mainProduct.composition || undefined}
            />
            {order.mainProduct.composition && order.mainProduct.composition.length > 60 && (
              <button className="text-gray-600 text-sm mt-1">Показать все</button>
            )}
          </div>

          {/* Photo Before Delivery */}
          <div className="py-4 border-b border-gray-200">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-full">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-gray-500">
                  <Camera />
                </div>
                <span className="text-gray-900">Фото до доставки</span>
              </div>
              <div className="text-sm text-gray-600">
                {order.photoBeforeDelivery ? 'Добавлено' : 'Не добавлено'}
              </div>
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
          {order.additionalItems && order.additionalItems.length > 0 && (
            <div className="py-4">
              {order.additionalItems.map((item, index) => (
                <OrderItem 
                  key={index}
                  image={item.productImage}
                  title={item.productTitle}
                  subtitle={`Количество: ${item.quantity}`}
                />
              ))}
            </div>
          )}

          {/* Postcard */}
          {(order.postcard || isEditing) && (
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
                  {order.postcard || 'Без открытки'}
                </div>
              )}
            </div>
          )}

          {/* Comment */}
          {(order.comment || isEditing) && (
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
                  {order.comment || 'Без комментария'}
                </div>
              )}
            </div>
          )}

          {/* Delivery, Contacts & Payment */}
          <div className="py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-3">
              {/* Delivery */}
              <div className="bg-gray-50 p-3 rounded">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Город</div>
                    <div className="text-sm text-gray-900">{order.deliveryCity || 'Не указан'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Анонимно</div>
                    <div className="text-sm text-gray-900">{order.anonymous ? 'Да' : 'Нет'}</div>
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
                    <div className="text-sm text-gray-900">{formatDeliveryDate()}</div>
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
                    <div className="text-sm text-gray-900">
                      {order.deliveryAddress && order.deliveryAddress !== 'Узнать у получателя' 
                        ? order.deliveryAddress 
                        : 'Узнать у получателя'}
                    </div>
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
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">{order.recipient?.name || 'Не указан'}</div>
                        <div className="text-sm text-gray-600">{order.recipient?.phone || 'Не указан'}</div>
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
                        <div className="text-sm text-gray-900">{order.sender?.name || 'Не указан'}</div>
                        <div className="text-sm text-gray-600">{order.sender?.phone || 'Не указан'}</div>
                        {order.sender?.email && (
                          <div className="text-sm text-gray-600">{order.sender.email}</div>
                        )}
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
                    <div className="text-sm text-gray-900">{order.payment?.amount || '0 ₸'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-0.5">Статус оплаты</div>
                    <div className="text-sm text-gray-900">
                      {order.payment?.status === 'paid' ? 'Оплачено' : 'Не оплачено'}
                    </div>
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
                  <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.color}`}></div>
                  <div>
                    <div className="text-sm text-gray-600">Статус</div>
                    <div className="text-gray-900">{statusConfig.label}</div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Responsible */}
              {order.executor?.florist && (
                <div className="flex justify-between items-center py-3 px-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm">
                      {order.executor.florist.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Ответственный</div>
                      <div className="text-gray-900">{order.executor.florist}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Courier */}
              {order.executor?.courier && (
                <div className="flex justify-between items-center py-3 px-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Курьер</div>
                      <div className="text-gray-900">{order.executor.courier}</div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* History */}
          {order.history && order.history.length > 0 && (
            <div className="py-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-900">История заказа</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Timeline</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 space-y-0 border border-gray-200/50">
                {order.history.map((item, index) => (
                  <HistoryItem 
                    key={index} 
                    date={item.date} 
                    description={item.description} 
                    isLast={index === order.history.length - 1}
                  />
                ))}
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Заказ активен • История обновляется автоматически</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="py-6 space-y-3">
            {!isEditing && nextStatus && (
              <Button 
                onClick={() => handleStatusUpdate(nextStatus)}
                className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white"
              >
                {nextStatusLabel}
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
                onClick={handleDelete}
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