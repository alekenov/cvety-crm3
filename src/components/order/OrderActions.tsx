// Order Actions Component
// Extracted from OrderDetail.tsx for better organization

import { Check, X } from "lucide-react";
import { Button } from "../ui/button";

interface OrderActionsProps {
  isEditing: boolean;
  onStatusUpdate: (status: string) => void;
  onEditToggle: () => void;
  onCancelEdit: () => void;
  onDelete?: () => void;
}

export function OrderActions({
  isEditing,
  onStatusUpdate,
  onEditToggle,
  onCancelEdit,
  onDelete
}: OrderActionsProps) {
  return (
    <div className="py-6 space-y-3">
      {!isEditing && (
        <Button 
          onClick={() => onStatusUpdate('Оплачен')}
          className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white"
        >
          Оплачен
        </Button>
      )}
      
      {isEditing ? (
        <div className="flex gap-3">
          <Button 
            onClick={onEditToggle}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Сохранить
          </Button>
          <Button 
            variant="outline"
            onClick={onCancelEdit}
            className="flex-1 h-12 border-gray-300 text-gray-900 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Отмена
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline"
          onClick={onEditToggle}
          className="w-full h-12 border-gray-200 text-gray-900 tracking-wide"
        >
          Редактировать
        </Button>
      )}
      
      {!isEditing && onDelete && (
        <Button 
          variant="destructive"
          onClick={onDelete}
          className="w-full h-12 bg-red-600 hover:bg-red-700 text-white tracking-wide"
        >
          УДАЛИТЬ
        </Button>
      )}
    </div>
  );
}