import { InventoryAudit } from "../components/InventoryAudit";

interface InventoryAuditPageProps {
  onBack: () => void;
  onComplete?: () => void;
}

export function InventoryAuditPage(props: InventoryAuditPageProps) {
  return <InventoryAudit {...props} />;
}