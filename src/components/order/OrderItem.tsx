// Order Item Component
// Extracted from OrderDetail.tsx for better reusability

interface OrderItemProps {
  image: string;
  title: string;
  subtitle?: string;
}

export function OrderItem({ image, title, subtitle }: OrderItemProps) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div 
        className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0"
        style={{ backgroundImage: `url('${image}')` }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-gray-900">{title}</div>
        {subtitle && (
          <div className="text-sm text-gray-600">{subtitle}</div>
        )}
      </div>
    </div>
  );
}