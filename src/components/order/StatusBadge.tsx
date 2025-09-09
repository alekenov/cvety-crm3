// Order Status Badge Component
// Extracted from OrderDetail.tsx for better reusability

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'новый':
        return 'border-red-500 text-red-500';
      case 'оплачен':
        return 'border-blue-500 text-blue-500';
      case 'принят':
        return 'border-pink-500 text-pink-500';
      case 'собран':
        return 'border-yellow-500 text-yellow-500';
      case 'в пути':
        return 'border-green-500 text-green-500';
      default:
        return 'border-gray-500 text-gray-500';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded text-sm bg-gray-100 text-gray-600`}>
      {status}
    </div>
  );
}