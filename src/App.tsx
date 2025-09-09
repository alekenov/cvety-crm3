import React, { useState, useEffect, Suspense, lazy } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

// Centralized imports
import { Screen } from "@/src/types";
import { useAppContext } from "@/src/contexts/AppContext";
import { useAppActions } from "@/src/hooks/useAppActions";

// Import types
import { Product } from "@/src/types";
import { getTimeAgo } from "@/src/utils/date";

// Import API methods
import { fetchProducts, toggleProductActive, fetchProductDetail } from "./api/products";
import type { ProductDTO } from "./api/products";

// Import design system components
import { FilterTabs, EmptyState, PageHeader } from "@/src/components";


function ProductItem({ id, image, title, price, isAvailable, createdAt, onToggle, onView }: Product & {
  onToggle: (id: number) => void;
  onView: (id: number) => void;
}) {
  const handleSwitchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(id);
  };

  return (
    <div 
      className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onView(id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 bg-cover bg-center rounded-full relative overflow-hidden flex-shrink-0"
            style={{ backgroundImage: `url('${image}')` }}
          >
            {!isAvailable && <div className="absolute inset-0 bg-white/60"></div>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                {title}
              </span>
              <div className={`px-2 py-0.5 rounded text-xs ${
                isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {isAvailable ? 'Активен' : 'Неактивен'}
              </div>
            </div>
            <div className={`text-gray-700 ${!isAvailable ? 'text-gray-500' : ''}`}>
              {price}
            </div>
            <div className="text-gray-600 text-sm">
              {title === 'Собранный букет' ? 'Только что' : getTimeAgo(createdAt)}
            </div>
          </div>
        </div>
        <Switch 
          checked={isAvailable} 
          onCheckedChange={() => onToggle(id)}
          onClick={handleSwitchClick}
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>
    </div>
  );
}

// Lazy-loaded components for better code splitting
const ProductTypeSelector = lazy(() => import("./components/ProductTypeSelector").then(m => ({ default: m.ProductTypeSelector })));
const AddProductForm = lazy(() => import("./components/AddProductForm").then(m => ({ default: m.AddProductForm })));
const AddCatalogForm = lazy(() => import("./components/AddCatalogForm").then(m => ({ default: m.AddCatalogForm })));
const ProductDetail = lazy(() => import("./components/ProductDetail").then(m => ({ default: m.ProductDetail })));
const EditCatalogForm = lazy(() => import("./components/EditCatalogForm").then(m => ({ default: m.EditCatalogForm })));
const OrdersList = lazy(() => import("./components/OrdersList"));
const Dashboard = lazy(() => import("./components/Dashboard").then(m => ({ default: m.Dashboard })));
const OrderDetail = lazy(() => import("./components/OrderDetail").then(m => ({ default: m.OrderDetail })));
const AddOrder = lazy(() => import("./components/AddOrder").then(m => ({ default: m.AddOrder })));
const Inventory = lazy(() => import("./components/Inventory").then(m => ({ default: m.Inventory })));
const InventoryItemDetail = lazy(() => import("./components/InventoryItemDetail").then(m => ({ default: m.InventoryItemDetail })));
const InventoryAudit = lazy(() => import("./components/InventoryAudit").then(m => ({ default: m.InventoryAudit })));
const AddInventoryItem = lazy(() => import("./components/AddInventoryItem").then(m => ({ default: m.AddInventoryItem })));
const Customers = lazy(() => import("./components/Customers").then(m => ({ default: m.Customers })));
const CustomerDetail = lazy(() => import("./components/CustomerDetail").then(m => ({ default: m.CustomerDetail })));
const AddCustomer = lazy(() => import("./components/AddCustomer").then(m => ({ default: m.AddCustomer })));
const Profile = lazy(() => import("./components/Profile").then(m => ({ default: m.Profile })));
const ProductsListWrapper = lazy(() => import("./components/ProductsListWrapper"));

// Keep MainTabView as regular import since it's always needed
import { MainTabView } from "./components/MainTabView";
import { LoadingSpinner } from "./components/LoadingSpinner";



export default function App() {
  // Use centralized state and actions
  const state = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current path to determine which tab should be active
  const currentPath = location.pathname;
  const isCustomersPage = currentPath === '/customers';
  
  // Set active tab based on current path
  useEffect(() => {
    if (state) {
      if (currentPath === '/customers') {
        state.setActiveTab('customers');
      } else if (currentPath === '/orders') {
        state.setActiveTab('orders');
      } else if (currentPath === '/inventory') {
        state.setActiveTab('inventory');
      } else if (currentPath === '/profile') {
        state.setActiveTab('profile');
      } else if (currentPath === '/products') {
        state.setActiveTab('products');
      } else {
        // Для главной страницы "/" показываем продукты по умолчанию
        state.setActiveTab('products');
      }
    }
  }, [currentPath, state]);
  
  // Check if state loaded properly - but only show products loading for non-customer pages
  if (!state || (!isCustomersPage && state.isLoadingProducts)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  // Create a React Router-aware setActiveTab function
  const handleSetActiveTab = (tab: 'orders' | 'products' | 'inventory' | 'customers' | 'profile') => {
    const routeMap = {
      'orders': '/orders',
      'products': '/products', 
      'inventory': '/inventory',
      'customers': '/customers',
      'profile': '/profile'
    };
    // Navigate without any query parameters to keep URLs clean
    navigate(routeMap[tab], { replace: false });
  };

  const actions = useAppActions({
    setCurrentScreen: state.setCurrentScreen,
    navigateToScreen: state.navigateToScreen,
    navigateBack: state.navigateBack,
    setActiveTab: handleSetActiveTab,
    setSelectedProductId: state.setSelectedProductId,
    setSelectedOrderId: state.setSelectedOrderId,
    setSelectedInventoryItemId: state.setSelectedInventoryItemId,
    setSelectedCustomerId: state.setSelectedCustomerId,
    setProducts: state.setProducts,
    setOrders: state.setOrders,
    setCustomers: state.setCustomers,
    products: state.products,
    customers: state.customers
  });





  switch (state.currentScreen) {
    case 'selector':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка селектора типа..." />}>
          <ProductTypeSelector 
            onClose={actions.handleCloseToList}
            onSelectVitrina={actions.handleSelectVitrina}
            onSelectCatalog={actions.handleSelectCatalog}
          />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'vitrina-form':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка формы товара..." />}>
          <AddProductForm onClose={actions.handleCloseToList} />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'catalog-form':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка формы каталога..." />}>
          <AddCatalogForm onClose={actions.handleCloseToList} />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'product-detail':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка детей товара..." />}>
          <ProductDetail 
            productId={state.selectedProductId} 
            products={state.products}
            onClose={actions.handleCloseToList} 
            onUpdateProduct={actions.updateProduct}
            onEditProduct={actions.handleEditProduct}
          />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'edit-catalog':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка редактора каталога..." />}>
          <EditCatalogForm 
            productId={state.selectedProductId}
            products={state.products}
            onClose={actions.handleCloseToList}
            onUpdateProduct={actions.updateProduct}
          />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'dashboard':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка дашборда..." />}>
          <Dashboard onNavigateBack={actions.handleCloseToList} />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'order-detail':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка заказа..." />}>
          <OrderDetail
            orderId={state.selectedOrderId || ''}
            onClose={actions.handleCloseToList}
            onEdit={actions.handleEditOrder}
            onDelete={actions.handleDeleteOrder}
            onUpdateStatus={actions.handleUpdateOrderStatus}
          />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'add-order':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка формы заказа..." />}>
          <AddOrder
            products={state.products}
            onClose={actions.handleCloseToList}
            onCreateOrder={actions.handleCreateOrder}
          />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'add-inventory-item':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка формы склада..." />}>
          <AddInventoryItem
            onClose={actions.handleCloseToList}
            onProcessSupply={(items) => {
              console.log('Supply processed with items:', items);
            }}
          />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'inventory-item-detail':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка элемента склада..." />}>
          <InventoryItemDetail
            itemId={state.selectedInventoryItemId || 0}
            onClose={actions.handleCloseToList}
            onUpdateItem={(itemId, updates) => {
              console.log('Update inventory item:', itemId, updates);
            }}
          />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'inventory-audit':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка аудита склада..." />}>
          <InventoryAudit
            onClose={actions.handleCloseToList}
            onSaveAudit={(auditResults) => {
              console.log('Audit results saved:', auditResults);
            }}
          />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'customer-detail':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка клиента..." />}>
          <CustomerDetail
            customerId={state.selectedCustomerId || 0}
            customers={state.customers}
            onClose={actions.handleCloseToList}
            onUpdateCustomer={actions.updateCustomer}
            onViewOrder={actions.handleViewOrder}
          />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );
    case 'add-customer':
      return (
        <>
        <Suspense fallback={<LoadingSpinner message="Загрузка формы клиента..." />}>
          <AddCustomer
            onClose={actions.handleCloseToList}
            onCreateCustomer={actions.handleCreateCustomer}
          />
        </Suspense>
        <Toaster position="top-center" />
        </>
      );


    default:
      return (
        <>
        <MainTabView
          products={state.products}
          activeTab={state.activeTab}
          onActiveTabChange={handleSetActiveTab}
          onAddProduct={actions.handleAddProduct}
          onViewProduct={actions.handleViewProduct}
          onToggleProduct={actions.toggleProductStatus}
          onNavigateToDashboard={actions.handleNavigateToDashboard}
          onViewOrder={actions.handleViewOrder}
          onStatusChange={actions.handleOrderStatusChange}
          onAddOrder={actions.handleAddOrder}
          onAddInventoryItem={actions.handleAddInventoryItem}
          onViewInventoryItem={actions.handleViewInventoryItem}
          onStartInventoryAudit={actions.handleStartInventoryAudit}

          ProductsListComponent={ProductsListWrapper}
          OrdersComponent={OrdersList}
          InventoryComponent={Inventory}
          CustomersComponent={(props: any) => <Customers {...props} onViewCustomer={actions.handleViewCustomer} onAddCustomer={actions.handleAddCustomer} customers={state.customers} />}
          ProfileComponent={(props: any) => <Profile {...props} showHeader={false} />}
        />
        <Toaster position="top-center" />
        </>
      );
  }
}
