import { useParams, useNavigate } from "react-router-dom";
import { OrderDetail } from "../components/OrderDetail";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/orders");
  };

  const handleEdit = (orderId: string) => {
    // TODO: Implement edit navigation
    console.log("Edit order:", orderId);
  };

  const handleDelete = (orderId: string) => {
    // After deletion, navigate back to orders list
    navigate("/orders");
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    // Status update is handled by the OrderDetail component
    console.log("Update status:", orderId, newStatus);
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Order ID not found</p>
      </div>
    );
  }

  return (
    <OrderDetail
      orderId={id}
      onClose={handleClose}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}