import { useParams, useNavigate } from "react-router-dom";
import { CustomerDetail } from "../components/CustomerDetail";
import { useState, useEffect } from "react";
import { CustomerAPI, Customer, ApiOrder } from "../services/customerApi";

// Mock customer data - used as fallback if API fails
const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Анна Петрова",
    phone: "+7 (777) 123-45-67",
    email: "anna.petrova@gmail.com",
    memberSince: new Date(2023, 2, 15),
    totalOrders: 12,
    totalSpent: 156000,
    lastOrderDate: new Date(2024, 7, 20),
    status: 'vip' as const
  },
  {
    id: 2,
    name: "Мария Козлова",
    phone: "+7 (777) 234-56-78",
    memberSince: new Date(2023, 5, 8),
    totalOrders: 7,
    totalSpent: 84500,
    lastOrderDate: new Date(2024, 7, 18),
    status: 'active' as const
  },
  {
    id: 3,
    name: "Елена Сидорова",
    phone: "+7 (777) 345-67-89",
    email: "elena.s@mail.ru",
    memberSince: new Date(2022, 11, 3),
    totalOrders: 25,
    totalSpent: 320000,
    lastOrderDate: new Date(2024, 7, 25),
    status: 'vip' as const
  },
  {
    id: 4,
    name: "Ольга Иванова",
    phone: "+7 (777) 456-78-90",
    memberSince: new Date(2024, 1, 20),
    totalOrders: 3,
    totalSpent: 42000,
    lastOrderDate: new Date(2024, 6, 15),
    status: 'active' as const
  },
  {
    id: 5,
    name: "Наталья Богданова",
    phone: "+7 (777) 567-89-01",
    memberSince: new Date(2023, 8, 12),
    totalOrders: 15,
    totalSpent: 198000,
    lastOrderDate: new Date(2024, 5, 10),
    status: 'vip' as const
  },
  {
    id: 6,
    name: "Светлана Морозова",
    phone: "+7 (777) 678-90-12",
    memberSince: new Date(2024, 0, 5),
    totalOrders: 2,
    totalSpent: 25000,
    lastOrderDate: new Date(2024, 3, 8),
    status: 'inactive' as const
  },
  {
    id: 7,
    name: "Александра Попова",
    phone: "+7 (777) 789-01-23",
    email: "alex.popova@yandex.kz",
    memberSince: new Date(2023, 6, 25),
    totalOrders: 9,
    totalSpent: 112000,
    lastOrderDate: new Date(2024, 7, 12),
    status: 'active' as const
  },
  {
    id: 8,
    name: "Ирина Новикова",
    phone: "+7 (777) 890-12-34",
    memberSince: new Date(2023, 10, 18),
    totalOrders: 6,
    totalSpent: 78000,
    lastOrderDate: new Date(2024, 4, 22),
    status: 'active' as const
  }
];

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCustomerDetail(parseInt(id, 10));
    }
  }, [id]);

  const loadCustomerDetail = async (customerId: number) => {
    try {
      console.log(`📱 CustomerDetailPage: Starting to load customer ${customerId}`);
      setIsLoading(true);
      setError(null);
      
      // Load customer data and orders in parallel
      const [customerData, ordersData] = await Promise.all([
        CustomerAPI.fetchCustomerDetail(customerId),
        CustomerAPI.fetchCustomerOrders(customerId, 50)
      ]);
      
      console.log(`📱 CustomerDetailPage: Received customer data:`, customerData);
      console.log(`📱 CustomerDetailPage: Received orders data:`, ordersData);
      
      setCustomer(customerData);
      setCustomerOrders(ordersData);
      
      console.log(`📱 CustomerDetailPage: Successfully set customer data for ${customerData?.name || 'unknown'} with ${ordersData.length} orders`);
    } catch (err) {
      console.error('📱 CustomerDetailPage: Failed to load customer detail:', err);
      setError('Не удалось загрузить данные клиента');
      // Fall back to mock data if available
      const mockCustomer = mockCustomers.find(c => c.id === customerId);
      if (mockCustomer) {
        console.log(`📱 CustomerDetailPage: Using mock data for ${customerId}: ${mockCustomer.name}`);
        setCustomer(mockCustomer);
        setCustomerOrders([]); // No orders for mock data
      } else {
        console.log(`📱 CustomerDetailPage: No mock data available for customer ${customerId}`);
      }
    } finally {
      setIsLoading(false);
      console.log(`📱 CustomerDetailPage: Loading completed for customer ${customerId}`);
    }
  };

  const handleClose = () => {
    navigate("/customers");
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomer(updatedCustomer);
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Customer ID not found</p>
      </div>
    );
  }

  const customerId = parseInt(id, 10);
  
  if (isNaN(customerId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Invalid customer ID</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных клиента...</p>
        </div>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => loadCustomerDetail(customerId)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  console.log(`📱 CustomerDetailPage: Rendering with customer:`, customer, `isLoading:`, isLoading, `error:`, error);
  
  if (!customer) {
    console.log(`📱 CustomerDetailPage: Customer is falsy, showing "not found" message`);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Клиент не найден</p>
      </div>
    );
  }

  return (
    <CustomerDetail
      customerId={customerId}
      customers={[customer]}
      orders={customerOrders}
      onClose={handleClose}
      onUpdateCustomer={handleUpdateCustomer}
      onViewOrder={handleViewOrder}
    />
  );
}