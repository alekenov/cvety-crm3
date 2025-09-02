import { useState, useEffect } from 'react';
import { Product, Customer, Order, Screen } from '../types';
import { fetchProducts as fetchProductsAPI } from '../../api/products';
import type { ProductDTO } from '../../api/products';

// Sample data imports (fallback)
import imgRectangle from "figma:asset/d1e4a43dfd35275968d7a4b44aa8a93a79982faa.png";
import imgRectangle1 from "figma:asset/438350a0f5172f1ab210cb733df6869e0b9f8ef5.png";

export function useAppState() {
  // Screen navigation state with history tracking
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>(['main']);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'inventory' | 'customers' | 'profile'>('orders');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Enhanced setCurrentScreen that tracks navigation history
  const navigateToScreen = (screen: Screen) => {
    setNavigationHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  // Function to go back to previous screen
  const navigateBack = () => {
    setNavigationHistory(prev => {
      if (prev.length > 1) {
        const newHistory = prev.slice(0, -1);
        const previousScreen = newHistory[newHistory.length - 1];
        setCurrentScreen(previousScreen);
        return newHistory;
      } else {
        // Fallback to main if no history
        setCurrentScreen('main');
        return ['main'];
      }
    });
  };

  // Business data state
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: "Анна Петрова",
      phone: "+7 (777) 123-45-67",
      memberSince: new Date(2023, 2, 15),
      totalOrders: 12,
      totalSpent: 156000,
      lastOrderDate: new Date(2024, 7, 20),
      status: 'vip',
      notes: "VIP клиент. Предпочитает розы и классические букеты. Часто заказывает на праздники."
    },
    {
      id: 2,
      name: "Мария Козлова",
      phone: "+7 (777) 234-56-78",
      memberSince: new Date(2023, 5, 8),
      totalOrders: 7,
      totalSpent: 84500,
      lastOrderDate: new Date(2024, 7, 18),
      status: 'active'
    },
    {
      id: 3,
      name: "Елена Сидорова",
      phone: "+7 (777) 345-67-89",
      memberSince: new Date(2022, 11, 3),
      totalOrders: 25,
      totalSpent: 320000,
      lastOrderDate: new Date(2024, 7, 25),
      status: 'vip',
      notes: "Постоянный клиент офиса. Заказывает цветы для коллектива каждый месяц."
    }
  ]);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Convert ProductDTO to Product type
  const convertDTOToProduct = (dto: ProductDTO): Product => {
    return {
      id: dto.id,
      image: dto.image,
      images: dto.images,
      title: dto.title,
      price: dto.price,
      isAvailable: dto.isAvailable,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      type: dto.type,
      width: dto.width || '',
      height: dto.height || '',
      video: dto.video || undefined,
      duration: dto.duration || undefined,
      discount: dto.discount || undefined,
      catalogWidth: dto.catalogWidth || undefined,
      catalogHeight: dto.catalogHeight || undefined,
      productionTime: dto.productionTime as 'short' | 'medium' | 'long' | undefined,
      colors: dto.colors || undefined,
      // Convert composition if needed
      composition: dto.composition || undefined,
      ingredients: undefined, // Will be fetched separately if needed
      floristWorkCost: undefined
    };
  };

  // Load products from API on mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const result = await fetchProductsAPI({ limit: 100 });
        if (result.success && result.data) {
          const convertedProducts = result.data.map(convertDTOToProduct);
          setProducts(convertedProducts);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to empty array if API fails
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    loadProducts();
  }, []);

  const [orders, setOrders] = useState<Order[]>([]);

  // Initialize orders after products and customers are loaded
  useEffect(() => {
    if (products.length > 0 && customers.length > 0 && orders.length === 0) {
      const initialOrders: Order[] = [
        {
          id: 'ord_1',
          number: '40415',
          status: 'new',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          mainProduct: products[0],
          recipient: customers[0],
          sender: customers[1],
          deliveryType: 'delivery',
          deliveryCity: 'Алматы',
          deliveryDate: 'today',
          anonymous: false,
          payment: {
            amount: 12000,
            status: 'unpaid'
          }
        },
        {
          id: 'ord_2',
          number: '40416',
          status: 'assembled',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          mainProduct: products[1],
          recipient: customers[2],
          sender: customers[0],
          deliveryType: 'pickup',
          deliveryCity: 'Алматы',
          deliveryDate: 'tomorrow',
          deliveryTime: '10:00',
          postcard: 'С днем рождения!',
          anonymous: false,
          payment: {
            amount: 8500,
            status: 'paid',
            method: 'card'
          },
          executor: {
            florist: 'Анна Иванова'
          },
          additionalItems: [
            {
              productId: 3,
              productTitle: 'Композиция',
              productImage: products[2]?.image || '',
              quantity: 1,
              unitPrice: 15000,
              totalPrice: 15000
            }
          ]
        }
      ];
      setOrders(initialOrders);
    }
  }, [products, customers, orders.length]);

  return {
    // State
    currentScreen,
    navigationHistory,
    activeTab,
    selectedProductId,
    selectedOrderId,
    selectedInventoryItemId,
    selectedCustomerId,
    customers,
    products,
    orders,
    isLoadingProducts,
    
    // Enhanced Navigation
    navigateToScreen,
    navigateBack,
    
    // Tab management
    setActiveTab,
    
    // Legacy setters (kept for compatibility)
    setCurrentScreen,
    setSelectedProductId,
    setSelectedOrderId,
    setSelectedInventoryItemId,
    setSelectedCustomerId,
    setCustomers,
    setProducts,
    setOrders
  };
}