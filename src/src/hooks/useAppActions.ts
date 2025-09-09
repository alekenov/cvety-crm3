import { Order, Customer } from '../types';

interface UseAppActionsProps {
  setCurrentScreen: (screen: any) => void;
  navigateToScreen: (screen: any) => void;
  navigateBack: () => void;
  setActiveTab: (tab: 'orders' | 'products' | 'inventory' | 'customers' | 'profile') => void;
  setSelectedProductId: (id: number | null) => void;
  setSelectedOrderId: (id: string | null) => void;
  setSelectedInventoryItemId: (id: number | null) => void;
  setSelectedCustomerId: (id: number | null) => void;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: any[];
  customers: Customer[];
}

export function useAppActions({
  setCurrentScreen,
  navigateToScreen,
  navigateBack,
  setActiveTab,
  setSelectedProductId,
  setSelectedOrderId,
  setSelectedInventoryItemId,
  setSelectedCustomerId,
  setProducts,
  setOrders,
  setCustomers,
  products,
  customers
}: UseAppActionsProps) {

  // Navigation actions with history tracking
  const handleAddProduct = () => navigateToScreen('selector');
  const handleSelectVitrina = () => navigateToScreen('vitrina-form');
  const handleSelectCatalog = () => navigateToScreen('catalog-form');
  const handleCloseToList = () => navigateBack(); // Now uses navigation history
  const handleNavigateToDashboard = () => navigateToScreen('dashboard');
  const handleAddOrder = () => navigateToScreen('add-order');
  const handleAddInventoryItem = () => navigateToScreen('add-inventory-item');
  const handleStartInventoryAudit = () => navigateToScreen('inventory-audit');
  const handleAddCustomer = () => navigateToScreen('add-customer');

  const handleViewProduct = (id: number) => {
    setActiveTab('products'); // Set active tab before navigating
    setSelectedProductId(id);
    navigateToScreen('product-detail');
  };

  const handleEditProduct = (id: number) => {
    setActiveTab('products'); // Set active tab before navigating
    setSelectedProductId(id);
    navigateToScreen('edit-catalog');
  };

  const handleViewOrder = (orderId: string) => {
    setActiveTab('orders'); // Set active tab before navigating
    setSelectedOrderId(orderId);
    navigateToScreen('order-detail');
  };

  const handleViewInventoryItem = (itemId: number) => {
    setActiveTab('inventory'); // Set active tab before navigating
    setSelectedInventoryItemId(itemId);
    navigateToScreen('inventory-item-detail');
  };

  const handleViewCustomer = (customerId: number) => {
    setActiveTab('customers'); // Set active tab before navigating
    setSelectedCustomerId(customerId);
    navigateToScreen('customer-detail');
  };

  // Product actions
  const toggleProductStatus = (id: number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id 
          ? { ...product, isAvailable: !product.isAvailable }
          : product
      )
    );
  };

  const updateProduct = (updatedProduct: any) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  // Order actions
  const handleOrderStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      )
    );
    console.log('Order status changed:', orderId, 'to', newStatus);
  };

  const handleCreateOrder = (orderData: any) => {
    const orderNumber = (40400 + Math.floor(Math.random() * 100)).toString();
    
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      number: orderNumber,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
      mainProduct: products.find(p => p.id === orderData.mainProductId) || products[0],
      recipient: customers.find(c => c.id === orderData.recipientId) || customers[0],
      sender: customers.find(c => c.id === orderData.senderId) || customers[0],
      deliveryType: orderData.deliveryType,
      deliveryAddress: orderData.deliveryAddress,
      deliveryCity: orderData.deliveryCity,
      deliveryDate: orderData.deliveryDate,
      deliveryTime: orderData.deliveryTime,
      postcard: orderData.postcard,
      comment: orderData.comment,
      anonymous: orderData.anonymous || false,
      payment: {
        amount: orderData.paymentAmount,
        status: 'unpaid'
      }
    };
    
    setOrders(prev => [newOrder, ...prev]);
    console.log('New order created with relationships:', newOrder);
    navigateBack(); // Use history-based navigation
  };

  // Customer actions
  const updateCustomer = (updatedCustomer: any) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
  };

  const handleCreateCustomer = (customerData: {
    name: string;
    phone: string;
  }) => {
    const newId = Math.max(...customers.map(c => c.id)) + 1;
    
    const newCustomer: Customer = {
      id: newId,
      name: customerData.name,
      phone: customerData.phone,
      memberSince: new Date(),
      totalOrders: 0,
      totalSpent: 0,
      status: 'active'
    };
    
    setCustomers(prev => [newCustomer, ...prev]);
    console.log('New customer created:', newCustomer);
    navigateBack(); // Use history-based navigation
  };

  // Placeholder actions for order details
  const handleEditOrder = () => {
    console.log('Order edited successfully');
  };

  const handleDeleteOrder = () => {
    console.log('Delete order');
    navigateBack(); // Use history-based navigation
  };

  const handleUpdateOrderStatus = (status: string) => {
    console.log('Update order status:', status);
  };

  return {
    // Navigation
    handleAddProduct,
    handleSelectVitrina,
    handleSelectCatalog,
    handleCloseToList,
    handleNavigateToDashboard,
    handleAddOrder,
    handleAddInventoryItem,
    handleStartInventoryAudit,
    handleAddCustomer,
    handleViewProduct,
    handleEditProduct,
    handleViewOrder,
    handleViewInventoryItem,
    handleViewCustomer,

    // Business logic
    toggleProductStatus,
    updateProduct,
    handleOrderStatusChange,
    handleCreateOrder,
    updateCustomer,
    handleCreateCustomer,
    handleEditOrder,
    handleDeleteOrder,
    handleUpdateOrderStatus
  };
}