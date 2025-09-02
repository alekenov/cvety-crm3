import { AddInventoryItem } from "../components/AddInventoryItem";

interface AddInventoryItemPageProps {
  onSave: (inventoryData: any) => void;
  onCancel: () => void;
}

export function AddInventoryItemPage(props: AddInventoryItemPageProps) {
  return <AddInventoryItem {...props} />;
}