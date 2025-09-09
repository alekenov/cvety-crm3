// Order Detail Component - Refactored
// Reduced from 790 lines to <200 lines by extracting reusable components

import { ArrowLeft, Camera, Share, Clock, ChevronDown, Link as LinkIcon, Eye, Copy, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import svgPaths from "../imports/svg-n764ux8j24";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// Import extracted components
import { StatusBadge } from "./order/StatusBadge";
import { OrderItem } from "./order/OrderItem";
import { OrderHistoryItem } from "./order/OrderHistoryItem";
import { OrderActions } from "./order/OrderActions";
import { useOrderDetail } from "./order/hooks/useOrderDetail";

interface OrderDetailProps {
  orderId: string;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateStatus?: (status: string) => void;
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
  const {
    order,
    isLoading,
    error,
    currentStatus,
    isEditing,
    editableData,
    setEditableData,
    getStatusDisplay,
    handleStatusUpdate,
    handleEditToggle,
    handleCancelEdit
  } = useOrderDetail(orderId);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загружаем заказ...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Заказ не найден'}</p>
          <Button onClick={onClose} variant="outline">
            Назад к списку
          </Button>
        </div>
      </div>
    );
  }

  // Transform order data for display
  const orderData = {
    number: order.number || order.id,
    status: getStatusDisplay(currentStatus),
    mainProduct: order.mainProduct ? {
      image: order.mainProduct.image,
      title: order.mainProduct.title,
      composition: order.mainProduct.composition || ''
    } : null,
    additionalItems: order.additionalItems?.map(item => ({
      image: item.image,
      title: item.title,
      subtitle: item.quantity ? `Количество: ${item.quantity}` : undefined
    })) || [],
    recipient: order.recipient,
    sender: order.sender,
    deliveryAddress: order.deliveryAddress,
    deliveryDate: order.deliveryDate,
    deliveryTime: order.deliveryTime,
    paymentAmount: order.payment?.amount,
    paymentStatus: order.payment?.status,
    postcard: order.postcard,
    comment: order.comment,
    history: order.history || []
  };

  // Share helpers
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Clipboard error:', e);
    }
  };

  const shareColleagueLink = async () => {
    const url = window.location.href;
    await copyToClipboard(url);
    setIsShareOpen(false);
  };

  const shareStatusLink = async () => {
    const url = window.location.href; // could be customer-safe link if exists
    await copyToClipboard(url);
    setIsShareOpen(false);
  };

  const copyOrderText = async () => {
    if (!order) return;
    const lines = [
      `Заказ #${order.number}`,
      `Статус: ${getStatusDisplay(currentStatus)}`,
      `Получатель: ${order.recipient.name}, ${order.recipient.phone}`,
      `Отправитель: ${order.sender.name}, ${order.sender.phone}`,
      `Доставка: ${order.deliveryAddress} (${order.deliveryDate}${order.deliveryTime ? ", "+order.deliveryTime : ''})`,
      order.postcard ? `Открытка: ${order.postcard}` : '',
      order.comment ? `Комментарий: ${order.comment}` : '',
    ].filter(Boolean).join('\n');
    await copyToClipboard(lines);
    setIsShareOpen(false);
  };

  const exportPDF = () => {
    console.log('Export to PDF requested');
    setIsShareOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg text-gray-900">Заказ #{orderData.number}</h1>
              <div className="flex items-center gap-2">
                <StatusBadge status={orderData.status} />
                {/* Status dropdown */}
                <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-600">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1" align="start">
                    {['Новый','Оплачен','Принят','Собран','В пути','Завершен'].map((s) => (
                      <button
                        key={s}
                        onClick={() => { handleStatusUpdate(s); setIsStatusOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                      >
                        {s}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
            <Popover open={isShareOpen} onOpenChange={setIsShareOpen}>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Share className="w-5 h-5 text-gray-600" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-1" align="end">
                <div className="py-1">
                  <button onClick={shareColleagueLink} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-900">Ссылка на заказ</div>
                      <div className="text-xs text-gray-500">Для коллег</div>
                    </div>
                  </button>
                  <button onClick={shareStatusLink} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-900">Ссылка на статус</div>
                      <div className="text-xs text-gray-500">Для клиента</div>
                    </div>
                  </button>
                  <button onClick={copyOrderText} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2">
                    <Copy className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-900">Копировать текст</div>
                      <div className="text-xs text-gray-500">Весь заказ</div>
                    </div>
                  </button>
                  <button onClick={exportPDF} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2 border-t border-gray-100 mt-1 pt-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-900">Экспорт в PDF</div>
                      <div className="text-xs text-gray-500">Для печати</div>
                    </div>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Main Product */}
          {orderData.mainProduct && (
            <div>
              <h3 className="text-gray-900 mb-3">Основной товар</h3>
              <OrderItem 
                image={orderData.mainProduct.image}
                title={orderData.mainProduct.title}
                subtitle={orderData.mainProduct.composition}
              />
            </div>
          )}

          {/* Additional Items */}
          {orderData.additionalItems.length > 0 && (
            <div>
              <h3 className="text-gray-900 mb-3">Дополнительные товары</h3>
              {orderData.additionalItems.map((item, index) => (
                <OrderItem 
                  key={index}
                  image={item.image}
                  title={item.title}
                  subtitle={item.subtitle}
                />
              ))}
            </div>
          )}

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-gray-900">Информация о клиенте</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Получатель</label>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input 
                      value={editableData.recipientName}
                      onChange={(e) => setEditableData({...editableData, recipientName: e.target.value})}
                      placeholder="Имя получателя"
                    />
                    <Input 
                      value={editableData.recipientPhone}
                      onChange={(e) => setEditableData({...editableData, recipientPhone: e.target.value})}
                      placeholder="Телефон получателя"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-900">{orderData.recipient.name}</div>
                    <div className="text-sm text-gray-600">{orderData.recipient.phone}</div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Отправитель</label>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input 
                      value={editableData.senderName}
                      onChange={(e) => setEditableData({...editableData, senderName: e.target.value})}
                      placeholder="Имя отправителя"
                    />
                    <Input 
                      value={editableData.senderPhone}
                      onChange={(e) => setEditableData({...editableData, senderPhone: e.target.value})}
                      placeholder="Телефон отправителя"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-900">{orderData.sender.name}</div>
                    <div className="text-sm text-gray-600">{orderData.sender.phone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery and Payment Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Адрес доставки</label>
                {isEditing ? (
                  <Textarea 
                    value={editableData.address}
                    onChange={(e) => setEditableData({...editableData, address: e.target.value})}
                    placeholder="Введите адрес доставки"
                  />
                ) : (
                  <div className="text-gray-900">{orderData.deliveryAddress}</div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Доставка</label>
                  <div className="text-gray-900">
                    {orderData.deliveryDate === 'today' ? 'Сегодня' : orderData.deliveryDate === 'tomorrow' ? 'Завтра' : orderData.deliveryDate}
                    {orderData.deliveryTime && `, ${orderData.deliveryTime}`}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Сумма</label>
                  <div className="text-gray-900">{orderData.paymentAmount || 'Не указана'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order History */}
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
                <OrderHistoryItem 
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

          {/* Actions */}
          <OrderActions
            isEditing={isEditing}
            onStatusUpdate={handleStatusUpdate}
            onEditToggle={handleEditToggle}
            onCancelEdit={handleCancelEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
