import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useCanvasStore, CanvasStore } from '../store/canvasStore';
import { useFirebaseCanvasStore, FirebaseCanvasStore } from '../store/firebaseCanvasStore';

interface StoreContextType {
  isFirebaseMode: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const firebaseStore = useFirebaseCanvasStore();
  
  // Use Firebase mode if user is logged in and not anonymous
  const isFirebaseMode = !loading && !!user && !user.isAnonymous;

  useEffect(() => {
    if (isFirebaseMode && user) {
      // Initialize Firebase sync
      firebaseStore.initializeFirebaseSync(user.uid);
    } else {
      // Cleanup Firebase sync when logged out
      firebaseStore.cleanupFirebaseSync();
    }

    return () => {
      // Cleanup on unmount
      if (isFirebaseMode) {
        firebaseStore.cleanupFirebaseSync();
      }
    };
  }, [isFirebaseMode, user?.uid]);

  return (
    <StoreContext.Provider value={{ isFirebaseMode }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreMode = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreMode must be used within StoreProvider');
  }
  return context;
};

// Both stores share the same interface
type AppStore = CanvasStore | FirebaseCanvasStore;

// Hook to get the appropriate store based on auth state
export function useAppStore<T>(selector: (state: AppStore) => T): T {
  const { isFirebaseMode } = useStoreMode();
  
  // Use the appropriate store based on auth state
  const localResult = useCanvasStore(selector as (state: CanvasStore) => T);
  const firebaseResult = useFirebaseCanvasStore(selector as (state: FirebaseCanvasStore) => T);
  
  return isFirebaseMode ? firebaseResult : localResult;
}