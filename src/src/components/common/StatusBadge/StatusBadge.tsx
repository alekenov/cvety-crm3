import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const statusVariants = {
  default: 'bg-gray-100 text-gray-600',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700'
};

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${statusVariants[variant]}`}>
      {status}
    </div>
  );
}