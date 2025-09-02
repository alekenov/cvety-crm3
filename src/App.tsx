import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";

// Centralized imports
import { Screen } from "./src/types";
import { useAppState } from "./src/hooks/useAppState";
import { useAppActions } from "./src/hooks/useAppActions";

// Import types for inline components
import { Product } from "./src/types";
import { getTimeAgo } from "./src/utils/date";

// Import API methods
import { fetchProducts, toggleProductActive, fetchProductDetail } from "./api/products";
import type { ProductDTO } from "./api/products";

// Temporary inline components until import issues are resolved
function FilterTabs({ tabs, activeTab, onTabChange }: { 
  tabs: Array<{ key: string; label: string; count?: number }>; 
  activeTab: string; 
  onTabChange: (tab: string) => void; 
}) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            activeTab === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && ` (${tab.count})`}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center mb-4">{description}</p>
    </div>
  );
}

function PageHeader({ title, actions }: { 
  title: string; 
  actions?: React.ReactNode; 
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div>
        <h1 className="text-gray-900">{title}</h1>
      </div>
      {actions && <div className="flex gap-1">{actions}</div>}
    </div>
  );
}

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
              {getTimeAgo(createdAt)}
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

function ProductsList({ products, onAddProduct, onViewProduct, onToggleProduct }: { 
  products: Product[];
  onAddProduct: () => void; 
  onViewProduct: (id: number) => void;
  onToggleProduct: (id: number) => void;
}) {
  const [filter, setFilter] = useState<'vitrina' | 'catalog'>('vitrina');

  const vitrinaProducts = products.filter(product => product.type === 'vitrina');
  const catalogProducts = products.filter(product => product.type === 'catalog');

  const filteredProducts = filter === 'vitrina' 
    ? vitrinaProducts.filter(product => product.isAvailable)
    : catalogProducts;

  const activeVitrinaCount = vitrinaProducts.filter(p => p.isAvailable).length;
  const activeCatalogCount = catalogProducts.filter(p => p.isAvailable).length;

  const tabs = [
    { key: 'vitrina', label: 'Витрина', count: activeVitrinaCount },
    { key: 'catalog', label: 'Каталог', count: activeCatalogCount }
  ];

  const headerActions = (
    <>
      <Button variant="ghost" size="sm" className="p-2" onClick={onAddProduct}>
        <Plus className="w-5 h-5 text-gray-600" />
      </Button>
      <Button variant="ghost" size="sm" className="p-2">
        <Search className="w-5 h-5 text-gray-600" />
      </Button>
    </>
  );

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Товары" actions={headerActions} />

      {/* Filter Tabs */}
      <div className="p-4 border-b border-gray-100">
        <FilterTabs 
          tabs={tabs} 
          activeTab={filter} 
          onTabChange={(tab) => setFilter(tab as any)} 
        />
      </div>

      {/* Products List */}
      <div className="pb-20">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductItem 
              key={product.id}
              {...product}
              onToggle={onToggleProduct}
              onView={onViewProduct}
            />
          ))
        ) : (
          <EmptyState
            icon={<Plus className="w-8 h-8 text-gray-400" />}
            title={filter === 'vitrina' ? 'Нет товаров в витрине' : 'Нет товаров'}
            description={
              filter === 'vitrina' 
                ? 'Включите товары в витрину, чтобы они отображались покупателям'
                : 'Добавьте свой первый товар, чтобы начать продавать'
            }
          />
        )}
      </div>
    </div>
  );
}
// Component imports
import { ProductTypeSelector } from "./components/ProductTypeSelector";
import { AddProductForm } from "./components/AddProductForm";
import { AddCatalogForm } from "./components/AddCatalogForm";
import { ProductDetail } from "./components/ProductDetail";
import { EditCatalogForm } from "./components/EditCatalogForm";
import { Orders } from "./components/Orders";
import { Dashboard } from "./components/Dashboard";
import { MainTabView } from "./components/MainTabView";
import { OrderDetail } from "./components/OrderDetail";
import { AddOrder } from "./components/AddOrder";
import { Inventory } from "./components/Inventory";
import { InventoryItemDetail } from "./components/InventoryItemDetail";
import { InventoryAudit } from "./components/InventoryAudit";
import { AddInventoryItem } from "./components/AddInventoryItem";
import { Customers } from "./components/Customers";
import { CustomerDetail } from "./components/CustomerDetail";
import { AddCustomer } from "./components/AddCustomer";
import { Profile } from "./components/Profile";



export default function App() {
  // Use centralized state and actions
  const state = useAppState();
  
  // Check if state loaded properly or products are loading
  if (!state || state.isLoadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    );
  }
  
  const actions = useAppActions({
    setCurrentScreen: state.setCurrentScreen,
    navigateToScreen: state.navigateToScreen,
    navigateBack: state.navigateBack,
    setActiveTab: state.setActiveTab,
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
          onActiveTabChange={state.setActiveTab}
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

          ProductsListComponent={ProductsList}
          OrdersComponent={(props: any) => <Orders {...props} orders={state.orders} />}
          InventoryComponent={Inventory}
          CustomersComponent={(props: any) => <Customers {...props} onViewCustomer={actions.handleViewCustomer} onAddCustomer={actions.handleAddCustomer} customers={state.customers} />}
          ProfileComponent={(props: any) => <Profile {...props} showHeader={false} />}
        />
      );
  }
}