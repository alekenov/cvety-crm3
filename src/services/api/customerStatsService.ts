// Customer Statistics API Service
// Extracted from customerApi.ts for better organization

import { api } from '../../api/client';
import type {
  Customer,
  ApiCustomersResponse,
  ApiCustomersWithStatsResponse
} from '../types/customerTypes';

import { transformCustomer } from '../utils/customerUtils';

export class CustomerStatsService {
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
      // Import CustomerService to avoid circular dependency
      const { CustomerService } = await import('./customerService');
      const customers = await CustomerService.fetchCustomers(500); // Get more customers for accurate stats
      
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
      total: number | null;
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
        throw new Error('Invalid response from customers with stats API');
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

      console.log(`✅ Loaded ${customers.length} customers with stats (pagination total: ${response.data.pagination.total || 'unknown'})`);
      
      return {
        customers,
        pagination: {
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          pages: response.data.pagination.pages
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching customers with stats:', error);
      
      // No fallback to old method - the new endpoint should work
      throw error;
    }
  }
}