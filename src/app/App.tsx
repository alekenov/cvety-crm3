import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

// Import from new structure
import { Product } from '@/shared/types';
import { getTimeAgo } from '@/shared/utils';
import { Switch } from '@/components/ui/switch';

// Components
import { MainTabView } from '@/components/MainTabView';
import { ProductTypeSelector } from '@/components/ProductTypeSelector';
import { AddProductForm } from '@/components/AddProductForm';
import { AddCatalogForm } from '@/components/AddCatalogForm';
import { ProductDetail } from '@/components/ProductDetail';
import { EditCatalogForm } from '@/components/EditCatalogForm';
import { OrderDetail } from '@/components/OrderDetail';
import { AddOrder } from '@/components/AddOrder';
import { Inventory } from '@/components/Inventory';
import { InventoryItemDetail } from '@/components/InventoryItemDetail';
import { InventoryAudit } from '@/components/InventoryAudit';
import { AddInventoryItem } from '@/components/AddInventoryItem';
import { Customers } from '@/components/Customers';
import { CustomerDetail } from '@/components/CustomerDetail';
import { AddCustomer } from '@/components/AddCustomer';
import { Profile } from '@/components/Profile';
import { Dashboard } from '@/components/Dashboard';
import OrdersList from '@/components/OrdersList';
import ProductsListWrapper from '@/components/ProductsListWrapper';

// Context and hooks - using temp path until migration is complete
import { Screen } from '@/shared/types';
import { useAppContext } from '@/src/contexts/AppContext';
import { useAppActions } from '@/src/hooks/useAppActions';

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

export default function App() {
  const state = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current path to determine which tab should be active
  const currentPath = location.pathname;
  const isCustomersPage = currentPath === '/customers';
  
  // Set active tab based on current path
  React.useEffect(() => {
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
        state.setActiveTab('products');
      }
    }
  }, [currentPath, state]);
  
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
  
  const handleSetActiveTab = (tab: 'orders' | 'products' | 'inventory' | 'customers' | 'profile') => {
    const routeMap = {
      'orders': '/orders',
      'products': '/products',
      'inventory': '/inventory',
      'customers': '/customers',
      'profile': '/profile'
    };
    navigate(routeMap[tab]);
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

  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'selector':
        return (
          <ProductTypeSelector 
            onClose={actions.handleCloseToList}
            onSelectVitrina={actions.handleSelectVitrina}
            onSelectCatalog={actions.handleSelectCatalog}
          />
        );
      case 'vitrina-form':
        return <AddProductForm onClose={actions.handleCloseToList} />;
      case 'catalog-form':
        return <AddCatalogForm onClose={actions.handleCloseToList} />;
      case 'product-detail':
        return (
          <ProductDetail 
            productId={state.selectedProductId} 
            products={state.products}
            onClose={actions.handleCloseToList} 
            onUpdateProduct={actions.updateProduct}
            onEditProduct={actions.handleEditProduct}
          />
        );
      case 'edit-catalog':
        return (
          <EditCatalogForm 
            productId={state.selectedProductId}
            products={state.products}
            onClose={actions.handleCloseToList}
            onUpdateProduct={actions.updateProduct}
          />
        );
      case 'dashboard':
        return <Dashboard onNavigateBack={actions.handleCloseToList} />;
      case 'order-detail':
        return (
          <OrderDetail
            orderId={state.selectedOrderId || ''}
            onClose={actions.handleCloseToList}
            onEdit={actions.handleEditOrder}
            onDelete={actions.handleDeleteOrder}
            onUpdateStatus={actions.handleUpdateOrderStatus}
          />
        );
      case 'add-order':
        return (
          <AddOrder
            products={state.products}
            onClose={actions.handleCloseToList}
            onCreateOrder={actions.handleCreateOrder}
          />
        );
      case 'add-inventory-item':
        return (
          <AddInventoryItem
            onClose={actions.handleCloseToList}
            onProcessSupply={(items) => {
              console.log('Supply processed with items:', items);
            }}
          />
        );
      case 'inventory-item-detail':
        return (
          <InventoryItemDetail
            itemId={state.selectedInventoryItemId || 0}
            onClose={actions.handleCloseToList}
            onUpdateItem={(itemId, updates) => {
              console.log('Update inventory item:', itemId, updates);
            }}
          />
        );
      case 'inventory-audit':
        return (
          <InventoryAudit
            onClose={actions.handleCloseToList}
            onSaveAudit={(auditResults) => {
              console.log('Audit results saved:', auditResults);
            }}
          />
        );
      case 'customer-detail':
        return (
          <CustomerDetail
            customerId={state.selectedCustomerId || 0}
            customers={state.customers}
            onClose={actions.handleCloseToList}
            onUpdateCustomer={actions.updateCustomer}
            onViewOrder={actions.handleViewOrder}
          />
        );
      case 'add-customer':
        return (
          <AddCustomer
            onClose={actions.handleCloseToList}
            onCreateCustomer={actions.handleCreateCustomer}
          />
        );
      default:
        return (
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
        );
    }
  };

  return (
    <>
      {renderScreen()}
      <Toaster position="top-center" />
    </>
  );
}