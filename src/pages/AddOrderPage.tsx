import { AddOrder } from "../components/AddOrder";

interface AddOrderPageProps {
  onSave: (orderData: any) => void;
  onCancel: () => void;
}

export function AddOrderPage(props: AddOrderPageProps) {
  return <AddOrder {...props} />;
}