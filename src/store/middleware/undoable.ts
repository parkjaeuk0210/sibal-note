import { StateCreator } from 'zustand';
import { useHistoryStore } from '../historyStore';

// Deep clone helper that preserves Date instances
function deepClone<T>(value: T): T {
  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T;
  }
  if (Array.isArray(value)) {
    // @ts-ignore - map preserves type adequately for our usage
    return value.map((v) => deepClone(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const key of Object.keys(value as Record<string, any>)) {
      // @ts-ignore - index access is safe here
      result[key] = deepClone((value as Record<string, any>)[key]);
    }
    return result as unknown as T;
  }
  return value;
}

type UndoableOptions = {
  limit?: number;
};

type Undoable = <T extends object>(
  initializer: StateCreator<T, [], []>,
  options?: UndoableOptions
) => StateCreator<T, [], []>;

const undoableImpl: Undoable = (initializer, options = {}) => {
  const {
    limit = 50
  } = options;

  return (set, get, store) => {
    const historyStore = useHistoryStore.getState();
    let isUndoingOrRedoing = false;

    const setState = (partial: any, replace?: any) => {
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
        // Deep clone to avoid future mutations leaking into history snapshots
        const snapshot = {
          notes: deepClone((nextState as any).notes),
          images: deepClone((nextState as any).images),
          files: deepClone((nextState as any).files),
          viewport: deepClone((nextState as any).viewport || { x: 0, y: 0, scale: 1 }),
          selectedNoteId: (nextState as any).selectedNoteId || null,
          selectedImageId: (nextState as any).selectedImageId || null,
          selectedFileId: (nextState as any).selectedFileId || null,
        };

        historyStore.pushState(snapshot, limit);
      }
    };

    const undo = () => {
      const previousState = historyStore.undo();
      if (previousState) {
        isUndoingOrRedoing = true;
        const currentState = get() as any;
        // Merge with current state to preserve viewport and other required properties
        const mergedState = {
          ...currentState,
          ...previousState,
          // Ensure viewport always exists
          viewport: previousState.viewport || currentState.viewport || { x: 0, y: 0, scale: 1 },
        };
        set(mergedState, true);
        isUndoingOrRedoing = false;
      }
    };

    const redo = () => {
      const nextState = historyStore.redo();
      if (nextState) {
        isUndoingOrRedoing = true;
        const currentState = get() as any;
        // Merge with current state to preserve viewport and other required properties
        const mergedState = {
          ...currentState,
          ...nextState,
          // Ensure viewport always exists
          viewport: nextState.viewport || currentState.viewport || { x: 0, y: 0, scale: 1 },
        };
        set(mergedState, true);
        isUndoingOrRedoing = false;
      }
    };

    const storeInitializer = initializer(
      setState as any,
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

export const undoable = undoableImpl;
