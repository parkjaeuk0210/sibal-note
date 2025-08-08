import { useState, RefObject, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import Konva from 'konva';
import { isMobile, isTouch, isTrackpadEvent, getWheelGestureType, isMacOS } from '../utils/device';

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

interface UseCanvasGesturesProps {
  containerRef: RefObject<HTMLDivElement | null>;
  stageRef: RefObject<Konva.Stage | null>;
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
  updateViewportRAF: (viewport: Viewport) => void;
  isAnyNoteResizing: boolean;
  isAnyNoteDragging: boolean;
}

interface MomentumState {
  velocityX: number;
  velocityY: number;
  animationId: number | null;
}

export const useCanvasGestures = ({
  containerRef,
  stageRef,
  viewport,
  setViewport,
  updateViewportRAF,
  isAnyNoteResizing,
  isAnyNoteDragging,
}: UseCanvasGesturesProps) => {
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const isMobileDevice = isMobile();
  const isTouchDevice = isTouch();
  const isMac = isMacOS();
  
  // Momentum state for smooth scrolling
  const momentumRef = useRef<MomentumState>({
    velocityX: 0,
    velocityY: 0,
    animationId: null,
  });
  
  // Track last gesture time for velocity calculation
  const lastGestureRef = useRef({
    time: 0,
    x: 0,
    y: 0,
  });
  
  // Store viewport in ref to avoid stale closure
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  // Apply momentum animation
  const applyMomentum = useCallback(() => {
    const momentum = momentumRef.current;
    const friction = 0.92; // Deceleration factor
    const minVelocity = 0.5;
    
    if (Math.abs(momentum.velocityX) > minVelocity || Math.abs(momentum.velocityY) > minVelocity) {
      const currentViewport = viewportRef.current;
      setViewport({
        ...currentViewport,
        x: currentViewport.x + momentum.velocityX,
        y: currentViewport.y + momentum.velocityY,
      });
      
      // Apply friction
      momentum.velocityX *= friction;
      momentum.velocityY *= friction;
      
      // Continue animation
      momentum.animationId = requestAnimationFrame(applyMomentum);
    } else {
      // Stop animation
      momentum.velocityX = 0;
      momentum.velocityY = 0;
      if (momentum.animationId) {
        cancelAnimationFrame(momentum.animationId);
        momentum.animationId = null;
      }
    }
  }, [setViewport]);
  
  // Stop momentum
  const stopMomentum = useCallback(() => {
    const momentum = momentumRef.current;
    if (momentum.animationId) {
      cancelAnimationFrame(momentum.animationId);
      momentum.animationId = null;
    }
    momentum.velocityX = 0;
    momentum.velocityY = 0;
  }, []);

  useGesture(
    {
      onWheel: ({ event, delta: [dx, dy], ctrlKey, metaKey, shiftKey }) => {
        if (isMobileDevice) return;
        
        event.preventDefault();
        
        const stage = stageRef.current;
        if (!stage) return;
        
        const isTrackpad = isTrackpadEvent(event as WheelEvent);
        const gestureType = getWheelGestureType(event as WheelEvent);
        
        // Stop any ongoing momentum
        stopMomentum();
        
        if (gestureType === 'zoom' || (!isTrackpad && !shiftKey)) {
          // Zoom behavior (pinch on trackpad or mouse wheel)
          const oldScale = viewport.scale;
          const pointer = stage.getPointerPosition();
          if (!pointer) return;

          const mousePointTo = {
            x: (pointer.x - viewport.x) / oldScale,
            y: (pointer.y - viewport.y) / oldScale,
          };

          // Different zoom speeds for trackpad vs mouse wheel
          const zoomSpeed = isTrackpad ? 0.01 : 0.001;
          const zoomDelta = ctrlKey || metaKey ? -dy : -dy;
          const newScale = Math.min(Math.max(0.1, oldScale + zoomDelta * zoomSpeed), 5);
          
          updateViewportRAF({
            scale: newScale,
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          });
        } else {
          // Pan behavior (2-finger trackpad scroll or shift+wheel)
          const panSpeed = isTrackpad ? 1 : 2;
          // Fix: Correct scroll direction (positive delta moves in positive direction)
          const invertScroll = isMac ? 1 : -1; // Natural scrolling on macOS is already inverted by the OS
          
          setViewport({
            ...viewport,
            x: viewport.x + dx * panSpeed * invertScroll,
            y: viewport.y + dy * panSpeed * invertScroll,
          });
          
          // Calculate velocity for momentum
          if (isTrackpad) {
            const now = Date.now();
            const timeDelta = now - lastGestureRef.current.time;
            
            if (timeDelta > 0 && timeDelta < 100) {
              momentumRef.current.velocityX = dx * panSpeed * invertScroll * 0.5;
              momentumRef.current.velocityY = dy * panSpeed * invertScroll * 0.5;
            }
            
            lastGestureRef.current = { time: now, x: dx, y: dy };
          }
        }
      },
      
      onWheelEnd: () => {
        // Start momentum animation if there's velocity
        const momentum = momentumRef.current;
        if ((Math.abs(momentum.velocityX) > 0.5 || Math.abs(momentum.velocityY) > 0.5) && !momentum.animationId) {
          momentum.animationId = requestAnimationFrame(applyMomentum);
        }
      },
      
      onDragStart: ({ event, touches }) => {
        if (isAnyNoteResizing || isAnyNoteDragging) return;
        
        // Stop any momentum
        stopMomentum();
        
        // Check if it's a 2-finger drag on mobile
        const isTwoFingerDrag = touches === 2;
        
        const target = event.target as HTMLElement;
        if (target.tagName === 'CANVAS' || isTwoFingerDrag) {
          const stage = stageRef.current;
          if (stage) {
            const pos = stage.getPointerPosition();
            if (pos) {
              const shape = stage.getIntersection(pos);
              if (!shape || isTwoFingerDrag) {
                setIsCanvasDragging(true);
              }
            }
          }
        }
      },
      
      onDrag: ({ delta: [dx, dy], pinching, event, touches, velocity: [vx, vy] }) => {
        if (pinching || isAnyNoteResizing || isAnyNoteDragging) return;
        
        // Support 2-finger pan on mobile
        const isTwoFingerPan = touches === 2 && !pinching;
        
        if (!isCanvasDragging && !isTwoFingerPan) return;
        
        const target = event.target as HTMLElement;
        if (target.tagName !== 'CANVAS' && !isTwoFingerPan) {
          setIsCanvasDragging(false);
          return;
        }
        
        setViewport({
          ...viewport,
          x: viewport.x + dx,
          y: viewport.y + dy,
        });
        
        // Store velocity for momentum
        if (isTouchDevice) {
          momentumRef.current.velocityX = vx * 20;
          momentumRef.current.velocityY = vy * 20;
        }
      },
      
      onDragEnd: () => {
        setIsCanvasDragging(false);
        
        // Apply momentum on touch devices
        if (isTouchDevice) {
          const momentum = momentumRef.current;
          if ((Math.abs(momentum.velocityX) > 2 || Math.abs(momentum.velocityY) > 2) && !momentum.animationId) {
            momentum.animationId = requestAnimationFrame(applyMomentum);
          }
        }
      },
      
      onPinchStart: () => {
        setIsPinching(true);
        stopMomentum();
      },
      
      onPinch: ({ offset: [scale], origin: [ox, oy], movement: [mx, my], memo }) => {
        const newScale = Math.min(Math.max(0.1, scale / 200), 5);
        const stage = stageRef.current;
        if (!stage) return;

        // Calculate zoom focal point
        const pointer = { x: ox, y: oy };
        const mousePointTo = {
          x: (pointer.x - viewport.x) / viewport.scale,
          y: (pointer.y - viewport.y) / viewport.scale,
        };
        
        // Support simultaneous pan during pinch
        const panX = mx * 0.5; // Reduce pan sensitivity during pinch
        const panY = my * 0.5;

        updateViewportRAF({
          scale: newScale,
          x: pointer.x - mousePointTo.x * newScale + panX,
          y: pointer.y - mousePointTo.y * newScale + panY,
        });
        
        return memo;
      },
      
      onPinchEnd: () => {
        setIsPinching(false);
      },
    },
    {
      target: containerRef,
      drag: { 
        filterTaps: true,
        from: () => [viewport.x, viewport.y],
        enabled: !isAnyNoteResizing && !isAnyNoteDragging,
        threshold: isMobileDevice ? 10 : 5,
        pointer: { touch: true, mouse: true },
      },
      pinch: { 
        from: () => [viewport.scale * 200, 0],
        scaleBounds: { min: 0.1, max: 5 },
      },
      wheel: {
        preventDefault: true,
      },
      eventOptions: {
        passive: false,
      },
    }
  );

  return {
    isCanvasDragging,
    setIsCanvasDragging,
    isPinching,
  };
};