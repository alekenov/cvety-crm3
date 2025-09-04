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
  id: number;
  number: string;
  date: string;
  total: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  status_id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
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

// New aggregated endpoint response type
export interface ApiCustomerWithStats {
  id: number;
  login: string;
  name: string;
  original_name?: string;
  last_name?: string;
  email?: string;
  phone: string;
  member_since: string;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  total_spent: number;
  last_order_date?: string;
  status: 'active' | 'vip' | 'inactive';
  average_check: number;
}

export interface ApiCustomersWithStatsResponse {
  success: boolean;
  status: boolean;
  data: {
    customers: ApiCustomerWithStats[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    filters: {
      only_with_orders: boolean;
    };
  };
}

// New customer detail endpoint response interface
export interface ApiCustomerDetailResponseNew {
  success: boolean;
  status: boolean;
  data: {
    id: number;
    login: string;
    name: string;
    original_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    member_since?: string;
    total_orders: number;
    completed_orders: number;
    pending_orders: number;
    total_spent: number;
    average_order_value: number;
    last_order_date?: string;
    status: 'active' | 'vip' | 'inactive';
    is_active: boolean;
    orders?: Array<{
      id: number;
      number: string;
      date?: string;
      status: string;
      status_name: string;
      total: number;
      currency: string;
      is_paid: boolean;
      paid_date?: string;
    }>;
  };
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
  ordersLoadFailed?: boolean; // Flag to indicate if order loading failed
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

  // Construct display name with better fallback
  const nameParts = [];
  
  // Filter out "Unknown" and empty values
  if (apiCustomer.NAME && apiCustomer.NAME !== 'Unknown' && apiCustomer.NAME.trim()) {
    nameParts.push(apiCustomer.NAME);
  }
  if (apiCustomer.LAST_NAME && apiCustomer.LAST_NAME !== 'Unknown' && apiCustomer.LAST_NAME.trim()) {
    nameParts.push(apiCustomer.LAST_NAME);
  }
  
  // Better fallback chain: Name → Phone → Email → Login → ID
  let displayName: string;
  if (nameParts.length > 0) {
    displayName = nameParts.join(' ').trim();
  } else if (apiCustomer.PERSONAL_PHONE && apiCustomer.PERSONAL_PHONE !== 'Не указан') {
    // Use phone as display name if no real name
    displayName = apiCustomer.PERSONAL_PHONE;
  } else if (apiCustomer.EMAIL && !apiCustomer.EMAIL.includes('@unemailed')) {
    // Use email if it's not a fake one
    displayName = apiCustomer.EMAIL.split('@')[0];
  } else if (apiCustomer.LOGIN && apiCustomer.LOGIN !== 'Unknown') {
    displayName = apiCustomer.LOGIN;
  } else {
    displayName = `Клиент #${apiCustomer.ID}`;
  }

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

// Cache for customer orders - 60 seconds TTL
const ordersCache = new Map<number, { data: ApiOrder[], timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

// Helper to get cached orders
function getCachedOrders(customerId: number): ApiOrder[] | null {
  const cached = ordersCache.get(customerId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📦 Using cached orders for customer ${customerId}`);
    return cached.data;
  }
  return null;
}

// Helper to cache orders
function cacheOrders(customerId: number, orders: ApiOrder[]): void {
  ordersCache.set(customerId, { data: orders, timestamp: Date.now() });
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
      
      // Optimized batch processing with smaller batch size for stability
      const batchSize = 5; // Reduced from 10 for better stability
      const customersWithOrders = [];
      
      for (let i = 0; i < data.data.length; i += batchSize) {
        const batch = data.data.slice(i, i + batchSize);
        
        const batchResults = await Promise.allSettled(
          batch.map(async (apiCustomer) => {
            try {
              // Add timeout to prevent hanging requests - increased for stability
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout (increased from 5)
              
              try {
                // Check cache first
                const cachedOrders = getCachedOrders(apiCustomer.ID);
                if (cachedOrders !== null) {
                  clearTimeout(timeoutId);
                  return transformCustomer(apiCustomer, cachedOrders);
                }
                
                const ordersData: ApiCustomerOrdersResponse = await api('/api/v2/customers/orders.php', {
                  query: { CUSTOMER_ID: apiCustomer.ID, limit: 50 },
                  signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                const orders = ordersData.orders || [];
                console.log(`✅ Customer ${apiCustomer.ID}: ${orders.length} orders`);
                
                // Cache the orders
                cacheOrders(apiCustomer.ID, orders);
                
                return transformCustomer(apiCustomer, orders);
              } catch (fetchError: any) {
                clearTimeout(timeoutId);
                
                if (fetchError.name === 'AbortError') {
                  console.warn(`⏱️ Timeout fetching orders for customer ${apiCustomer.ID}`);
                } else {
                  console.warn(`⚠️ Failed to fetch orders for customer ${apiCustomer.ID}:`, fetchError.message);
                }
                
                // Return customer without order data but mark as having potential orders
                const customerWithoutOrders = transformCustomer(apiCustomer);
                // Add a flag to indicate orders couldn't be loaded
                (customerWithoutOrders as any).ordersLoadFailed = true;
                return customerWithoutOrders;
              }
            } catch (orderError) {
              console.error(`❌ Unexpected error for customer ${apiCustomer.ID}:`, orderError);
              return transformCustomer(apiCustomer);
            }
          })
        );
        
        customersWithOrders.push(...batchResults);
      }

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
    console.log(`🔍 Fetching customer detail for ID: ${customerId} via new endpoint`);
    
    try {
      // Use the new customer detail endpoint /api/v2/customers/{id}/
      console.log(`📡 Using new customer detail endpoint for customer ${customerId}`);
      
      const customerDetailData: ApiCustomerDetailResponseNew = await api(`/api/v2/customers/${customerId}/`, {
        query: { include_orders: 'true' }
      });
      
      if (!customerDetailData.success || !customerDetailData.data) {
        throw new Error('Invalid customer detail API response format');
      }
      
      const customerData = customerDetailData.data;
      console.log(`✅ Found customer ${customerId} via detail endpoint: ${customerData.name}`);

      // Transform the new API response to match frontend Customer interface
      const memberSince = customerData.member_since ? new Date(customerData.member_since) : new Date();
      const lastOrderDate = customerData.last_order_date ? new Date(customerData.last_order_date) : undefined;

      // Convert API orders to ApiOrder format
      const convertedOrders: ApiOrder[] = (customerData.orders || []).map(order => ({
        id: order.id,
        number: order.number,
        date: order.date || new Date().toISOString(),
        total: order.total,
        status: order.status as any, // Convert string to status enum
        status_id: order.status,
        items: order.items || []
      }));

      const customer: Customer & { orders?: ApiOrder[] } = {
        id: customerData.id,
        name: customerData.name,
        phone: customerData.phone || 'Не указан',
        email: customerData.email,
        memberSince,
        totalOrders: customerData.total_orders,
        totalSpent: customerData.total_spent,
        lastOrderDate,
        status: customerData.status,
        notes: undefined, // Could be added later if needed
        address: undefined, // Could be added later if needed
        orders: convertedOrders
      };

      return customer;
      
    } catch (apiError) {
      console.error(`❌ New API failed for customer ${customerId}:`, apiError);
      
      // Fallback to list API workaround if new endpoint fails
      try {
        console.log(`🔄 Falling back to list API workaround for customer ${customerId}`);
        
        const listData: ApiCustomersResponse = await api('/api/v2/customers/', {
          query: { limit: 100 }
        });
        
        if (!listData.status || !listData.data) {
          throw new Error('Invalid customer list API response format');
        }
        
        const apiCustomer = listData.data.find(c => c.ID === customerId || c.ID === String(customerId));
        
        if (!apiCustomer) {
          console.warn(`⚠️ Customer ${customerId} not found in list API`);
          throw new Error(`Customer ${customerId} not found`);
        }
        
        console.log(`✅ Found customer ${customerId} via list API fallback: ${apiCustomer.NAME || apiCustomer.LOGIN}`);

        let orders: ApiOrder[] = [];
        try {
          const ordersData: ApiCustomerOrdersResponse = await api('/api/v2/customers/orders.php', {
            query: { CUSTOMER_ID: customerId }
          });
          orders = ordersData.orders || [];
          console.log(`✅ Found ${orders.length} orders for customer ${customerId}`);
        } catch (ordersError) {
          console.warn(`⚠️ Orders fetch failed for customer ${customerId}:`, ordersError);
        }

        return transformCustomer(apiCustomer, orders);
        
      } catch (fallbackError) {
        console.error(`❌ Fallback API also failed for customer ${customerId}:`, fallbackError);
        
        // Final fallback to mock data in development
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

  // NEW: Get customers with aggregated statistics (solves N+1 problem)
  static async getCustomersWithStats(
    page: number = 1,
    limit: number = 20,
    onlyWithOrders: boolean = false
  ): Promise<{
    customers: Customer[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    try {
      console.log(`📊 Fetching customers with stats - page: ${page}, limit: ${limit}, onlyWithOrders: ${onlyWithOrders}`);
      
      const response: ApiCustomersWithStatsResponse = await api('/api/v2/customers/with-stats/', {
        query: {
          page,
          limit,
          only_with_orders: onlyWithOrders ? 'true' : 'false'
        }
      });
      
      if (!response.success || !response.data) {
        console.error('❌ Invalid response from customers with stats API');
        return {
          customers: [],
          pagination: { total: 0, page: 1, limit, pages: 0 }
        };
      }

      // Transform aggregated data to frontend format
      const customers: Customer[] = response.data.customers.map(stats => {
        // Parse dates
        const memberSince = new Date(stats.member_since);
        const lastOrderDate = stats.last_order_date ? new Date(stats.last_order_date) : undefined;
        
        return {
          id: stats.id,
          name: stats.name,
          phone: stats.phone || 'Не указан',
          email: stats.email,
          memberSince,
          totalOrders: stats.total_orders,
          totalSpent: stats.total_spent,
          lastOrderDate,
          status: stats.status,
          notes: undefined, // Notes can be loaded separately if needed
          ordersLoadFailed: false // No longer needed - data is pre-aggregated
        };
      });

      console.log(`✅ Loaded ${customers.length} customers with stats (total: ${response.data.pagination.total})`);
      
      return {
        customers,
        pagination: response.data.pagination
      };
      
    } catch (error) {
      console.error('❌ Error fetching customers with stats:', error);
      
      // Fallback to empty result
      return {
        customers: [],
        pagination: { total: 0, page: 1, limit, pages: 0 }
      };
    }
  }
}