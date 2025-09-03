import { useState, useEffect } from 'react';
import { Product, Customer, Order, Screen } from '../types';
import { fetchProducts as fetchProductsAPI } from '../../api/products';
import type { ProductDTO } from '../../api/products';

export function useAppState() {
  // Screen navigation state with history tracking
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>(['main']);
  
  // Initialize activeTab from URL path
  const getInitialActiveTab = () => {
    const path = window.location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/inventory')) return 'inventory';
    if (path.includes('/customers')) return 'customers';
    if (path.includes('/profile')) return 'profile';
    return 'orders'; // default
  };
  
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'inventory' | 'customers' | 'profile'>(getInitialActiveTab());
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
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Convert ProductDTO to Product type
  const convertDTOToProduct = (dto: ProductDTO): Product => {
    // Parse date from API
    let createdAt: Date;
    
    // For "Собранный букет" (assembled bouquets), they don't have real creation dates
    // These are created on-demand, so we'll just use current date
    if (dto.title === 'Собранный букет' || dto.title?.includes('Собранный')) {
      createdAt = new Date();
    } else if (dto.createdAt) {
      // Try parsing ISO date format
      const date = new Date(dto.createdAt);
      
      // Check if date is valid and reasonable
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        createdAt = date;
      } else {
        // For invalid dates, use current date
        createdAt = new Date();
      }
    } else {
      // No date provided, use current date
      createdAt = new Date();
    }

    return {
      id: dto.id,
      image: dto.image,
      images: dto.images,
      title: dto.title,
      price: dto.price,
      isAvailable: dto.isAvailable,
      isReady: dto.isReady,
      createdAt: createdAt,
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
        // Load vitrina products (without shop_id filter)
        const vitrinaResult = await fetchProductsAPI({ type: 'vitrina', limit: 100 });
        
        // Load catalog products with shop_id filter for shop 17008
        const catalogResult = await fetchProductsAPI({ type: 'catalog', limit: 100, shop_id: 17008 });
        
        const allProducts: ProductDTO[] = [];
        
        if (vitrinaResult.success && vitrinaResult.data) {
          allProducts.push(...vitrinaResult.data);
        }
        
        if (catalogResult.success && catalogResult.data) {
          allProducts.push(...catalogResult.data);
        }
        
        const convertedProducts = allProducts.map(convertDTOToProduct);
        setProducts(convertedProducts);
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