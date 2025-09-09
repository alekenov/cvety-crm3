import { useState, useEffect } from 'react';
import { Product, Customer, Order, Screen } from '../types';
import { urlManager, AppURLParams } from '../utils/url';

// Sample data imports
import imgRectangle from "figma:asset/d1e4a43dfd35275968d7a4b44aa8a93a79982faa.png";
import imgRectangle1 from "figma:asset/438350a0f5172f1ab210cb733df6869e0b9f8ef5.png";

export function useAppState() {
  // Initialize state from URL parameters
  const urlParams = urlManager.getParams();
  
  // Screen navigation state with history tracking
  const [currentScreen, setCurrentScreen] = useState<Screen>(
    (urlParams.screen as Screen) || 'main'
  );
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>([
    (urlParams.screen as Screen) || 'main'
  ]);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'inventory' | 'customers' | 'profile'>(
    (urlParams.tab as any) || 'orders'
  );
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    urlParams.productId ? parseInt(urlParams.productId) : null
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    urlParams.orderId || null
  );
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<number | null>(
    urlParams.inventoryItemId ? parseInt(urlParams.inventoryItemId) : null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    urlParams.customerId ? parseInt(urlParams.customerId) : null
  );

  // Enhanced setCurrentScreen that tracks navigation history and updates URL
  const navigateToScreen = (screen: Screen, params?: Partial<AppURLParams>) => {
    setNavigationHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
    urlManager.navigateToScreen(screen, params);
  };

  // Function to go back to previous screen
  const navigateBack = () => {
    setNavigationHistory(prev => {
      if (prev.length > 1) {
        const newHistory = prev.slice(0, -1);
        const previousScreen = newHistory[newHistory.length - 1];
        setCurrentScreen(previousScreen);
        urlManager.navigateBack();
        return newHistory;
      } else {
        // Fallback to main if no history
        setCurrentScreen('main');
        urlManager.navigateBack();
        return ['main'];
      }
    });
  };

  // Enhanced tab setter that updates URL - disabled URL manager for main tabs since we use React Router
  const setActiveTabWithURL = (tab: 'orders' | 'products' | 'inventory' | 'customers' | 'profile') => {
    setActiveTab(tab);
    // NOTE: urlManager.setActiveTab(tab) disabled - React Router handles main tab navigation
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

  const [products, setProducts] = useState<Product[]>([
    { 
      id: 1, 
      image: imgRectangle, 
      title: "Букет роз", 
      price: "12 000 ₸", 
      isAvailable: true, 
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'vitrina',
      width: '25',
      height: '35'
    },
    { 
      id: 2, 
      image: imgRectangle1, 
      images: [imgRectangle1, imgRectangle, imgRectangle1],
      title: "Букет тюльпанов", 
      price: "8 500 ₸", 
      isAvailable: true, 
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: 'catalog',
      catalogWidth: '30',
      catalogHeight: '40',
      duration: '45',
      discount: '15',
      ingredients: [
        { inventoryItemId: 1, name: 'Тюльпаны', quantity: 21, unit: 'шт', costPerUnit: 150 },
        { inventoryItemId: 2, name: 'Зелень', quantity: 3, unit: 'ветка', costPerUnit: 50 }
      ],
      floristWorkCost: 2000,
      colors: ['pink', 'white'],
      productionTime: 'short',
      composition: [
        { name: 'Тюльпаны', count: '21' },
        { name: 'Зелень', count: '3' }
      ]
    },
    { 
      id: 3, 
      image: imgRectangle, 
      title: "Композиция", 
      price: "15 000 ₸", 
      isAvailable: true, 
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: 'catalog',
      catalogWidth: '20',
      catalogHeight: '25',
      duration: '30',
      ingredients: [
        { inventoryItemId: 3, name: 'Розы', quantity: 7, unit: 'шт', costPerUnit: 200 },
        { inventoryItemId: 4, name: 'Хризантемы', quantity: 5, unit: 'шт', costPerUnit: 120 }
      ],
      floristWorkCost: 1500,
      colors: ['red', 'yellow'],
      productionTime: 'medium',
      composition: [
        { name: 'Розы', count: '7' },
        { name: 'Хризантемы', count: '5' }
      ]
    },
    { 
      id: 4, 
      image: imgRectangle1, 
      title: "Свадебный букет", 
      price: "25 000 ₸", 
      isAvailable: true, 
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      type: 'vitrina',
      width: '35',
      height: '45'
    },
    { 
      id: 5, 
      image: imgRectangle, 
      title: "Букет лилий", 
      price: "10 000 ₸", 
      isAvailable: false, 
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: 'vitrina',
      width: '28',
      height: '38'
    },
    { 
      id: 6, 
      image: imgRectangle1, 
      images: [imgRectangle1, imgRectangle, imgRectangle1, imgRectangle],
      title: "Корзина цветов", 
      price: "18 000 ₸", 
      isAvailable: false, 
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      type: 'catalog',
      catalogWidth: '35',
      catalogHeight: '30',
      duration: '60',
      ingredients: [
        { inventoryItemId: 3, name: 'Розы', quantity: 15, unit: 'шт', costPerUnit: 200 },
        { inventoryItemId: 5, name: 'Лилии', quantity: 5, unit: 'шт', costPerUnit: 250 },
        { inventoryItemId: 2, name: 'Зелень', quantity: 8, unit: 'ветка', costPerUnit: 50 }
      ],
      floristWorkCost: 3000,
      colors: ['mix'],
      productionTime: 'long',
      composition: [
        { name: 'Розы', count: '15' },
        { name: 'Лилии', count: '5' },
        { name: 'Зелень', count: '8' }
      ]
    },
    { 
      id: 7, 
      image: imgRectangle, 
      title: "Букет пионов", 
      price: "14 000 ₸", 
      isAvailable: false, 
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'vitrina',
      width: '30',
      height: '35'
    },
    { 
      id: 8, 
      image: imgRectangle1, 
      title: "Цветочная коробка", 
      price: "22 000 ₸", 
      isAvailable: false, 
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      type: 'catalog',
      catalogWidth: '25',
      catalogHeight: '20',
      duration: '40',
      discount: '20',
      ingredients: [
        { inventoryItemId: 3, name: 'Розы', quantity: 12, unit: 'шт', costPerUnit: 200 },
        { inventoryItemId: 6, name: 'Эвкалипт', quantity: 6, unit: 'ветка', costPerUnit: 80 }
      ],
      floristWorkCost: 2500,
      colors: ['blue', 'white'],
      productionTime: 'medium',
      composition: [
        { name: 'Розы', count: '12' },
        { name: 'Эвкалипт', count: '6' }
      ]
    }
  ]);

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
    
    // Enhanced Navigation
    navigateToScreen,
    navigateBack,
    
    // Tab management
    setActiveTab: setActiveTabWithURL,
    
    // Legacy setters (kept for compatibility)  
    setCurrentScreen,
    setSelectedProductId,
    setSelectedOrderId,
    setSelectedInventoryItemId,
    setSelectedCustomerId,
    setCustomers,
    setProducts,
    setOrders,
    
    // URL utilities
    urlManager
  };
}