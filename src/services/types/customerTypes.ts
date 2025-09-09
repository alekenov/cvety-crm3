// Customer API Types
// Extracted from customerApi.ts to improve maintainability

// API Response Types
export interface ApiCustomer {
  ID: number;
  LOGIN: string;
  NAME?: string;
  LAST_NAME?: string;
  EMAIL?: string;
  PERSONAL_PHONE?: string;
  PERSONAL_CITY?: string;
  // На части эндпоинтов DATE_REGISTER — строка, на части — объект
  DATE_REGISTER?:
    | string
    | {
        value: string;
        text: string;
      };
  ACTIVE?: 'Y' | 'N';
  PERSONAL_NOTES?: string;
  PERSONAL_ZIP?: string;
  PERSONAL_STREET?: string;

  // Доп. статистические поля, которые уже приходят в /api/v2/customers/
  total_orders?: number;
  completed_orders?: number;
  pending_orders?: number;
  total_spent?: number;
  average_order_value?: number;
  last_order_date?: string;
  status?: 'active' | 'vip' | 'inactive';
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

// New REST alias response type for customer orders
export interface ApiCustomerOrdersResponseNew {
  success: boolean;
  status: boolean;
  data: Array<{
    id: number;
    date: string;
    total: number;
    currency: string;
    status_id: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
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
      total: number | null; // Can be null for heuristic pagination
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