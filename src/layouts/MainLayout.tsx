import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Warehouse, Users, User, BarChart } from 'lucide-react';

interface TabItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs: TabItem[] = [
    {
      key: 'products',
      label: 'Товары',
      icon: <Package className="w-5 h-5" />,
      path: '/products',
    },
    {
      key: 'orders',
      label: 'Заказы',
      icon: <ShoppingCart className="w-5 h-5" />,
      path: '/orders',
    },
    {
      key: 'inventory',
      label: 'Склад',
      icon: <Warehouse className="w-5 h-5" />,
      path: '/inventory',
    },
    {
      key: 'customers',
      label: 'Клиенты',
      icon: <Users className="w-5 h-5" />,
      path: '/customers',
    },
    {
      key: 'profile',
      label: 'Профиль',
      icon: <User className="w-5 h-5" />,
      path: '/profile',
    },
  ];

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/products') || path === '/') return 'products';
    if (path.startsWith('/orders')) return 'orders';
    if (path.startsWith('/inventory')) return 'inventory';
    if (path.startsWith('/customers')) return 'customers';
    if (path.startsWith('/profile')) return 'profile';
    return 'products';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 pb-16">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.path)}
              className={`flex flex-col items-center justify-center px-3 py-2 flex-1 transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Button - Floating */}
        <button
          onClick={handleDashboardClick}
          className="absolute -top-8 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <BarChart className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}