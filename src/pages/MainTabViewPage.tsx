import { MainTabView } from "../components/MainTabView";
import { Orders } from "../components/Orders";
import { Inventory } from "../components/Inventory";

interface Product {
  id: number;
  image: string;
  images?: string[];
  title: string;
  price: string;
  isAvailable: boolean;
  createdAt: Date;
  type: 'vitrina' | 'catalog';
  width?: string;
  height?: string;
  video?: string;
  duration?: string;
  discount?: string;
  composition?: Array<{ name: string; count: string }>;
  colors?: string[];
  catalogWidth?: string;
  catalogHeight?: string;
  productionTime?: string;
}

interface MainTabViewPageProps {
  products: Product[];
  onAddProduct: () => void;
  onViewProduct: (id: number) => void;
  onToggleProduct: (id: number) => void;
  onNavigateToDashboard: () => void;
  onViewOrder?: (orderId: string) => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
  onAddOrder?: () => void;
  onAddInventoryItem?: () => void;
  onViewInventoryItem?: (itemId: number) => void;
  onStartInventoryAudit?: () => void;
  ProductsListComponent: React.ComponentType<{
    products: Product[];
    onAddProduct: () => void;
    onViewProduct: (id: number) => void;
    onToggleProduct: (id: number) => void;
  }>;
}

export function MainTabViewPage(props: MainTabViewPageProps) {
  return (
    <MainTabView
      {...props}
      OrdersComponent={Orders}
      InventoryComponent={Inventory}
    />
  );
}