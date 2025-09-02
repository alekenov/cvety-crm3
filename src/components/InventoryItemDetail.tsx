import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ArrowLeft, Minus, Plus, Calendar, Package } from "lucide-react";

interface InventoryTransaction {
  id: number;
  type: 'consumption' | 'adjustment' | 'waste';
  quantity: number;
  comment: string;
  date: Date;
  referenceType?: string;
  referenceId?: string;
}

interface InventoryItemDetailProps {
  itemId: number;
  onClose: () => void;
  onUpdateItem?: (itemId: number, updates: any) => void;
}

const mockItem = {
  id: 1,
  name: "Розы красные",
  category: 'flowers',
  price: "450 ₸",
  unit: "шт",
  quantity: 85,
  costPrice: "280 ₸", // себестоимость
  retailPrice: "450 ₸", // розничная цена
  markup: 60.7, // процент наценки
  lastDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=100&h=100&fit=crop"
};

const mockTransactions: InventoryTransaction[] = [
  {
    id: 1,
    type: 'consumption',
    quantity: -12,
    comment: 'Использовано для заказа #40421',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000),
    referenceType: 'order',
    referenceId: '40421'
  },
  {
    id: 2,
    type: 'consumption',
    quantity: -7,
    comment: 'Использовано для заказа #40418',
    date: new Date(Date.now() - 18 * 60 * 60 * 1000),
    referenceType: 'order',
    referenceId: '40418'
  },
  {
    id: 3,
    type: 'waste',
    quantity: -3,
    comment: 'Увяли - списание',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 4,
    type: 'adjustment',
    quantity: -5,
    comment: 'Корректировка остатков',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 5,
    type: 'consumption',
    quantity: -15,
    comment: 'Использовано для заказа #40415',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    referenceType: 'order',
    referenceId: '40415'
  }
];

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} дн. назад`;
  } else if (diffInHours > 0) {
    return `${diffInHours} ч. назад`;
  } else {
    return 'Только что';
  }
}

function getTransactionTypeLabel(type: string): string {
  switch (type) {
    case 'consumption': return 'Расход';
    case 'adjustment': return 'Корректировка';
    case 'waste': return 'Списание';
    default: return type;
  }
}

function getTransactionTypeColor(type: string): string {
  switch (type) {
    case 'consumption': return 'bg-blue-100 text-blue-700';
    case 'adjustment': return 'bg-orange-100 text-orange-700';
    case 'waste': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export function InventoryItemDetail({ itemId, onClose, onUpdateItem }: InventoryItemDetailProps) {
  const [item, setItem] = useState(mockItem);
  const [transactions] = useState<InventoryTransaction[]>(mockTransactions);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCostPrice, setEditedCostPrice] = useState(item.costPrice);
  const [editedRetailPrice, setEditedRetailPrice] = useState(item.retailPrice);
  const [writeOffQuantity, setWriteOffQuantity] = useState('');
  const [writeOffComment, setWriteOffComment] = useState('');
  const [showWriteOff, setShowWriteOff] = useState(false);

  // Вычисляем наценку
  const calculateMarkup = (costPrice: string, retailPrice: string) => {
    const cost = parseFloat(costPrice.replace(/[^\d.]/g, ''));
    const retail = parseFloat(retailPrice.replace(/[^\d.]/g, ''));
    if (cost > 0) {
      return ((retail - cost) / cost * 100).toFixed(1);
    }
    return '0';
  };

  const handleSavePrices = () => {
    const newMarkup = parseFloat(calculateMarkup(editedCostPrice, editedRetailPrice));
    setItem(prev => ({
      ...prev,
      costPrice: editedCostPrice,
      retailPrice: editedRetailPrice,
      markup: newMarkup
    }));
    setIsEditing(false);
    if (onUpdateItem) {
      onUpdateItem(itemId, {
        costPrice: editedCostPrice,
        retailPrice: editedRetailPrice,
        markup: newMarkup
      });
    }
  };

  const handleWriteOff = () => {
    const quantity = parseInt(writeOffQuantity);
    if (quantity > 0 && quantity <= item.quantity && writeOffComment.trim()) {
      // Создаем новую транзакцию
      const newTransaction: InventoryTransaction = {
        id: transactions.length + 1,
        type: 'waste',
        quantity: -quantity,
        comment: writeOffComment,
        date: new Date()
      };
      
      // Обновляем остаток
      setItem(prev => ({
        ...prev,
        quantity: prev.quantity - quantity
      }));

      // Сбрасываем форму
      setWriteOffQuantity('');
      setWriteOffComment('');
      setShowWriteOff(false);

      console.log('Write off transaction:', newTransaction);
      
      if (onUpdateItem) {
        onUpdateItem(itemId, { quantity: item.quantity - quantity });
      }
    }
  };

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-medium text-gray-900">{item.name}</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Item Info */}
        <div className="flex items-start space-x-4">
          <div 
            className="w-20 h-20 bg-cover bg-center rounded-lg flex-shrink-0 border border-gray-200"
            style={{ backgroundImage: `url('${item.image}')` }}
          />
          <div className="flex-1">
            <h2 className="font-medium text-gray-900 mb-2">{item.name}</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Категория: {item.category === 'flowers' ? 'Цветы' : item.category}</div>
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span className="font-medium text-gray-900">{item.quantity} {item.unit}</span>
                <span className="text-gray-500">в наличии</span>
              </div>
              <div className="text-xs text-gray-500">
                Последняя поставка: {getTimeAgo(item.lastDelivery)}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Pricing Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Ценообразование</h3>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Изменить
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Себестоимость</Label>
                  <Input 
                    value={editedCostPrice}
                    onChange={(e) => setEditedCostPrice(e.target.value)}
                    placeholder="280 ₸"
                  />
                </div>
                <div>
                  <Label>Розничная цена</Label>
                  <Input 
                    value={editedRetailPrice}
                    onChange={(e) => setEditedRetailPrice(e.target.value)}
                    placeholder="450 ₸"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Наценка: {calculateMarkup(editedCostPrice, editedRetailPrice)}%
              </div>
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSavePrices}>
                  Сохранить
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Себестоимость:</span>
                <span className="font-medium">{item.costPrice} / {item.unit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Розничная цена:</span>
                <span className="font-medium">{item.retailPrice} / {item.unit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Наценка:</span>
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  +{item.markup}%
                </Badge>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Write Off Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Списание</h3>
            {!showWriteOff && (
              <Button variant="outline" size="sm" onClick={() => setShowWriteOff(true)}>
                <Minus className="w-4 h-4 mr-2" />
                Списать
              </Button>
            )}
          </div>

          {showWriteOff && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Количество</Label>
                  <Input 
                    type="number"
                    value={writeOffQuantity}
                    onChange={(e) => setWriteOffQuantity(e.target.value)}
                    placeholder="0"
                    max={item.quantity}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Максимум: {item.quantity} {item.unit}
                  </div>
                </div>
                <div>
                  <Label>Причина</Label>
                  <Input 
                    value={writeOffComment}
                    onChange={(e) => setWriteOffComment(e.target.value)}
                    placeholder="Увяли, брак и т.д."
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleWriteOff}
                  disabled={!writeOffQuantity || !writeOffComment.trim() || parseInt(writeOffQuantity) <= 0}
                >
                  Списать
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowWriteOff(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Transaction History */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="font-medium text-gray-900">История операций</h3>
            <Badge variant="secondary" className="text-xs">
              {transactions.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getTransactionTypeColor(transaction.type)}`}
                    >
                      {getTransactionTypeLabel(transaction.type)}
                    </Badge>
                    <span className="text-sm font-medium text-red-600">
                      {transaction.quantity} {item.unit}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{transaction.comment}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{getTimeAgo(transaction.date)}</span>
                    {transaction.referenceId && (
                      <span>• Заказ #{transaction.referenceId}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Нет операций</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}