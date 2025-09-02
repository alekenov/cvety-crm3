import { Dashboard } from "../components/Dashboard";

interface DashboardPageProps {
  onBack: () => void;
}

export function DashboardPage(props: DashboardPageProps) {
  return <Dashboard {...props} />;
}