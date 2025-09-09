// Customer API - Unified Interface
// Main entry point for customer-related API calls
// Refactored from 792 lines to <200 lines for better maintainability

// Re-export types for backward compatibility
export type {
  Customer,
  ApiCustomer,
  ApiOrder,
  ApiCustomersResponse,
  ApiCustomerDetailResponse,
  ApiCustomerOrdersResponse,
  ApiCustomerOrdersResponseNew,
  ApiCustomerWithStats,
  ApiCustomersWithStatsResponse,
  ApiCustomerDetailResponseNew
} from './types/customerTypes';

// Import and re-export utility functions
export {
  determineCustomerStatus,
  transformCustomer,
  getMockCustomerData
} from './utils/customerUtils';

// Import and re-export cache functions
export {
  getCachedOrders,
  cacheOrders,
  clearCustomerCache,
  clearAllCache,
  getCacheStats
} from './cache/customerCache';

// Import services
import { CustomerService } from './api/customerService';
import { CustomerOrdersService } from './api/customerOrdersService';
import { CustomerStatsService } from './api/customerStatsService';

// Main CustomerAPI class - now acts as a facade
export class CustomerAPI {
  // Core customer methods
  static async fetchCustomers(limit?: number, offset?: number, includeOrders?: boolean) {
    return CustomerService.fetchCustomers(limit, offset, includeOrders);
  }

  static async fetchCustomerDetail(customerId: number) {
    return CustomerService.fetchCustomerDetail(customerId);
  }

  // Order-related methods
  static async fetchCustomerOrders(customerId: number, limit?: number) {
    return CustomerOrdersService.fetchCustomerOrders(customerId, limit);
  }

  static async fetchCustomerOrdersNew(customerId: number, limit?: number, page?: number) {
    return CustomerOrdersService.fetchCustomerOrdersNew(customerId, limit, page);
  }

  // Statistics and search methods
  static async searchByPhone(phone: string) {
    return CustomerStatsService.searchByPhone(phone);
  }

  static async getCustomerStats() {
    return CustomerStatsService.getCustomerStats();
  }

  static async getCustomersWithStats(page?: number, limit?: number, onlyWithOrders?: boolean) {
    return CustomerStatsService.getCustomersWithStats(page, limit, onlyWithOrders);
  }
}