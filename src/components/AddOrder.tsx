import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";

interface Product {
  id: number;
  image: string;
  images?: string[];
  title: string;
  price: string;
  isAvailable: boolean;
  createdAt: Date;
  type: 'vitrina' | 'catalog';
  composition?: Array<{ name: string; count: string }>;
}

interface OrderData {
  selectedProduct: Product | null;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress: string;
  deliveryDate: 'today' | 'tomorrow';
  deliveryTime: string;
  recipientName: string;
  recipientPhone: string;
  senderName: string;
  senderPhone: string;
  postcard: string;
  comment: string;
}

interface AddOrderProps {
  products: Product[];
  onClose: () => void;
  onCreateOrder: (orderData: OrderData) => void;
}

function ProductSelectionStep({ 
  products, 
  selectedProduct, 
  onSelectProduct 
}: { 
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
}) {
  const availableProducts = products.filter(p => p.isAvailable);

  return (
    <div className="px-3">
      <div className="py-4">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Выберите товар</h2>
        <p className="text-sm text-gray-600 mb-4">Выберите товар для заказа из доступных в каталоге</p>
      </div>

      <div className="space-y-0">
        {availableProducts.map((product) => (
          <div 
            key={product.id}
            className={`p-3 border-b border-gray-200 cursor-pointer transition-colors ${
              selectedProduct?.id === product.id 
                ? 'bg-purple-50 border-purple-200' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectProduct(product)}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 bg-cover bg-center rounded-full flex-shrink-0"
                style={{ backgroundImage: `url('${product.images?.[0] || product.image}')` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">{product.title}</span>
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide bg-white border border-emerald-500 text-emerald-500">
                    {product.type === 'vitrina' ? 'Витрина' : 'Каталог'}
                  </div>
                </div>
                <div className="text-gray-700 text-sm">{product.price}</div>
                {product.composition && (
                  <div className="text-gray-600 text-xs mt-0.5">
                    {product.composition.slice(0, 2).map(item => item.name).join(', ')}
                    {product.composition.length > 2 && '...'}
                  </div>
                )}
              </div>
              {selectedProduct?.id === product.id && (
                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {availableProducts.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-gray-500 mb-1 text-sm">Нет доступных товаров</div>
          <div className="text-xs text-gray-400">
            Добавьте товары в каталог и активируйте их
          </div>
        </div>
      )}
    </div>
  );
}

function DeliveryStep({ 
  orderData, 
  onUpdateData 
}: { 
  orderData: OrderData;
  onUpdateData: (updates: Partial<OrderData>) => void;
}) {


  const timeOptions = [
    { id: '120-150', label: '120–150 мин' },
    { id: '18-19', label: '18:00–19:00' },
    { id: '19-20', label: '19:00–20:00' },
    { id: '20-21', label: '20:00–21:00' }
  ];

  return (
    <div className="px-3">
      <div className="py-4">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          {orderData.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {orderData.deliveryType === 'delivery' 
            ? 'Укажите адрес и время доставки'
            : 'Выберите время для самовывоза из магазина'
          }
        </p>
      </div>

      <div className="space-y-4">
        {/* Способ получения */}
        <div>
          <div className="text-xs text-gray-600 mb-2">Способ получения</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateData({ deliveryType: 'delivery' })}
              className={`p-2 rounded-sm border transition-colors ${
                orderData.deliveryType === 'delivery'
                  ? 'border-purple-300 bg-purple-100 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <div className="font-medium text-xs">Доставка</div>
              <div className="text-xs opacity-75">Курьером</div>
            </button>
            <button
              onClick={() => onUpdateData({ deliveryType: 'pickup' })}
              className={`p-2 rounded-sm border transition-colors ${
                orderData.deliveryType === 'pickup'
                  ? 'border-purple-300 bg-purple-100 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <div className="font-medium text-xs">Самовывоз</div>
              <div className="text-xs opacity-75">Из магазина</div>
            </button>
          </div>
        </div>





        {/* Адрес доставки - только для доставки */}
        {orderData.deliveryType === 'delivery' && (
          <div>
            <div className="text-xs text-gray-600 mb-1">Адрес доставки</div>
            <Input
              value={orderData.deliveryAddress}
              onChange={(e) => onUpdateData({ deliveryAddress: e.target.value })}
              placeholder="ул. Примерная 123, кв. 45"
              className="w-full text-sm"
            />
          </div>
        )}

        {/* Дата и время */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <Clock className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs text-gray-600">Дата и время</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateData({ deliveryDate: 'today' })}
                className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                  orderData.deliveryDate === 'today'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                Сегодня
              </button>
              <button
                onClick={() => onUpdateData({ deliveryDate: 'tomorrow' })}
                className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                  orderData.deliveryDate === 'tomorrow'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                Завтра
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {timeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onUpdateData({ deliveryTime: option.id })}
                  className={`py-1.5 px-1 rounded-md text-xs font-medium transition-colors text-center ${
                    orderData.deliveryTime === option.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Получатель - только для доставки */}
        {orderData.deliveryType === 'delivery' && (
          <div className="border-t border-gray-200 pt-3">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Получатель</h3>
            
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-600 mb-1">Имя получателя</div>
                <Input
                  value={orderData.recipientName}
                  onChange={(e) => onUpdateData({ recipientName: e.target.value })}
                  placeholder="Анна"
                  className="w-full text-sm"
                />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Телефон получателя</div>
                <Input
                  type="tel"
                  value={orderData.recipientPhone}
                  onChange={(e) => onUpdateData({ recipientPhone: e.target.value })}
                  placeholder="+7 (000) 000-00-00"
                  className="w-full text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Заказчик */}
        <div className="border-t border-gray-200 pt-3">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            {orderData.deliveryType === 'pickup' ? 'Контактные данные' : 'Заказчик'}
          </h3>
          
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-600 mb-1">Имя</div>
              <Input
                value={orderData.senderName}
                onChange={(e) => onUpdateData({ senderName: e.target.value })}
                placeholder="Сергей"
                className="w-full text-sm"
              />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Телефон</div>
              <Input
                type="tel"
                value={orderData.senderPhone}
                onChange={(e) => onUpdateData({ senderPhone: e.target.value })}
                placeholder="+7 (000) 000-00-00"
                className="w-full text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalStep({ 
  orderData, 
  onUpdateData 
}: { 
  orderData: OrderData;
  onUpdateData: (updates: Partial<OrderData>) => void;
}) {
  const getDeliveryDateText = (date: string) => {
    return date === 'today' ? 'Сегодня' : 'Завтра';
  };

  const getTimeText = (time: string) => {
    const timeOptions: Record<string, string> = {
      '120-150': '120–150 мин',
      '18-19': '18:00–19:00',
      '19-20': '19:00–20:00',
      '20-21': '20:00–21:00'
    };
    return timeOptions[time] || time;
  };



  return (
    <div className="px-3">
      <div className="py-4">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Подтверждение заказа</h2>
        <p className="text-sm text-gray-600 mb-4">Проверьте данные и добавьте дополнительную информацию</p>
      </div>

      <div className="space-y-3">
        {/* Выбранный товар */}
        {orderData.selectedProduct && (
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-xs text-gray-600 mb-2">Выбранный товар</div>
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 bg-cover bg-center rounded-full"
                style={{ backgroundImage: `url('${orderData.selectedProduct.images?.[0] || orderData.selectedProduct.image}')` }}
              />
              <div>
                <div className="font-medium text-gray-900 text-sm">{orderData.selectedProduct.title}</div>
                <div className="text-purple-600 font-medium text-sm">{orderData.selectedProduct.price}</div>
              </div>
            </div>
          </div>
        )}

        {/* Детали получения */}
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-xs text-gray-600 mb-2">Получение</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700 text-xs">Способ:</span>
              <span className="font-medium text-gray-900 text-xs">
                {orderData.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}
              </span>
            </div>
            {orderData.deliveryType === 'delivery' && orderData.deliveryAddress && (
              <div className="flex justify-between">
                <span className="text-gray-700 text-xs">Адрес:</span>
                <span className="font-medium text-gray-900 text-xs text-right max-w-[200px]">
                  {orderData.deliveryAddress}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-700 text-xs">Дата:</span>
              <span className="font-medium text-gray-900 text-xs">
                {getDeliveryDateText(orderData.deliveryDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 text-xs">Время:</span>
              <span className="font-medium text-gray-900 text-xs">
                {getTimeText(orderData.deliveryTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Открытка */}
        <div>
          <div className="text-xs text-gray-600 mb-1">Текст открытки (опционально)</div>
          <Textarea
            value={orderData.postcard}
            onChange={(e) => onUpdateData({ postcard: e.target.value })}
            placeholder="С Днем рождения! Желаем счастья и здоровья!"
            className="w-full min-h-[60px] resize-none text-sm"
          />
        </div>

        {/* Комментарий */}
        <div>
          <div className="text-xs text-gray-600 mb-1">Комментарий к заказу (опционально)</div>
          <Textarea
            value={orderData.comment}
            onChange={(e) => onUpdateData({ comment: e.target.value })}
            placeholder="Особые пожелания или инструкции"
            className="w-full min-h-[50px] resize-none text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export function AddOrder({ products, onClose, onCreateOrder }: AddOrderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState<OrderData>({
    selectedProduct: null,
    deliveryType: 'delivery',
    deliveryAddress: '',
    deliveryDate: 'today',
    deliveryTime: '120-150',
    recipientName: '',
    recipientPhone: '',
    senderName: '',
    senderPhone: '',
    postcard: '',
    comment: ''
  });

  const updateOrderData = (updates: Partial<OrderData>) => {
    setOrderData(prev => {
      const newData = { ...prev, ...updates };
      
      // Если меняется тип доставки, очищаем ненужные поля
      if (updates.deliveryType) {
        if (updates.deliveryType === 'pickup') {
          // Для самовывоза очищаем адрес и данные получателя
          newData.deliveryAddress = '';
          newData.recipientName = '';
          newData.recipientPhone = '';
        }
      }
      

      
      return newData;
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = () => {
    onCreateOrder(orderData);
    onClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return orderData.selectedProduct !== null;
      case 2:
        // Базовые требования - тип доставки, дата, время, имя и телефон заказчика
        const hasBasicInfo = orderData.deliveryType && orderData.deliveryDate && 
                            orderData.deliveryTime && orderData.senderName && orderData.senderPhone;
        
        // Для доставки дополнительно нужен адрес и данные получателя
        if (orderData.deliveryType === 'delivery') {
          return hasBasicInfo && orderData.deliveryAddress && 
                 orderData.recipientName && orderData.recipientPhone;
        }
        
        // Для самовывоза достаточно базовой информации
        return hasBasicInfo;
      case 3:
        return true; // На последнем шаге все опционально
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProductSelectionStep
            products={products}
            selectedProduct={orderData.selectedProduct}
            onSelectProduct={(product) => updateOrderData({ selectedProduct: product })}
          />
        );
      case 2:
        return (
          <DeliveryStep
            orderData={orderData}
            onUpdateData={updateOrderData}
          />
        );
      case 3:
        return (
          <FinalStep
            orderData={orderData}
            onUpdateData={updateOrderData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white h-14 flex items-center border-b border-gray-200">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="p-2 ml-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="font-medium text-lg text-gray-900 ml-3">
            Новый заказ
          </h1>
          <div className="ml-auto mr-3">
            <div className="text-xs text-gray-500">
              {currentStep} из 3
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-3 py-2 bg-gray-50">
          <div className="flex space-x-1">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="pb-20">
          {renderStep()}
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-3">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button 
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 h-12 border-gray-300 text-gray-900"
              >
                Назад
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`h-12 ${
                  currentStep === 1 ? 'flex-1' : 'flex-1'
                }`}
              >
                <span className="mr-1">Далее</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreate}
                disabled={!isStepValid()}
                className="flex-1 h-12"
              >
                Создать заказ
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}