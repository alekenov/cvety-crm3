import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchProductDetail, toggleProductActive } from './api/products';
import type { ProductDTO } from './api/products';

export default function TestProductsAPI() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);

  const loadProducts = async (type?: 'vitrina' | 'catalog') => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProducts({ type, limit: 5 });
      if (result.success) {
        setProducts(result.data);
      } else {
        setError('Не удалось загрузить товары');
      }
    } catch (err) {
      setError(`Ошибка API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadProductDetail = async (id: number) => {
    try {
      const result = await fetchProductDetail(id);
      if (result.success) {
        setSelectedProduct(result.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки деталей:', err);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleProductActive(id, !currentStatus);
      // Перезагружаем список после изменения
      loadProducts();
    } catch (err) {
      console.error('Ошибка изменения статуса:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Тест API /v2/products</h1>
      
      {/* Кнопки фильтрации */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => loadProducts()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Все товары
        </button>
        <button 
          onClick={() => loadProducts('vitrina')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Витрина
        </button>
        <button 
          onClick={() => loadProducts('catalog')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Каталог
        </button>
      </div>

      {/* Состояние загрузки */}
      {loading && <div className="text-blue-600">Загрузка...</div>}
      
      {/* Ошибки */}
      {error && <div className="text-red-600 mb-4">❌ {error}</div>}

      {/* Список товаров */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Список товаров ({products.length})</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{product.title}</h3>
                    <p className="text-sm text-gray-600">{product.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        product.type === 'vitrina' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {product.type}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        product.isAvailable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isAvailable ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => loadProductDetail(product.id)}
                        className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Детали
                      </button>
                      <button
                        onClick={() => toggleStatus(product.id, product.isAvailable)}
                        className="text-xs px-2 py-1 bg-orange-200 rounded hover:bg-orange-300"
                      >
                        {product.isAvailable ? 'Деактивировать' : 'Активировать'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Детали товара */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Детали товара</h2>
          {selectedProduct ? (
            <div className="border rounded-lg p-4">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h3 className="font-bold text-lg mb-2">{selectedProduct.title}</h3>
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {selectedProduct.id}</p>
                <p><strong>Цена:</strong> {selectedProduct.price || 'Не указана'}</p>
                <p><strong>Тип:</strong> {selectedProduct.type}</p>
                <p><strong>Статус:</strong> {selectedProduct.isAvailable ? 'Активен' : 'Неактивен'}</p>
                <p><strong>Создан:</strong> {selectedProduct.createdAt}</p>
                {selectedProduct.catalogWidth && (
                  <p><strong>Ширина:</strong> {selectedProduct.catalogWidth}</p>
                )}
                {selectedProduct.catalogHeight && (
                  <p><strong>Высота:</strong> {selectedProduct.catalogHeight}</p>
                )}
                {selectedProduct.discount && (
                  <p><strong>Скидка:</strong> {selectedProduct.discount}%</p>
                )}
                <p><strong>Изображений:</strong> {selectedProduct.images?.length || 0}</p>
              </div>
              
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Все изображения:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`${selectedProduct.title} ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Выберите товар для просмотра деталей</div>
          )}
        </div>
      </div>
    </div>
  );
}