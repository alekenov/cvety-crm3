import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ArrowLeft, CheckCircle, AlertTriangle, Package, Save } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  category: 'flowers' | 'greenery' | 'accessories';
  unit: string;
  systemQuantity: number; // учетный остаток
  actualQuantity?: number; // фактический остаток
  image: string;
}

interface InventoryAuditProps {
  onClose: () => void;
  onSaveAudit?: (auditResults: InventoryAuditItem[]) => void;
}

interface InventoryAuditItem extends InventoryItem {
  actualQuantity: number;
  difference: number;
  status: 'match' | 'surplus' | 'deficit' | 'pending';
}

const mockInventoryItems: InventoryItem[] = [
  {
    id: 1,
    name: "Розы красные",
    category: 'flowers',
    unit: "шт",
    systemQuantity: 85,
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=100&h=100&fit=crop"
  },
  {
    id: 2,
    name: "Тюльпаны белые",
    category: 'flowers',
    unit: "шт",
    systemQuantity: 12,
    image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=100&h=100&fit=crop"
  },
  {
    id: 3,
    name: "Лилии розовые",
    category: 'flowers',
    unit: "шт",
    systemQuantity: 24,
    image: "https://images.unsplash.com/photo-1565011523534-747a8601f1a4?w=100&h=100&fit=crop"
  },
  {
    id: 4,
    name: "Эвкалипт",
    category: 'greenery',
    unit: "ветка",
    systemQuantity: 45,
    image: "https://images.unsplash.com/photo-1586744687037-b4f9c5d1fcd8?w=100&h=100&fit=crop"
  },
  {
    id: 5,
    name: "Хризантемы желтые",
    category: 'flowers',
    unit: "шт",
    systemQuantity: 8,
    image: "https://images.unsplash.com/photo-1572731973537-34afe46c4bc6?w=100&h=100&fit=crop"
  },
  {
    id: 6,
    name: "Лента атласная",
    category: 'accessories',
    unit: "метр",
    systemQuantity: 150,
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=100&fit=crop"
  },
  {
    id: 7,
    name: "Гипсофила",
    category: 'flowers',
    unit: "ветка",
    systemQuantity: 3,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop"
  }
];

function getCategoryName(category: string): string {
  switch (category) {
    case 'flowers': return 'Цветы';
    case 'greenery': return 'Зелень';
    case 'accessories': return 'Аксессуары';
    default: return category;
  }
}

function getStatusBadge(status: 'match' | 'surplus' | 'deficit' | 'pending') {
  switch (status) {
    case 'match':
      return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Совпадает</Badge>;
    case 'surplus':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><AlertTriangle className="w-3 h-3 mr-1" />Излишек</Badge>;
    case 'deficit':
      return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />Недостача</Badge>;
    case 'pending':
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Не проверено</Badge>;
  }
}

function AuditItemComponent({ 
  item, 
  onActualQuantityChange 
}: { 
  item: InventoryAuditItem;
  onActualQuantityChange: (id: number, quantity: number) => void;
}) {
  const handleInputChange = (value: string) => {
    const quantity = parseInt(value) || 0;
    onActualQuantityChange(item.id, quantity);
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-start space-x-4">
        {/* Image */}
        <div 
          className="w-12 h-12 bg-cover bg-center rounded-full flex-shrink-0"
          style={{ backgroundImage: `url('${item.image}')` }}
        />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{item.name}</span>
              <span className="text-sm px-2 py-1 bg-white border border-gray-300 text-gray-600 rounded-full">
                {getCategoryName(item.category)}
              </span>
            </div>
            {getStatusBadge(item.status)}
          </div>
          
          {/* Quantities comparison */}
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Учетный остаток</label>
              <div className="text-sm font-medium text-gray-900">
                {item.systemQuantity} {item.unit}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Фактический остаток</label>
              <Input
                type="number"
                value={item.actualQuantity || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="0"
                className="h-8 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Разница</label>
              <div className={`text-sm font-medium ${
                item.difference > 0 ? 'text-blue-600' : 
                item.difference < 0 ? 'text-red-600' : 
                'text-green-600'
              }`}>
                {item.difference > 0 ? '+' : ''}{item.difference !== 0 ? item.difference : '0'} {item.unit}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InventoryAudit({ onClose, onSaveAudit }: InventoryAuditProps) {
  const [auditItems, setAuditItems] = useState<InventoryAuditItem[]>(
    mockInventoryItems.map(item => ({
      ...item,
      actualQuantity: 0,
      difference: 0,
      status: 'pending' as const
    }))
  );

  const handleActualQuantityChange = (id: number, actualQuantity: number) => {
    setAuditItems(prev => prev.map(item => {
      if (item.id === id) {
        const difference = actualQuantity - item.systemQuantity;
        let status: 'match' | 'surplus' | 'deficit' | 'pending' = 'pending';
        
        if (actualQuantity === 0) {
          status = 'pending';
        } else if (difference === 0) {
          status = 'match';
        } else if (difference > 0) {
          status = 'surplus';
        } else {
          status = 'deficit';
        }
        
        return {
          ...item,
          actualQuantity,
          difference,
          status
        };
      }
      return item;
    }));
  };

  const handleSave = () => {
    const completedItems = auditItems.filter(item => item.status !== 'pending');
    if (onSaveAudit) {
      onSaveAudit(completedItems);
    }
    console.log('Audit results:', completedItems);
    onClose();
  };

  const stats = {
    total: auditItems.length,
    checked: auditItems.filter(item => item.status !== 'pending').length,
    matches: auditItems.filter(item => item.status === 'match').length,
    discrepancies: auditItems.filter(item => item.status === 'surplus' || item.status === 'deficit').length
  };

  const progress = Math.round((stats.checked / stats.total) * 100);

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-medium text-gray-900">Инвентаризация</h1>
        </div>
        <Button 
          onClick={handleSave}
          disabled={stats.checked === 0}
          className="bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          <Save className="w-4 h-4 mr-2" />
          Сохранить
        </Button>
      </div>

      {/* Stats */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-gray-600" />
            <span className="text-gray-600">Проверено:</span>
            <span className="font-medium text-gray-900">{stats.checked}/{stats.total}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">{stats.matches} совпадений</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">{stats.discrepancies} расхождений</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Прогресс</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border-b border-gray-100">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-xs font-bold">i</span>
          </div>
          <div>
            <p className="text-sm text-blue-800 font-medium">Как проводить инвентаризацию:</p>
            <p className="text-sm text-blue-700 mt-1">
              Пересчитайте фактическое количество каждого товара и введите данные в поле "Фактический остаток"
            </p>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="pb-20">
        {auditItems.map((item) => (
          <AuditItemComponent
            key={item.id}
            item={item}
            onActualQuantityChange={handleActualQuantityChange}
          />
        ))}
      </div>

      {/* Summary */}
      {stats.checked === stats.total && stats.checked > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Инвентаризация завершена!</span>
            </div>
            <p className="text-sm text-gray-600">
              {stats.matches} товаров сходятся, {stats.discrepancies} требуют корректировки
            </p>
          </div>
        </div>
      )}
    </div>
  );
}