import { useCallback, useRef } from 'react';
import { getPerformanceMode } from '../utils/device';

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

interface UseViewportManagerProps {
  setViewport: (viewport: Viewport) => void;
  isCanvasDragging: boolean;
}

export const useViewportManager = ({ setViewport, isCanvasDragging }: UseViewportManagerProps) => {
  const rafId = useRef<number | null>(null);
  const pendingViewport = useRef<Viewport | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const performanceMode = getPerformanceMode();
  const updateThrottle = performanceMode === 'low' ? 32 : 16; // 30fps vs 60fps

  const updateViewportRAF = useCallback((newViewport: Viewport) => {
    // Direct update for canvas dragging (no throttling)
    if (isCanvasDragging) {
      setViewport(newViewport);
      return;
    }
    
    // Throttled updates for other interactions on mobile
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    
    if (performanceMode === 'low' && timeSinceLastUpdate < updateThrottle) {
      pendingViewport.current = newViewport;
      
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          const elapsed = Date.now() - lastUpdateTime.current;
          if (elapsed >= updateThrottle && pendingViewport.current) {
            setViewport(pendingViewport.current);
            lastUpdateTime.current = Date.now();
            pendingViewport.current = null;
          }
          rafId.current = null;
        });
      }
      return;
    }
    
    // Normal RAF update
    pendingViewport.current = newViewport;
    
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    rafId.current = requestAnimationFrame(() => {
      if (pendingViewport.current) {
        setViewport(pendingViewport.current);
        lastUpdateTime.current = now;
        pendingViewport.current = null;
      }
      rafId.current = null;
    });
  }, [setViewport, performanceMode, updateThrottle, isCanvasDragging]);

  const cleanup = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
  }, []);

  return {
    updateViewportRAF,
    cleanup,
  };
};