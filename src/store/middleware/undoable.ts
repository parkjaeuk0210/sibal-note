import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { useHistoryStore } from '../historyStore';

type UndoableOptions = {
  limit?: number;
  trackedActions?: string[];
  excludedActions?: string[];
};

type Write<T, U> = Omit<T, keyof U> & U;
type Cast<T, U> = T extends U ? T : U;

type UndoableImpl = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  initializer: StateCreator<T, Mps, Mcs>,
  options?: UndoableOptions
) => StateCreator<T, Mps, Mcs>;

type Undoable = <T extends object>(
  initializer: StateCreator<T, [], []>,
  options?: UndoableOptions
) => StateCreator<T, [], []>;

declare module 'zustand' {
  interface StoreMutators<S, A> {
    undoable: Write<Cast<S, object>, { undo: () => void; redo: () => void }>;
  }
}

const undoableImpl: UndoableImpl = (initializer, options = {}) => {
  const {
    limit = 50,
    trackedActions = [],
    excludedActions = [
      'selectNote',
      'selectImage', 
      'selectFile',
      'setViewport',
      'toggleDarkMode',
      'setDarkMode',
      'initializeFirebaseSync',
      'cleanupFirebaseSync',
      'setSyncing',
      'setSyncError'
    ]
  } = options;

  return (set, get, store) => {
    const historyStore = useHistoryStore.getState();
    let isUndoingOrRedoing = false;
    let actionName = '';

    const setState = (partial: any, replace?: any, action?: any) => {
      if (isUndoingOrRedoing) {
        set(partial, replace);
        return;
      }

      const prevState = get();
      
      // Call the original set
      set(partial, replace);
      
      const nextState = get();
      
      // Check if state changed in tracked properties
      const hasTrackedChanges = 
        JSON.stringify((prevState as any).notes) !== JSON.stringify((nextState as any).notes) ||
        JSON.stringify((prevState as any).images) !== JSON.stringify((nextState as any).images) ||
        JSON.stringify((prevState as any).files) !== JSON.stringify((nextState as any).files);
      
      // Only track if tracked properties changed
      const shouldTrack = hasTrackedChanges;
      
      if (shouldTrack && !isStateEqual(prevState, nextState)) {
        // Only save the parts we care about for undo/redo
        const snapshot = {
          notes: (nextState as any).notes,
          images: (nextState as any).images,
          files: (nextState as any).files,
        };
        
        historyStore.pushState(snapshot, limit);
      }
    };

    const undo = () => {
      const previousState = historyStore.undo();
      if (previousState) {
        isUndoingOrRedoing = true;
        set(previousState, true);
        isUndoingOrRedoing = false;
      }
    };

    const redo = () => {
      const nextState = historyStore.redo();
      if (nextState) {
        isUndoingOrRedoing = true;
        set(nextState, true);
        isUndoingOrRedoing = false;
      }
    };

    const storeInitializer = initializer(
      (partial, replace, action) => {
        // Intercept all set calls
        if (typeof partial === 'function') {
          setState((state: any) => {
            const newState = partial(state);
            return newState;
          }, replace, action || partial.name);
        } else {
          setState(partial, replace, action);
        }
      },
      get,
      store
    );

    // Add undo and redo methods to the store
    return {
      ...storeInitializer,
      undo,
      redo,
    };
  };
};

// Helper function to check if two states are equal (shallow comparison)
function isStateEqual(state1: any, state2: any): boolean {
  const keys1 = Object.keys(state1);
  const keys2 = Object.keys(state2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (state1[key] !== state2[key]) return false;
  }
  
  return true;
}

export const undoable = undoableImpl as unknown as Undoable;