import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductDetail } from "../components/ProductDetail";
import { fetchProductDetail, type ProductDTO, updateProductStatus } from "../api/products";
import { Product } from "../src/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetchProductDetail(parseInt(id));
        
        if (response.success && response.data) {
          // Transform ProductDTO to Product
          const transformedProduct: Product = {
            id: response.data.id,
            image: response.data.image,
            images: response.data.images,
            title: response.data.title,
            price: response.data.price || "Цена не указана",
            isAvailable: response.data.isAvailable,
            createdAt: response.data.createdAt ? new Date(response.data.createdAt) : new Date(),
            type: response.data.type,
            width: response.data.width || "",
            height: response.data.height || "",
            video: response.data.video,
            duration: response.data.duration,
            discount: response.data.discount,
            composition: response.data.composition,
            colors: response.data.colors,
            catalogWidth: response.data.catalogWidth,
            catalogHeight: response.data.catalogHeight,
            productionTime: response.data.productionTime
          };
          
          setProduct(transformedProduct);
        } else {
          setError('Товар не найден');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Ошибка при загрузке товара');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleBack = () => {
    navigate('/products');
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProduct(updatedProduct);
    // TODO: Call API to update product
    console.log('Update product:', updatedProduct);
  };

  const handleEdit = (productId: number) => {
    // TODO: Navigate to edit page
    console.log('Edit product:', productId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Товар не найден'}</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Вернуться к списку товаров
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProductDetail 
      productId={product.id}
      products={[product]} // Передаем массив с одним продуктом
      onClose={handleBack}
      onUpdateProduct={handleUpdateProduct}
      onEditProduct={handleEdit}
    />
  );
}