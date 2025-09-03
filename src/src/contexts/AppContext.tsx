import React, { createContext, useContext, ReactNode } from 'react';
import { useAppState } from '../hooks/useAppState';

type AppStateType = ReturnType<typeof useAppState>;

const AppContext = createContext<AppStateType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const appState = useAppState();
  
  return (
    <AppContext.Provider value={appState}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}