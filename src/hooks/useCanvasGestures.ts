import { useState, RefObject } from 'react';
import { useGesture } from '@use-gesture/react';
import Konva from 'konva';
import { isMobile, isTrackpadEvent, getWheelGestureType } from '../utils/device';

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

  useGesture(
    {
      onWheel: ({ event, delta: [dx, dy], ctrlKey, metaKey, shiftKey }) => {
        if (isMobileDevice) return;
        
        event.preventDefault();
        
        const stage = stageRef.current;
        if (!stage) return;
        
        const isTrackpad = isTrackpadEvent(event as WheelEvent);
        const gestureType = getWheelGestureType(event as WheelEvent);
        
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
          // Correct scroll direction
          const scrollDirection = 1; // Keep it simple - same direction for all platforms
          
          setViewport({
            ...viewport,
            x: viewport.x + dx * panSpeed * scrollDirection,
            y: viewport.y + dy * panSpeed * scrollDirection,
          });
        }
      },
      
      onDragStart: ({ event }) => {
        if (isAnyNoteResizing || isAnyNoteDragging) return;
        
        const target = event.target as HTMLElement;
        if (target.tagName === 'CANVAS') {
          const stage = stageRef.current;
          if (stage) {
            const pos = stage.getPointerPosition();
            if (pos) {
              const shape = stage.getIntersection(pos);
              if (!shape) {
                setIsCanvasDragging(true);
              }
            }
          }
        }
      },
      
      onDrag: ({ delta: [dx, dy], pinching, event }) => {
        // Don't handle drag if pinching
        if (pinching || !isCanvasDragging || isAnyNoteResizing || isAnyNoteDragging) return;
        
        const target = event.target as HTMLElement;
        if (target.tagName !== 'CANVAS') {
          setIsCanvasDragging(false);
          return;
        }
        
        setViewport({
          ...viewport,
          x: viewport.x + dx,
          y: viewport.y + dy,
        });
      },
      
      onDragEnd: () => {
        setIsCanvasDragging(false);
      },
      
      onPinchStart: () => {
        setIsPinching(true);
        setIsCanvasDragging(false); // Stop dragging when pinch starts
      },
      
      onPinch: ({ offset: [scale], origin: [ox, oy] }) => {
        const newScale = Math.min(Math.max(0.1, scale / 200), 5);
        const stage = stageRef.current;
        if (!stage) return;

        // Calculate zoom focal point
        const pointer = { x: ox, y: oy };
        const mousePointTo = {
          x: (pointer.x - viewport.x) / viewport.scale,
          y: (pointer.y - viewport.y) / viewport.scale,
        };

        updateViewportRAF({
          scale: newScale,
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        });
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
        pointer: { 
          touch: true, 
          mouse: true,
          // Only allow single touch for drag (not multi-touch)
          keys: false
        },
      },
      pinch: { 
        from: () => [viewport.scale * 200, 0],
        scaleBounds: { min: 0.1, max: 5 },
        rubberband: true,
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