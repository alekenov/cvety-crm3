import React, { ReactNode } from 'react';

interface Tab {
  key: string;
  label: string;
  icon: ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 py-2 flex flex-col items-center justify-center transition-colors ${
              activeTab === tab.key
                ? 'text-gray-900 bg-gray-100'
                : 'text-gray-500'
            }`}
          >
            <div className="w-5 h-5 mb-1">{tab.icon}</div>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}