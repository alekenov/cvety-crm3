import { OrderDetail } from "../components/OrderDetail";

interface OrderDetailPageProps {
  orderId: string;
  onBack: () => void;
  onEdit?: (orderId: string) => void;
  onDelete?: (orderId: string) => void;
}

export function OrderDetailPage(props: OrderDetailPageProps) {
  return <OrderDetail {...props} />;
}