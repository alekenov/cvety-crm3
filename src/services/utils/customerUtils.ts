// Customer Utility Functions
// Extracted from customerApi.ts to improve code organization

import type { ApiCustomer, ApiOrder, Customer } from '../types/customerTypes';

// Status determination based on order history
export function determineCustomerStatus(totalOrders: number, totalSpent: number, lastOrderDate?: Date): 'active' | 'vip' | 'inactive' {
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
export function transformCustomer(apiCustomer: ApiCustomer, orders?: ApiOrder[]): Customer {
  // Если уже пришли агрегированные поля — используем их, чтобы не делать N+1
  let totalOrders = 0;
  let totalSpent = 0;
  let lastOrderDate: Date | undefined;

  if (!orders && (apiCustomer.total_orders !== undefined || apiCustomer.total_spent !== undefined)) {
    totalOrders = apiCustomer.total_orders || 0;
    totalSpent = apiCustomer.total_spent || 0;
    if (apiCustomer.last_order_date) {
      const d = new Date(apiCustomer.last_order_date);
      if (!isNaN(d.getTime())) lastOrderDate = d;
    }
  } else if (orders) {
    // Старый путь расчёта по списку заказов
    totalOrders = orders.length;
    totalSpent =
      orders.reduce((sum, order: any) => {
        // Поддержка разных форматов полей в заказах (PRICE/total)
        const price = Number(order.PRICE ?? order.total ?? 0);
        return sum + (isNaN(price) ? 0 : price);
      }, 0) || 0;

    if (orders.length > 0) {
      // Поддержка разных форматов дат (DATE_INSERT.value / date)
      const toDate = (o: any) => new Date(o?.DATE_INSERT?.value ?? o?.date ?? 0);
      const sorted = [...orders].sort((a: any, b: any) => toDate(b).getTime() - toDate(a).getTime());
      const ld = toDate(sorted[0]);
      if (!isNaN(ld.getTime())) lastOrderDate = ld;
    }
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
  if (apiCustomer.DATE_REGISTER) {
    const raw = typeof apiCustomer.DATE_REGISTER === 'string' ? apiCustomer.DATE_REGISTER : apiCustomer.DATE_REGISTER.value;
    const d = new Date(raw);
    memberSince = !isNaN(d.getTime()) ? d : new Date();
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
    status: apiCustomer.status ?? determineCustomerStatus(totalOrders, totalSpent, lastOrderDate),
    notes: apiCustomer.PERSONAL_NOTES,
    address: apiCustomer.PERSONAL_STREET
  };
  
  return result;
}

// Mock data for development/fallback
export function getMockCustomerData(customerId: number): Customer | null {
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