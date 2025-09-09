// Customer Orders API Service
// Extracted from customerApi.ts for better organization

import { api } from '../../api/client';
import type {
  ApiOrder,
  ApiCustomerOrdersResponse,
  ApiCustomerOrdersResponseNew
} from '../types/customerTypes';

export class CustomerOrdersService {
  // NEW: Fetch customer orders via REST alias (preferred method)
  static async fetchCustomerOrdersNew(customerId: number, limit: number = 50, page: number = 1): Promise<{
    orders: ApiOrder[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> {
    try {
      console.log(`🔍 Fetching orders for customer ${customerId} via REST alias`);
      
      const response: ApiCustomerOrdersResponseNew = await api(`/api/v2/customers/${customerId}/orders`, {
        query: { limit, page }
      });
      
      if (!response.success || !response.data) {
        console.error('❌ Invalid response from customer orders REST alias');
        return { orders: [], pagination: { total: 0, page: 1, limit, pages: 0 } };
      }
      
      // Convert REST alias response to ApiOrder format
      const orders: ApiOrder[] = response.data.map(orderData => ({
        id: orderData.id,
        number: String(orderData.id), // Use ID as number if not provided
        date: orderData.date,
        total: orderData.total,
        status: 'pending', // Default status, could be mapped from status_id
        status_id: orderData.status_id,
        items: [] // Items not included in this endpoint
      }));
      
      console.log(`✅ Found ${orders.length} orders for customer ${customerId} via REST alias`);
      return {
        orders,
        pagination: response.pagination
      };
      
    } catch (error) {
      console.error('❌ Error fetching customer orders via REST alias:', error);
      return { orders: [], pagination: { total: 0, page: 1, limit, pages: 0 } };
    }
  }

  // Fetch customer orders (using unified API client) - LEGACY METHOD
  static async fetchCustomerOrders(customerId: number, limit: number = 50): Promise<ApiOrder[]> {
    try {
      console.log(`🔍 Fetching orders for customer ${customerId} (legacy method)`);
      
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
}