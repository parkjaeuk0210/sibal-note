import { useRef, useCallback } from 'react';
import { isMobile } from '../utils/deviceDetection';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const useOptimizedDrag = (
  onDragStart?: (x: number, y: number) => void,
  onDragMove?: (deltaX: number, deltaY: number) => void,
  onDragEnd?: (x: number, y: number) => void
) => {
  const dragState = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  
  const rafId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const mobile = isMobile();
  
  // Throttle updates on mobile
  const MIN_UPDATE_INTERVAL = mobile ? 16 : 0; // ~60fps on mobile
  
  const handleDragMove = useCallback((x: number, y: number) => {
    if (!dragState.current.isDragging) return;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    
    // Skip update if too soon (throttling for mobile)
    if (mobile && timeSinceLastUpdate < MIN_UPDATE_INTERVAL) {
      return;
    }
    
    const deltaX = x - dragState.current.currentX;
    const deltaY = y - dragState.current.currentY;
    
    dragState.current.currentX = x;
    dragState.current.currentY = y;
    lastUpdateTime.current = now;
    
    // Cancel previous RAF if exists
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    // Use RAF for smooth updates
    rafId.current = requestAnimationFrame(() => {
      onDragMove?.(deltaX, deltaY);
    });
  }, [onDragMove, mobile]);
  
  const startDrag = useCallback((x: number, y: number) => {
    dragState.current = {
      isDragging: true,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    };
    lastUpdateTime.current = Date.now();
    onDragStart?.(x, y);
  }, [onDragStart]);
  
  const endDrag = useCallback(() => {
    if (!dragState.current.isDragging) return;
    
    const { currentX, currentY } = dragState.current;
    dragState.current.isDragging = false;
    
    // Cancel any pending RAF
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    
    onDragEnd?.(currentX, currentY);
  }, [onDragEnd]);
  
  return {
    startDrag,
    handleDragMove,
    endDrag,
    isDragging: dragState.current.isDragging,
  };
};