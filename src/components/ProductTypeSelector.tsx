import { Button } from "./ui/button";
import { X, Store, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductTypeSelectorProps {
  onClose?: () => void;
  onSelectVitrina?: () => void;
  onSelectCatalog?: () => void;
}

export default function ProductTypeSelector({ onClose, onSelectVitrina, onSelectCatalog }: ProductTypeSelectorProps = {}) {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/products');
    }
  };

  const handleSelectVitrina = () => {
    if (onSelectVitrina) {
      onSelectVitrina();
    } else {
      navigate('/products/add/vitrina');
    }
  };

  const handleSelectCatalog = () => {
    if (onSelectCatalog) {
      onSelectCatalog();
    } else {
      navigate('/products/add/catalog');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h1 className="text-gray-900">Выберите тип товара</h1>
          <button 
            className="p-2 hover:bg-gray-100 rounded" 
            onClick={handleClose}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Vitrina Option */}
          <button
            onClick={handleSelectVitrina}
            className="w-full p-4 bg-white border border-gray-200 rounded hover:border-gray-300 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">Витрина</h3>
                <p className="text-gray-600 text-sm">
                  Готовый товар с фотографией и ценой
                </p>
              </div>
            </div>
          </button>

          {/* Catalog Option */}
          <button
            onClick={handleSelectCatalog}
            className="w-full p-4 bg-white border border-gray-200 rounded hover:border-gray-300 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">Каталог</h3>
                <p className="text-gray-600 text-sm">
                  Подробное описание с характеристиками
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Export named for backwards compatibility
export { ProductTypeSelector };