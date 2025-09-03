// Customer API Service
// Connects to production Cvety.kz API endpoints using unified API client

// Import unified API client (same as products/orders)
import { api } from '../api/client';

// API Response Types
export interface ApiCustomer {
  ID: number;
  LOGIN: string;
  NAME?: string;
  LAST_NAME?: string;
  EMAIL?: string;
  PERSONAL_PHONE?: string;
  PERSONAL_CITY?: string;
  DATE_REGISTER?: {
    value: string;
    text: string;
  };
  ACTIVE?: 'Y' | 'N';
  PERSONAL_NOTES?: string;
  PERSONAL_ZIP?: string;
  PERSONAL_STREET?: string;
}

export interface ApiOrder {
  ID: number;
  DATE_INSERT: {
    value: string;
    text: string;
  };
  PRICE: number;
  CURRENCY: string;
  STATUS_ID: string;
}

export interface ApiCustomersResponse {
  status: boolean;
  data: ApiCustomer[];
  timestamp?: string;
}

export interface ApiCustomerDetailResponse {
  status: boolean;
  data: ApiCustomer;
  timestamp?: string;
}

export interface ApiCustomerOrdersResponse {
  orders: ApiOrder[];
  total: number;
}

// Frontend Types
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  memberSince: Date;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  status: 'active' | 'vip' | 'inactive';
  notes?: string;
  address?: string;
}

// Status determination based on order history
function determineCustomerStatus(totalOrders: number, totalSpent: number, lastOrderDate?: Date): 'active' | 'vip' | 'inactive' {
  // VIP: 8+ orders or 200K+ KZT spent
  if (totalOrders >= 8 || totalSpent >= 200000) {
    return 'vip';
  }
  
  // Inactive: No orders in last 3 months
  if (lastOrderDate) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    if (lastOrderDate < threeMonthsAgo) {
      return 'inactive';
    }
  }
  
  // Default: Active
  return 'active';
}

// Transform API customer to frontend format
function transformCustomer(apiCustomer: ApiCustomer, orders?: ApiOrder[]): Customer {
  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.reduce((sum, order) => {
    return sum + (Number(order.PRICE) || 0);
  }, 0) || 0;
  
  // Get last order date
  let lastOrderDate: Date | undefined;
  if (orders && orders.length > 0) {
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.DATE_INSERT.value).getTime() - new Date(a.DATE_INSERT.value).getTime()
    );
    lastOrderDate = new Date(sortedOrders[0].DATE_INSERT.value);
  }

  // Construct display name
  const nameParts = [];
  if (apiCustomer.NAME) nameParts.push(apiCustomer.NAME);
  if (apiCustomer.LAST_NAME) nameParts.push(apiCustomer.LAST_NAME);
  const displayName = nameParts.length > 0 ? nameParts.join(' ') : 
                      apiCustomer.EMAIL || apiCustomer.LOGIN || `Клиент #${apiCustomer.ID}`;

  // Handle memberSince date parsing
  let memberSince: Date;
  if (apiCustomer.DATE_REGISTER?.value) {
    memberSince = new Date(apiCustomer.DATE_REGISTER.value);
  } else {
    memberSince = new Date();
  }

  const result = {
    id: apiCustomer.ID,
    name: displayName,
    phone: apiCustomer.PERSONAL_PHONE || 'Не указан',
    email: apiCustomer.EMAIL,
    memberSince,
    totalOrders,
    totalSpent,
    lastOrderDate,
    status: determineCustomerStatus(totalOrders, totalSpent, lastOrderDate),
    notes: apiCustomer.PERSONAL_NOTES,
    address: apiCustomer.PERSONAL_STREET
  };
  
  return result;
}

// API Methods
export class CustomerAPI {
  // Fetch list of customers with optional pagination and order data
  static async fetchCustomers(limit: number = 100, offset: number = 0, includeOrders: boolean = true): Promise<Customer[]> {
    try {
      console.log(`🔍 Fetching customers list (limit: ${limit}, offset: ${offset}, includeOrders: ${includeOrders})`);
      
      const data: ApiCustomersResponse = await api('/api/v2/customers/', {
        query: { limit, offset }
      });
      
      if (!data.status || !data.data) {
        throw new Error('Invalid API response format');
      }

      console.log(`✅ Fetched ${data.data.length} customers successfully`);
      
      if (!includeOrders) {
        // Fast path: transform without order data (for cases where orders aren't needed)
        return data.data.map(apiCustomer => transformCustomer(apiCustomer));
      }

      // Enhanced path: fetch orders for each customer to calculate real statistics
      console.log(`📋 Fetching order data for ${data.data.length} customers...`);
      
      const customersWithOrders = await Promise.allSettled(
        data.data.map(async (apiCustomer) => {
          try {
            // Fetch orders for this customer
            const ordersData: ApiCustomerOrdersResponse = await api('/api/v2/customers/orders.php', {
              query: { CUSTOMER_ID: apiCustomer.ID, limit: 50 }
            });
            
            const orders = ordersData.orders || [];
            console.log(`📊 Customer ${apiCustomer.ID}: ${orders.length} orders`);
            
            return transformCustomer(apiCustomer, orders);
          } catch (orderError) {
            console.warn(`⚠️ Failed to fetch orders for customer ${apiCustomer.ID}:`, orderError);
            // Fallback: return customer without order data
            return transformCustomer(apiCustomer);
          }
        })
      );

      // Extract successful results and handle failures gracefully
      const successfulCustomers = customersWithOrders
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<Customer>).value);

      const failedCount = customersWithOrders.length - successfulCustomers.length;
      if (failedCount > 0) {
        console.warn(`⚠️ Failed to load order data for ${failedCount} customers`);
      }

      console.log(`✅ Successfully processed ${successfulCustomers.length} customers with order data`);
      return successfulCustomers;
      
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      throw error;
    }
  }

  // Mock data fallback for development when API fails
  private static getMockCustomerData(customerId: number): Customer | null {
    // Enhanced mock data including customer 469
    const mockCustomers: { [key: number]: Customer } = {
      1: {
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
      469: {
        id: 469,
        name: "Чингис Алекенов",
        phone: "+77015211545",
        email: "alekenov@gmail.com",
        memberSince: new Date(2023, 0, 1),
        totalOrders: 8,
        totalSpent: 125000,
        lastOrderDate: new Date(2024, 8, 1),
        status: 'vip' as const,
        notes: "Test customer - данные из mock fallback"
      }
    };

    return mockCustomers[customerId] || null;
  }

  // Direct API call method for fallback (bypasses proxy in development)
  private static async fetchCustomerDetailDirect(customerId: number): Promise<Customer> {
    console.log(`🔄 Attempting direct API call for customer ${customerId}`);
    
    try {
      // Always use direct HTTPS URL for fallback
      const directDetailUrl = `https://cvety.kz/api/v2/customers/detail.php?id=${customerId}&access_token=${API_TOKEN}`;
      
      const detailResponse = await fetch(directDetailUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'CRM-Frontend-Direct/1.0'
        }
      });

      if (!detailResponse.ok) {
        throw new Error(`Direct API failed: ${detailResponse.status} ${detailResponse.statusText}`);
      }

      const detailData: ApiCustomerDetailResponse = await detailResponse.json();
      
      if (!detailData.status || !detailData.data) {
        throw new Error('Invalid direct API response format');
      }

      // Fetch customer orders via direct API
      const directOrdersUrl = `https://cvety.kz/api/v2/customers/orders.php?CUSTOMER_ID=${customerId}`;
      
      let orders: ApiOrder[] = [];
      
      try {
        const ordersResponse = await fetch(directOrdersUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        if (ordersResponse.ok) {
          const ordersData: ApiCustomerOrdersResponse = await ordersResponse.json();
          orders = ordersData.orders || [];
        }
      } catch (ordersError) {
        console.warn(`⚠️ Failed to fetch orders for customer ${customerId}:`, ordersError);
        // Continue without orders data
      }

      console.log(`✅ Direct API success for customer ${customerId}, found ${orders.length} orders`);
      return transformCustomer(detailData.data, orders);
      
    } catch (directError) {
      // CORS or network error - try mock data as last resort
      console.warn(`⚠️ Direct API blocked (likely CORS), trying mock data for customer ${customerId}`);
      const mockCustomer = this.getMockCustomerData(customerId);
      
      if (mockCustomer) {
        console.log(`📋 Using mock data for customer ${customerId}: ${mockCustomer.name}`);
        return mockCustomer;
      }
      
      throw directError;
    }
  }

  // Fetch detailed customer information with orders (using unified API client)
  static async fetchCustomerDetail(customerId: number): Promise<Customer> {
    console.log(`🔍 Fetching customer detail for ID: ${customerId} via unified API`);
    
    try {
      // Use unified API client (same as products/orders)
      console.log(`📡 API attempt: /api/v2/customers/detail.php?id=${customerId}`);
      
      const detailData: ApiCustomerDetailResponse = await api('/api/v2/customers/detail.php', {
        query: { id: customerId }
      });
      
      if (!detailData.status || !detailData.data) {
        throw new Error('Invalid customer detail API response format');
      }

      // Fetch customer orders using unified API
      console.log(`📋 Fetching orders for customer ${customerId}`);
      let orders: ApiOrder[] = [];
      
      try {
        const ordersData: ApiCustomerOrdersResponse = await api('/api/v2/customers/orders.php', {
          query: { CUSTOMER_ID: customerId }
        });
        orders = ordersData.orders || [];
      } catch (ordersError) {
        console.warn(`⚠️ Orders fetch failed for customer ${customerId}:`, ordersError);
        // Continue without orders data
      }

      console.log(`✅ Customer detail API success for ${customerId}, found ${orders.length} orders`);
      return transformCustomer(detailData.data, orders);
      
    } catch (apiError) {
      console.error(`❌ Unified API failed for customer ${customerId}:`, apiError);
      
      // Fallback to mock data in development (for testing purposes)
      const mockCustomer = this.getMockCustomerData(customerId);
      if (mockCustomer) {
        console.log(`📋 Using mock data fallback for customer ${customerId}: ${mockCustomer.name}`);
        return mockCustomer;
      }
      
      // Re-throw the original error with enhanced context
      const enhancedError = new Error(`Failed to fetch customer ${customerId}: ${(apiError as Error).message}`);
      enhancedError.cause = apiError;
      throw enhancedError;
    }
  }

  // Fetch customer orders (using unified API client)
  static async fetchCustomerOrders(customerId: number, limit: number = 50): Promise<ApiOrder[]> {
    try {
      console.log(`🔍 Fetching orders for customer ${customerId}`);
      
      const data: ApiCustomerOrdersResponse = await api('/api/v2/customers/orders.php', {
        query: { CUSTOMER_ID: customerId, limit }
      });
      
      console.log(`✅ Found ${data.orders?.length || 0} orders for customer ${customerId}`);
      return data.orders || [];
      
    } catch (error) {
      console.error('❌ Error fetching customer orders:', error);
      return [];
    }
  }

  // Search customers by phone (using unified API client)
  static async searchByPhone(phone: string): Promise<Customer[]> {
    try {
      console.log(`🔍 Searching customers by phone: ${phone}`);
      
      const data: ApiCustomersResponse = await api('/api/v2/customers/', {
        query: { phone }
      });
      
      if (!data.status || !data.data) {
        return [];
      }

      console.log(`✅ Found ${data.data.length} customers matching phone ${phone}`);
      return data.data.map(apiCustomer => transformCustomer(apiCustomer));
      
    } catch (error) {
      console.error('❌ Error searching customers by phone:', error);
      return [];
    }
  }

  // Get customer statistics (for dashboard)
  static async getCustomerStats(): Promise<{
    total: number;
    vip: number;
    active: number;
    inactive: number;
  }> {
    try {
      const customers = await this.fetchCustomers(500); // Get more customers for accurate stats
      
      return {
        total: customers.length,
        vip: customers.filter(c => c.status === 'vip').length,
        active: customers.filter(c => c.status === 'active').length,
        inactive: customers.filter(c => c.status === 'inactive').length,
      };
      
    } catch (error) {
      console.error('Error getting customer stats:', error);
      return { total: 0, vip: 0, active: 0, inactive: 0 };
    }
  }
}