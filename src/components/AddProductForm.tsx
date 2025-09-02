import svgPaths from "../imports/svg-1qk73favch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, Camera, Upload } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { useState } from "react";

function CameraIcon() {
  return (
    <svg className="w-10 h-10" fill="none" preserveAspectRatio="none" viewBox="0 0 28 23">
      <path d={svgPaths.p19c7a800} fill="#9CA3AF" />
    </svg>
  );
}

interface AddProductFormProps {
  onClose: () => void;
}

export function AddProductForm({ onClose }: AddProductFormProps) {
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h1 className="text-gray-900">Новый товар</h1>
          <button 
            className="p-3 hover:bg-gray-100 rounded-full transition-colors touch-manipulation" 
            onClick={onClose}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm text-gray-700 mb-4">
              Фотографии товара
            </label>
            <ImageUploader 
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
          </div>



          {/* Characteristics Section */}
          <div>
            <label className="block text-sm text-gray-700 mb-4">
              Размеры букета
            </label>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input 
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Ширина, см"
                  className="h-12 text-base border-gray-200 focus:border-gray-400 focus:ring-gray-400 touch-manipulation"
                />
              </div>
              <div className="flex-1">
                <Input 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Высота, см"
                  className="h-12 text-base border-gray-200 focus:border-gray-400 focus:ring-gray-400 touch-manipulation"
                />
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div>
            <label className="block text-sm text-gray-700 mb-4">
              Стоимость товара
            </label>
            <div className="relative">
              <Input 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Введите стоимость"
                className="text-lg h-12 pr-16 text-base border-gray-200 focus:border-gray-400 focus:ring-gray-400 touch-manipulation"
              />
              <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                ₸
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-white border-t border-gray-100">
          <Button 
            className="w-full h-12 rounded-xl touch-manipulation"
            onClick={onClose}
          >
            Опубликовать товар
          </Button>
        </div>
      </div>
    </div>
  );
}