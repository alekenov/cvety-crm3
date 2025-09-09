import { useState } from "react";
import { Package, ClipboardList, Warehouse, Users, User } from "lucide-react";

interface Product {
  id: number;
  image: string;
  images?: string[];
  title: string;
  price: string;
  isAvailable: boolean;
  createdAt: Date;
  type: 'vitrina' | 'catalog';
  width?: string;
  height?: string;
  video?: string;
  duration?: string;
  discount?: string;
  composition?: Array<{ name: string; count: string }>;
  colors?: string[];
  catalogWidth?: string;
  catalogHeight?: string;
  productionTime?: string;
}

interface MainTabViewProps {
  products: Product[];
  activeTab: 'orders' | 'products' | 'inventory' | 'customers' | 'profile';
  onActiveTabChange: (tab: 'orders' | 'products' | 'inventory' | 'customers' | 'profile') => void;
  onAddProduct: () => void;
  onViewProduct: (id: number) => void;
  onToggleProduct: (id: number) => void;
  onNavigateToDashboard: () => void;
  onViewOrder?: (orderId: string) => void;
  onStatusChange?: (orderId: string, newStatus: 'new' | 'paid' | 'accepted' | 'assembled' | 'in-transit' | 'completed') => void;
  onAddOrder?: () => void;
  onAddInventoryItem?: () => void;
  onViewInventoryItem?: (itemId: number) => void;
  onStartInventoryAudit?: () => void;

  ProductsListComponent: React.ComponentType<{
    products: Product[];
    onAddProduct: () => void;
    onViewProduct: (id: number) => void;
    onToggleProduct: (id: number) => void;
  }>;
  OrdersComponent: React.ComponentType<{
    onViewOrder?: (orderId: string) => void;
    onStatusChange?: (orderId: string, newStatus: 'new' | 'paid' | 'accepted' | 'assembled' | 'in-transit' | 'completed') => void;
    onAddOrder?: () => void;
  }>;
  InventoryComponent: React.ComponentType<{
    onAddItem?: () => void;
    onViewItem?: (itemId: number) => void;
    onStartAudit?: () => void;
  }>;
  CustomersComponent: React.ComponentType<any>;
  ProfileComponent: React.ComponentType<any>;
}

export function MainTabView({ 
  products, 
  activeTab,
  onActiveTabChange,
  onAddProduct, 
  onViewProduct, 
  onToggleProduct,
  onNavigateToDashboard,
  onViewOrder,
  onStatusChange,
  onAddOrder,
  onAddInventoryItem,
  onViewInventoryItem,
  onStartInventoryAudit,

  ProductsListComponent,
  OrdersComponent,
  InventoryComponent,
  CustomersComponent,
  ProfileComponent
}: MainTabViewProps) {

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {/* Main Content */}
        <div className="pb-16">
          {activeTab === 'orders' ? (
            <OrdersComponent 
              onViewOrder={onViewOrder}
              onStatusChange={onStatusChange}
              onAddOrder={onAddOrder}
            />
          ) : activeTab === 'products' ? (
            <ProductsListComponent
              products={products}
              onAddProduct={onAddProduct}
              onViewProduct={onViewProduct}
              onToggleProduct={onToggleProduct}
            />
          ) : activeTab === 'inventory' ? (
            <InventoryComponent
              onAddItem={onAddInventoryItem}
              onViewItem={onViewInventoryItem}
              onStartAudit={onStartInventoryAudit}
            />
          ) : activeTab === 'customers' ? (
            <CustomersComponent />
          ) : (
            <ProfileComponent />
          )}
        </div>

        {/* Bottom Tab Bar */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50">
          <div className="flex">
            <button
              onClick={() => onActiveTabChange('orders')}
              className={`flex-1 py-2 flex flex-col items-center justify-center transition-colors ${
                activeTab === 'orders'
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-500'
              }`}
            >
              <ClipboardList className="w-5 h-5 mb-1" />
              <span className="text-xs">Заказы</span>
            </button>
            <button
              onClick={() => onActiveTabChange('products')}
              className={`flex-1 py-2 flex flex-col items-center justify-center transition-colors ${
                activeTab === 'products'
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-500'
              }`}
            >
              <Package className="w-5 h-5 mb-1" />
              <span className="text-xs">Товары</span>
            </button>
            <button
              onClick={() => onActiveTabChange('inventory')}
              className={`flex-1 py-2 flex flex-col items-center justify-center transition-colors ${
                activeTab === 'inventory'
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-500'
              }`}
            >
              <Warehouse className="w-5 h-5 mb-1" />
              <span className="text-xs">Склад</span>
            </button>
            <button
              onClick={() => onActiveTabChange('customers')}
              className={`flex-1 py-2 flex flex-col items-center justify-center transition-colors ${
                activeTab === 'customers'
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-500'
              }`}
            >
              <Users className="w-5 h-5 mb-1" />
              <span className="text-xs">Клиенты</span>
            </button>
            <button
              onClick={() => onActiveTabChange('profile')}
              className={`flex-1 py-2 flex flex-col items-center justify-center transition-colors ${
                activeTab === 'profile'
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-500'
              }`}
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs">Профиль</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}