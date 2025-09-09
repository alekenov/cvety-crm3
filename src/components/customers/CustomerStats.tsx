// Customer Statistics Component
// Extracted from Customers.tsx for better organization

import { TrendingUp, Users, Star } from "lucide-react";

interface CustomerStatsProps {
  totalCustomers: number;
  vipCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
}

export function CustomerStats({ totalCustomers, vipCustomers, activeCustomers, inactiveCustomers }: CustomerStatsProps) {
  const stats = [
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Всего клиентов',
      value: totalCustomers,
      color: 'text-gray-600'
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Активных',
      value: activeCustomers,
      color: 'text-green-600'
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: 'VIP',
      value: vipCustomers,
      color: 'text-yellow-600'
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Неактивных',
      value: inactiveCustomers,
      color: 'text-gray-500'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 border-b border-gray-200">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-white mb-1 ${stat.color}`}>
            {stat.icon}
          </div>
          <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
          <div className="text-xs text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}