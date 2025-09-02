import { InventoryItemDetail } from "../components/InventoryItemDetail";

interface InventoryItemDetailPageProps {
  itemId: number;
  onBack: () => void;
  onEdit?: (itemId: number) => void;
}

export function InventoryItemDetailPage(props: InventoryItemDetailPageProps) {
  return <InventoryItemDetail {...props} />;
}