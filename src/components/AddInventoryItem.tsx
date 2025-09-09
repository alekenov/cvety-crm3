import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useAppContext } from "../src/contexts/AppContext";
import { searchInventoryItems, createInventorySupply } from "../api/inventory";
import type { InventoryItem } from "../src/types";

interface SupplyItem {
  id: string;
  name: string;
  quantity: string;
  price: string;
  suggestions: InventoryItem[];
  showSuggestions: boolean;
  existingItem?: InventoryItem;
}

interface AddInventoryItemProps {
  onClose: () => void;
  onProcessSupply?: (items: SupplyItem[]) => void;
}


export function AddInventoryItem({ onClose, onProcessSupply }: AddInventoryItemProps) {
  const { loadInventoryItems } = useAppContext();
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([
    {
      id: '1',
      name: '',
      quantity: '',
      price: '',
      suggestions: [],
      showSuggestions: false
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Поиск подсказок при вводе названия с использованием API
  const searchSuggestions = useCallback(async (query: string): Promise<InventoryItem[]> => {
    if (query.trim().length <= 1) return [];
    try {
      const results = await searchInventoryItems(query, 5);
      return results;
    } catch (error) {
      console.error('Error searching inventory:', error);
      return [];
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (id: string, query: string) => {
      if (query.trim().length > 1) {
        const suggestions = await searchSuggestions(query);
        setSupplyItems(prev => prev.map(item => {
          if (item.id !== id) return item;
          // Only update if the name hasn't changed since we started the search
          if (item.name === query) {
            return {
              ...item,
              suggestions,
              showSuggestions: suggestions.length > 0
            };
          }
          return item;
        }));
      }
    }, 300),
    [searchSuggestions]
  );

  const handleNameChange = (id: string, value: string) => {
    // Immediately update the input value
    setSupplyItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        name: value,
        suggestions: [],
        showSuggestions: false,
        // Сбрасываем existingItem если изменили название
        existingItem: item.existingItem && value !== item.existingItem.name ? undefined : item.existingItem
      };
    }));

    // Then search for suggestions with debounce
    debouncedSearch(id, value);
  };

  // Simple debounce implementation
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const handleSelectSuggestion = (itemId: string, suggestion: InventoryItem) => {
    setSupplyItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      return {
        ...item,
        name: suggestion.name,
        price: suggestion.cost.toString(),
        suggestions: [],
        showSuggestions: false,
        existingItem: suggestion
      };
    }));
  };

  const updateField = (id: string, field: keyof SupplyItem, value: string) => {
    setSupplyItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: string) => {
    if (supplyItems.length === 1) return; // Не удаляем последнюю строку
    setSupplyItems(prev => prev.filter(item => item.id !== id));
  };

  const addNewRow = () => {
    const newId = Date.now().toString();
    setSupplyItems(prev => [...prev, {
      id: newId,
      name: '',
      quantity: '',
      price: '',
      suggestions: [],
      showSuggestions: false
    }]);
  };

  // Автоматически добавляем новую строку если текущая заполнена
  useEffect(() => {
    const lastItem = supplyItems[supplyItems.length - 1];
    if (lastItem && lastItem.name && lastItem.quantity && lastItem.price) {
      addNewRow();
    }
  }, [supplyItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Фильтруем только заполненные строки
    const validItems = supplyItems.filter(item => 
      item.name.trim() && item.quantity.trim() && item.price.trim()
    );

    if (validItems.length === 0) return;

    setIsSubmitting(true);

    try {
      // Обработка поставки
      const payload = validItems.map(item => ({
        name: item.name.trim(),
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        existingItemId: item.existingItem?.id as any
      }));

      await createInventorySupply(payload);
      onProcessSupply?.(validItems);

      // Логирование для демонстрации
      validItems.forEach(item => {
        console.log('Добавлена новая серия товара:', {
          name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          supplyDate: new Date().toISOString(),
          wasFromSuggestion: !!item.existingItem
        });
      });

      // Reload inventory data to show new items
      await loadInventoryItems({ offset: 0 });

      // Закрытие через небольшую задержку
      setTimeout(() => {
        onClose();
      }, 100);

    } catch (error) {
      console.error('Ошибка при обработке поставки:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasValidItems = supplyItems.some(item => 
    item.name.trim() && item.quantity.trim() && item.price.trim()
  );

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-medium text-gray-900">Принять поставку</h1>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 border-b border-gray-100">
        <p className="text-sm text-blue-800 font-medium">
          Создание новой серии товаров
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Каждая поставка создает новую серию с датой поступления
        </p>
      </div>

      {/* Supply List */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-3">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-2 px-2 pb-2 border-b border-gray-200">
            <div className="col-span-5">
              <Label className="text-xs font-medium text-gray-600 uppercase">Товар</Label>
            </div>
            <div className="col-span-3">
              <Label className="text-xs font-medium text-gray-600 uppercase">Кол-во</Label>
            </div>
            <div className="col-span-3">
              <Label className="text-xs font-medium text-gray-600 uppercase">Цена ₸</Label>
            </div>
            <div className="col-span-1"></div>
          </div>

          {/* Supply Items */}
          {supplyItems.map((item) => (
            <div key={item.id} className="relative">
              <div className="grid grid-cols-12 gap-2 items-start">
                {/* Name with Suggestions */}
                <div className="col-span-5 relative">
                  <Input
                    value={item.name}
                    onChange={(e) => handleNameChange(item.id, e.target.value)}
                    placeholder="Название..."
                    className="bg-input-background text-sm"
                    autoComplete="off"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {item.showSuggestions && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {item.suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(item.id, suggestion)}
                          className="w-full p-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-5 h-5 bg-cover bg-center rounded-full flex-shrink-0"
                              style={{ backgroundImage: `url('${suggestion.image || "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=100&h=100&fit=crop"}')` }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {suggestion.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {suggestion.cost} ₸ • остаток: {suggestion.quantity} {suggestion.unit}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateField(item.id, 'quantity', e.target.value)}
                    placeholder="0"
                    className="bg-input-background text-sm"
                    min="1"
                  />
                </div>

                {/* Price */}
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateField(item.id, 'price', e.target.value)}
                    placeholder="0"
                    className="bg-input-background text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Delete Button */}
                <div className="col-span-1 flex justify-center">
                  {supplyItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="p-1 h-8 w-8 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>


            </div>
          ))}


        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 py-3"
            disabled={!hasValidItems || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Обрабатываем поставку...
              </>
            ) : (
              'Принять поставку'
            )}
          </Button>

          {hasValidItems && (
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500">
                {supplyItems.filter(item => item.name.trim() && item.quantity.trim() && item.price.trim()).length} товаров к поставке
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
