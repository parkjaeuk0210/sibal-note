import { useState, RefObject } from 'react';
import { useGesture } from '@use-gesture/react';
import Konva from 'konva';
import { isMobile, isTouch } from '../utils/device';

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
  const isMobileDevice = isMobile();
  const isTouchDevice = isTouch();

  useGesture(
    {
      onWheel: ({ delta: [, dy], event }) => {
        if (isMobileDevice) return;
        
        event.preventDefault();
        
        const stage = stageRef.current;
        if (!stage) return;

        const oldScale = viewport.scale;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const mousePointTo = {
          x: (pointer.x - viewport.x) / oldScale,
          y: (pointer.y - viewport.y) / oldScale,
        };

        const newScale = Math.min(Math.max(0.1, oldScale - dy * 0.001), 5);
        
        updateViewportRAF({
          scale: newScale,
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        });
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
      onPinch: ({ offset: [d], origin: [ox, oy] }) => {
        const newScale = Math.min(Math.max(0.1, d / 200), 5);
        const stage = stageRef.current;
        if (!stage) return;

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
    },
    {
      target: containerRef,
      drag: { 
        filterTaps: true,
        from: () => [viewport.x, viewport.y],
        enabled: !isAnyNoteResizing && !isAnyNoteDragging,
        threshold: isMobileDevice ? 10 : 5,
      },
      pinch: { from: () => [viewport.scale * 200, 0] },
      eventOptions: {
        passive: !isTouchDevice,
      },
    }
  );

  return {
    isCanvasDragging,
    setIsCanvasDragging,
  };
};