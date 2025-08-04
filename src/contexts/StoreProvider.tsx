import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useCanvasStore, CanvasStore } from '../store/canvasStore';
import { useFirebaseCanvasStore, FirebaseCanvasStore } from '../store/firebaseCanvasStore';
import { useSharedCanvasStore, SharedCanvasStore } from '../store/sharedCanvasStore';

interface StoreContextType {
  isFirebaseMode: boolean;
  isSharedMode: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const firebaseStore = useFirebaseCanvasStore();
  const sharedStore = useSharedCanvasStore();
  const [isSharedMode, setIsSharedMode] = useState(false);
  
  // Use Firebase mode if user is logged in and not anonymous
  const isFirebaseMode = !loading && !!user && !user.isAnonymous && !isSharedMode;

  // Check if we're in shared canvas mode
  useEffect(() => {
    const checkSharedMode = () => {
      // Check URL for share token
      const pathParts = window.location.pathname.split('/');
      if (pathParts[1] === 'share' && pathParts[2]) {
        setIsSharedMode(true);
      } else {
        // Check if already in a shared canvas
        const sharedCanvasId = sharedStore.canvasId;
        setIsSharedMode(!!sharedCanvasId);
      }
    };

    checkSharedMode();
    
    // Listen for URL changes
    window.addEventListener('popstate', checkSharedMode);
    return () => window.removeEventListener('popstate', checkSharedMode);
  }, [sharedStore.canvasId]);

  useEffect(() => {
    if (isSharedMode) {
      // Handle shared canvas mode
      const pathParts = window.location.pathname.split('/');
      if (pathParts[1] === 'share' && pathParts[2] && user) {
        // Auto-join shared canvas using token
        sharedStore.joinCanvas(pathParts[2]).catch(error => {
          console.error('Failed to join shared canvas:', error);
          setIsSharedMode(false);
        });
      }
    } else if (isFirebaseMode && user) {
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
      } else if (isSharedMode) {
        sharedStore.cleanupSharedCanvas();
      }
    };
  }, [isFirebaseMode, isSharedMode, user?.uid]);

  return (
    <StoreContext.Provider value={{ isFirebaseMode, isSharedMode }}>
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

// All stores share similar interfaces
type AppStore = CanvasStore | FirebaseCanvasStore | SharedCanvasStore;

// Hook to get the appropriate store based on auth state
export function useAppStore<T>(selector: (state: AppStore) => T): T {
  const { isFirebaseMode, isSharedMode } = useStoreMode();
  
  // Use the appropriate store based on mode
  const localResult = useCanvasStore(selector as (state: CanvasStore) => T);
  const firebaseResult = useFirebaseCanvasStore(selector as (state: FirebaseCanvasStore) => T);
  const sharedResult = useSharedCanvasStore(selector as (state: SharedCanvasStore) => T);
  
  if (isSharedMode) {
    return sharedResult;
  } else if (isFirebaseMode) {
    return firebaseResult;
  } else {
    return localResult;
  }
}