import svgPaths from "../imports/svg-v3feqeu9gq";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  X,
  Camera,
  Video,
  ChevronDown,
  Plus,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ImageUploader } from "./ImageUploader";
import { FlowerNameInput } from "./FlowerNameInput";
// Temporary inline ColorPicker to avoid import issues
function ColorPicker({ colors, selectedColors, onChange, multiple = false }: {
  colors: Array<{ id: string; name: string; color: string }>;
  selectedColors: string[];
  onChange: (colors: string[]) => void;
  multiple?: boolean;
}) {
  const handleColorToggle = (colorId: string) => {
    if (multiple) {
      if (selectedColors.includes(colorId)) {
        onChange(selectedColors.filter(id => id !== colorId));
      } else {
        onChange([...selectedColors, colorId]);
      }
    } else {
      onChange([colorId]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.id}
          type="button"
          onClick={() => handleColorToggle(color.id)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            selectedColors.includes(color.id)
              ? 'border-gray-800 scale-110'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          style={{
            background: color.id === 'mix' ? color.color : color.color,
            ...(color.id === 'white' && { borderColor: '#d1d5db' })
          }}
          title={color.name}
        />
      ))}
    </div>
  );
}

interface Product {
  id: number;
  image: string; // главное изображение для обратной совместимости
  images?: string[]; // массив всех изображений
  title: string;
  price: string;
  isAvailable: boolean;
  createdAt: Date;
  type: "vitrina" | "catalog";
  // Витрина поля
  width?: string;
  height?: string;
  // Каталог поля
  video?: string;
  duration?: string;
  discount?: string;
  composition?: Array<{ name: string; count: string }>;
  colors?: string[];
  catalogWidth?: string;
  catalogHeight?: string;
  productionTime?: string;
}

interface EditCatalogFormProps {
  productId: number | null;
  products: Product[];
  onClose: () => void;
  onUpdateProduct: (product: Product) => void;
}

function CameraIcon() {
  return (
    <svg
      className="w-10 h-10"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 28 23"
    >
      <path d={svgPaths.p19c7a800} fill="#C8C0D3" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      className="w-8 h-8"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 28 23"
    >
      <g>
        <path d={svgPaths.p3b7dbb00} fill="#C8C0D3" />
        <path d={svgPaths.p22574980} fill="#C8C0D3" />
      </g>
    </svg>
  );
}

const bouquetColors = [
  { id: "pink", name: "Розовый", color: "#ec4899" },
  { id: "blue", name: "Синий", color: "#3b82f6" },
  { id: "red", name: "Красный", color: "#ef4444" },
  { id: "yellow", name: "Желтый", color: "#f59e0b" },
  { id: "green", name: "Зеленый", color: "#10b981" },
  { id: "purple", name: "Фиолетовый", color: "#8b5cf6" },
  { id: "white", name: "Белый", color: "#ffffff" },
  {
    id: "mix",
    name: "Микс",
    color:
      "linear-gradient(45deg, #ec4899 0%, #3b82f6 25%, #f59e0b 50%, #10b981 75%, #8b5cf6 100%)",
  },
];



export function EditCatalogForm({
  productId,
  products,
  onClose,
  onUpdateProduct,
}: EditCatalogFormProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [showCharacteristics, setShowCharacteristics] =
    useState(true);
  const [selectedColors, setSelectedColors] = useState<
    string[]
  >([]);
  const [selectedDuration, setSelectedDuration] =
    useState<string>("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [discount, setDiscount] = useState("");
  const [composition, setComposition] = useState<
    Array<{ name: string; count: string }>
  >([]);
  const [catalogWidth, setCatalogWidth] = useState("");
  const [catalogHeight, setCatalogHeight] = useState("");
  const [newFlowerName, setNewFlowerName] = useState("");
  const [newFlowerCount, setNewFlowerCount] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (productId) {
      const foundProduct = products.find(
        (p) => p.id === productId,
      );
      if (foundProduct) {
        setProduct(foundProduct);
        setTitle(foundProduct.title);
        setPrice(foundProduct.price.replace(" ₸", ""));
        setDuration(foundProduct.duration || "");
        setDiscount(foundProduct.discount || "");
        setComposition(foundProduct.composition || []);
        setSelectedColors(foundProduct.colors || []);
        setCatalogWidth(foundProduct.catalogWidth || "");
        setCatalogHeight(foundProduct.catalogHeight || "");
        setSelectedDuration(foundProduct.productionTime || "");
        setImages(foundProduct.images || [foundProduct.image]);
      }
    }
  }, [productId, products]);

  if (!product) {
    return null;
  }

  const handleColorChange = (colors: string[]) => {
    setSelectedColors(colors);
  };

  const handleAddFlower = () => {
    if (newFlowerName.trim() && newFlowerCount.trim()) {
      setComposition((prev) => [
        ...prev,
        {
          name: newFlowerName.trim(),
          count: newFlowerCount.trim(),
        },
      ]);
      setNewFlowerName("");
      setNewFlowerCount("");
    }
  };

  const handleRemoveFlower = (index: number) => {
    setComposition((prev) =>
      prev.filter((_, i) => i !== index),
    );
  };

  const handleSave = () => {
    if (product) {
      const updatedProduct: Product = {
        ...product,
        title,
        price: `${price} ₸`,
        duration,
        discount,
        composition,
        colors: selectedColors,
        catalogWidth,
        catalogHeight,
        productionTime: selectedDuration,
        images: images,
        image: images[0] || product.image, // обновляем главное изображение
      };
      onUpdateProduct(updatedProduct);
      onClose();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h1 className="text-gray-900">
            Редактировать товар
          </h1>
          <button
            className="p-3 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
            onClick={onClose}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Media Section */}
          <div className="p-6 pb-4">
            <div className="space-y-4">
              <ImageUploader 
                images={images}
                onImagesChange={setImages}
                maxImages={8}
              />
              <div className="bg-gray-50 rounded-lg h-16 flex items-center px-4 hover:bg-gray-100 transition-colors cursor-pointer touch-manipulation">
                <VideoIcon />
                <p className="text-gray-900 text-base ml-4">
                  Добавьте видео
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="px-6 space-y-6">
            {/* Название товара */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название товара"
                className="border-0 border-b border-gray-200 rounded-none px-0 pb-3 h-12 text-base placeholder:text-gray-500 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 touch-manipulation"
              />
            </div>

            {/* Стоимость и скидка */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Стоимость, ₸"
                    className="border-0 border-b border-gray-200 rounded-none px-0 pb-3 h-12 text-base placeholder:text-gray-500 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 touch-manipulation"
                  />
                </div>
                <div className="w-32">
                  <div className="flex items-end space-x-2">
                    <Input
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="Скидка, %"
                      className="border-0 border-b border-gray-200 rounded-none px-0 pb-3 h-12 text-base placeholder:text-gray-500 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 touch-manipulation"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Время изготовления */}
            <div>
              <div className="flex items-end space-x-3">
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Время изготовления"
                  className="border-0 border-b border-gray-200 rounded-none px-0 pb-3 h-12 text-base placeholder:text-gray-500 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 touch-manipulation"
                />
                <span className="text-gray-900 text-base pb-3 min-w-[40px]">
                  мин
                </span>
              </div>
            </div>
          </div>

          {/* Bouquet Composition */}
          <div className="px-6">
            <h3 className="text-gray-900 mb-4">
              Состав букета
            </h3>

            {/* Existing composition */}
            {composition.length > 0 && (
              <div className="space-y-3 mb-4">
                {composition.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="text-gray-900">
                        {item.name}
                      </span>
                      <span className="text-gray-500 ml-2">
                        — {item.count} шт
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFlower(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <FlowerNameInput
                  value={newFlowerName}
                  onChange={setNewFlowerName}
                  placeholder="Название цветка"
                  className="border-0 border-b border-gray-200 rounded-none px-0 pb-3 h-12 text-base placeholder:text-gray-500 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-full touch-manipulation"
                  existingFlowers={composition.map(item => item.name)}
                />
              </div>
              <div className="w-20">
                <Input
                  value={newFlowerCount}
                  onChange={(e) =>
                    setNewFlowerCount(e.target.value)
                  }
                  placeholder="Кол-во"
                  className="border-0 border-b border-gray-200 rounded-none px-0 pb-3 h-12 text-base placeholder:text-gray-500 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-full touch-manipulation"
                />
              </div>
            </div>
            <Button
              onClick={handleAddFlower}
              variant="outline"
              className="w-full h-12 text-gray-900 border-gray-200 text-base touch-manipulation"
            >
              <Plus className="w-5 h-5 mr-2" />
              Добавить цветок
            </Button>
          </div>

          {/* Characteristics */}
          <div className="px-6">
            <button
              onClick={() =>
                setShowCharacteristics(!showCharacteristics)
              }
              className="flex items-center justify-between w-full py-3 touch-manipulation"
            >
              <h3 className="text-gray-900">
                Характеристики
              </h3>
              {showCharacteristics ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showCharacteristics && (
              <div className="space-y-5 mt-4">
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">Цвета букета</p>
                  <ColorPicker
                    colors={bouquetColors}
                    selectedColors={selectedColors}
                    onChange={handleColorChange}
                    multiple={true}
                  />
                </div>

                <div className="flex space-x-4">
                  <Input
                    value={catalogWidth}
                    onChange={(e) =>
                      setCatalogWidth(e.target.value)
                    }
                    placeholder="Ширина, см"
                    className="border-0 border-b border-gray-200 rounded-none px-0 pb-3 h-12 text-base placeholder:text-gray-500 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 touch-manipulation"
                  />
                  <Input
                    value={catalogHeight}
                    onChange={(e) =>
                      setCatalogHeight(e.target.value)
                    }
                    placeholder="Высота, см"
                    className="border-0 border-b border-gray-200 rounded-none px-0 pb-3 h-12 text-base placeholder:text-gray-500 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 touch-manipulation"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    стойкость
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: "short", label: "До 7 дней" },
                      { id: "medium", label: "От 5 до 10" },
                      {
                        id: "long",
                        label: "От 10 дней и более",
                      },
                    ].map((durationOption) => (
                      <button
                        key={durationOption.id}
                        onClick={() =>
                          setSelectedDuration(durationOption.id)
                        }
                        className={`px-4 py-2.5 rounded text-sm transition-all duration-200 touch-manipulation min-h-[44px] ${
                          selectedDuration === durationOption.id
                            ? "bg-gray-800 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {durationOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-6 pt-8">
            <Button
              onClick={handleSave}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white h-12 rounded-xl touch-manipulation"
            >
              Сохранить изменения
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}