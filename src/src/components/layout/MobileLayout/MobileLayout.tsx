import React, { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileLayout({ children, className = '' }: MobileLayoutProps) {
  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {children}
      </div>
    </div>
  );
}