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
  const hasRemoteCache = useFirebaseCanvasStore((s) => s.remoteReady);
  
  // Preload cached remote snapshot ASAP (before auth resolves) to avoid spinner
  useEffect(() => {
    try {
      const lastUid = localStorage.getItem('remoteCache:lastUserId');
      if (!lastUid) return;
      const cachedRaw = localStorage.getItem(`remoteCache:${lastUid}`);
      if (!cachedRaw) return;
      const parsed = JSON.parse(cachedRaw);
      const cachedNotes = Array.isArray(parsed.notes)
        ? parsed.notes.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt), updatedAt: new Date(n.updatedAt) }))
        : [];
      const cachedImages = Array.isArray(parsed.images)
        ? parsed.images.map((img: any) => ({ ...img, createdAt: new Date(img.createdAt) }))
        : [];
      const cachedFiles = Array.isArray(parsed.files)
        ? parsed.files.map((f: any) => ({ ...f, createdAt: new Date(f.createdAt) }))
        : [];
      const cachedDark = typeof parsed.isDarkMode === 'boolean' ? parsed.isDarkMode : undefined;
      // Set directly into firebase store so UI can render immediately
      useFirebaseCanvasStore.setState({
        notes: cachedNotes,
        images: cachedImages,
        files: cachedFiles,
        ...(cachedDark !== undefined ? { isDarkMode: cachedDark } : {}),
        remoteReady: true,
      } as Partial<FirebaseCanvasStore>);
    } catch (e) {
      // no-op
    }
  }, []);

  // Use Firebase mode if logged in OR we have a cached remote (not in shared mode)
  const isFirebaseMode = (!loading && !!user && !user.isAnonymous && !isSharedMode) || (hasRemoteCache && !isSharedMode);

  // Check if we're in shared canvas mode
  useEffect(() => {
    const checkSharedMode = () => {
      // Check if already in a shared canvas
      const sharedCanvasId = sharedStore.canvasId;
      setIsSharedMode(!!sharedCanvasId);
    };

    checkSharedMode();
  }, [sharedStore.canvasId]);

  useEffect(() => {
    // Hydrate local store only in guest/local mode (no cache, not shared)
    const isGuestLocal = (!user || user.isAnonymous) && !isSharedMode && !hasRemoteCache;
    if (isGuestLocal) {
      try {
        // @ts-ignore zustand persist API present in v5
        (useCanvasStore as any).persist?.rehydrate?.();
      } catch {}
    }

    // Check for pending share token after login
    if (user && !loading) {
      const pendingToken = sessionStorage.getItem('pendingShareToken');
      if (pendingToken) {
        sessionStorage.removeItem('pendingShareToken');
        window.location.href = `/share/${pendingToken}`;
        return;
      }
    }

    if (isSharedMode) {
      // Already in shared mode, no need to do anything
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
  }, [isFirebaseMode, isSharedMode, user?.uid, loading, hasRemoteCache]);

  // If cached remote exists but logged-in user doesn't match, clear cache view to avoid showing wrong data
  useEffect(() => {
    if (!loading && user && hasRemoteCache) {
      try {
        const lastUid = localStorage.getItem('remoteCache:lastUserId');
        if (lastUid && lastUid !== user.uid) {
          useFirebaseCanvasStore.setState({
            notes: [], images: [], files: [], remoteReady: false,
          } as Partial<FirebaseCanvasStore>);
        }
      } catch {}
    }
  }, [loading, user?.uid, hasRemoteCache]);

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
