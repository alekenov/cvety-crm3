// Common types used across the application

export interface ProductIngredient {
  inventoryItemId: number;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

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
}

export interface OrderItem {
  productId: number;
  productTitle: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Product {
  id: number;
  image: string;
  images?: string[];
  title: string;
  price: string;
  isAvailable: boolean;
  isReady?: boolean; // Готовый товар (Собранный букет)
  createdAt: Date;
  type: 'vitrina' | 'catalog';
  // Витрина поля
  width?: string;
  height?: string;
  // Каталог поля
  video?: string;
  duration?: string;
  discount?: string;
  ingredients?: ProductIngredient[];
  floristWorkCost?: number;
  colors?: string[];
  catalogWidth?: string;
  catalogHeight?: string;
  productionTime?: string;
  // Обратная совместимость
  composition?: Array<{ name: string; count: string }>;
}

export interface Order {
  id: string;
  number: string;
  status: 'new' | 'paid' | 'accepted' | 'assembled' | 'in-transit' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  mainProduct: Product;
  additionalItems?: OrderItem[];
  recipient: Customer;
  sender: Customer;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  deliveryCity: string;
  deliveryDate: 'today' | 'tomorrow';
  deliveryTime?: string;
  postcard?: string;
  comment?: string;
  anonymous: boolean;
  payment: {
    amount: number;
    status: 'paid' | 'unpaid';
    method?: string;
  };
  executor?: {
    florist?: string;
    courier?: string;
  };
  photoBeforeDelivery?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: 'flowers' | 'greenery' | 'accessories';
  cost: number;
  quantity: number;
  markup: number;
  location: string;
  image: string | null;
  images: string[] | null;
  service: boolean;
  flower: string;
  deactivate: boolean;
  // Computed fields
  unit: string;
  price: string;
  lastDelivery?: Date;
}

// Component prop types
export interface ProductProps extends Product {
  onToggle: (id: number) => void;
  onView: (id: number) => void;
}

export type Screen = 
  | 'main' 
  | 'selector' 
  | 'vitrina-form' 
  | 'catalog-form' 
  | 'product-detail' 
  | 'edit-catalog' 
  | 'dashboard' 
  | 'order-detail' 
  | 'add-order' 
  | 'add-inventory-item' 
  | 'inventory-item-detail' 
  | 'inventory-audit' 
  | 'customer-detail' 
  | 'profile'
  | 'add-customer';