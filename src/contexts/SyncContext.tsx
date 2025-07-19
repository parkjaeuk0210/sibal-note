import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SyncContextType {
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  lastSyncTime: Date | null;
  syncError: Error | null;
  isSyncing: boolean;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState<SyncContextType['syncStatus']>('idle');
  const [lastSyncTime] = useState<Date | null>(null);
  const [syncError] = useState<Error | null>(null);

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setSyncStatus('syncing');
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    if (!navigator.onLine) {
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value: SyncContextType = {
    syncStatus,
    lastSyncTime,
    syncError,
    isSyncing: syncStatus === 'syncing',
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
};