// Default export wrapper for Orders component
import { Orders as OrdersComponent } from './Orders';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const navigate = useNavigate();
  
  const handleAddOrder = () => navigate('/orders/add');
  const handleViewOrder = (orderId: string) => navigate(`/orders/${orderId}`);
  const handleNavigateToDashboard = () => navigate('/dashboard');
  
  return (
    <OrdersComponent 
      onAddOrder={handleAddOrder}
      onViewOrder={handleViewOrder}
      onNavigateToDashboard={handleNavigateToDashboard}
    />
  );
}