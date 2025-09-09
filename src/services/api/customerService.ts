// Customer API Service - Core API Methods
// Extracted from customerApi.ts for better organization

import { api } from '../../api/client';
import type {
  Customer,
  ApiCustomersResponse,
  ApiCustomerDetailResponseNew,
  ApiCustomerOrdersResponse,
  ApiCustomerOrdersResponseNew,
  ApiOrder,
  ApiCustomersWithStatsResponse
} from '../types/customerTypes';

import { transformCustomer, getMockCustomerData } from '../utils/customerUtils';
import { getCachedOrders, cacheOrders } from '../cache/customerCache';
import { CustomerOrdersService } from './customerOrdersService';

const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

export class CustomerService {
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
      return await this.fetchCustomerDetailFallback(customerId, apiError);
    }
  }

  // Fallback method for customer detail fetching
  private static async fetchCustomerDetailFallback(customerId: number, originalError: unknown): Promise<Customer> {
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
        // Try new REST alias first
        const { orders: newOrders } = await CustomerOrdersService.fetchCustomerOrdersNew(customerId, 50);
        orders = newOrders;
        console.log(`✅ Found ${orders.length} orders for customer ${customerId} via REST alias`);
      } catch (ordersError) {
        console.warn(`⚠️ New orders endpoint failed for customer ${customerId}, trying legacy:`, ordersError);
        
        // Fallback to legacy method
        try {
          orders = await CustomerOrdersService.fetchCustomerOrders(customerId);
          console.log(`✅ Found ${orders.length} orders for customer ${customerId} via legacy endpoint`);
        } catch (legacyError) {
          console.warn(`⚠️ Legacy orders fetch also failed for customer ${customerId}:`, legacyError);
        }
      }

      return transformCustomer(apiCustomer, orders);
      
    } catch (fallbackError) {
      console.error(`❌ Fallback API also failed for customer ${customerId}:`, fallbackError);
      
      // Final fallback to mock data in development
      const mockCustomer = getMockCustomerData(customerId);
      if (mockCustomer) {
        console.log(`📋 Using mock data fallback for customer ${customerId}: ${mockCustomer.name}`);
        return mockCustomer;
      }
      
      // Re-throw the original error with enhanced context
      const enhancedError = new Error(`Failed to fetch customer ${customerId}: ${(originalError as Error).message}`);
      enhancedError.cause = originalError;
      throw enhancedError;
    }
  }
}