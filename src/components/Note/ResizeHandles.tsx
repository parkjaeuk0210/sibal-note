import { useRef, useMemo } from 'react';
import { Group, Rect } from 'react-konva';
import { Note } from '../../types';
import { getPerformanceMode, isMobile } from '../../utils/device';

interface ResizeHandlesProps {
  note: Note;
  isHovered: boolean;
  isSelected: boolean;
  tempSize?: { width: number; height: number; x?: number; y?: number };
  onResizeMove: (width: number, height: number, x?: number, y?: number) => void;
  onResizeStart: () => void;
  onResizeEnd: (width: number, height: number, x?: number, y?: number) => void;
}

const MIN_WIDTH = 180;
const MIN_HEIGHT = 120;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 500;

export const ResizeHandles = ({
  note,
  isHovered,
  isSelected,
  tempSize,
  onResizeMove,
  onResizeStart,
  onResizeEnd,
}: ResizeHandlesProps) => {
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0, noteX: 0, noteY: 0 });
  const rafId = useRef<number | null>(null);
  const performanceMode = useMemo(() => getPerformanceMode(), []);
  const isMobileDevice = useMemo(() => isMobile(), []);
  
  // Larger handle size on mobile for easier touch
  const HANDLE_SIZE = isMobileDevice ? 16 : 10;
  const lastUpdateTime = useRef<number>(0);
  const updateThrottle = performanceMode === 'low' ? 32 : 16;

  if (!isHovered && !isSelected) return null;

  const currentWidth = tempSize?.width || note.width;
  const currentHeight = tempSize?.height || note.height;

  const getCursor = (handle: string) => {
    const cursors: { [key: string]: string } = {
      'top-left': 'nw-resize',
      'top': 'n-resize',
      'top-right': 'ne-resize',
      'right': 'e-resize',
      'bottom-right': 'se-resize',
      'bottom': 's-resize',
      'bottom-left': 'sw-resize',
      'left': 'w-resize',
    };
    return cursors[handle] || 'default';
  };

  const handles = [
    { name: 'top-left', x: 0, y: 0 },
    { name: 'top', x: currentWidth / 2, y: 0 },
    { name: 'top-right', x: currentWidth, y: 0 },
    { name: 'right', x: currentWidth, y: currentHeight / 2 },
    { name: 'bottom-right', x: currentWidth, y: currentHeight },
    { name: 'bottom', x: currentWidth / 2, y: currentHeight },
    { name: 'bottom-left', x: 0, y: currentHeight },
    { name: 'left', x: 0, y: currentHeight / 2 },
  ];

  return (
    <Group>
      {handles.map((handle) => (
        <Rect
          key={handle.name}
          x={handle.x}
          y={handle.y}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          offsetX={HANDLE_SIZE / 2}
          offsetY={HANDLE_SIZE / 2}
          fill="white"
          stroke="#3B82F6"
          strokeWidth={2}
          cornerRadius={2}
          draggable
          onDragStart={(e) => {
            e.cancelBubble = true;
            const stage = e.target.getStage();
            if (!stage) return;
            
            const pos = stage.getPointerPosition();
            if (!pos) return;
            
            startPos.current = {
              x: pos.x,
              y: pos.y,
              width: note.width,
              height: note.height,
              noteX: note.x,
              noteY: note.y
            };
            
            onResizeStart();
          }}
          onDragMove={(e) => {
            e.cancelBubble = true;
            const stage = e.target.getStage();
            if (!stage) return;

            const pos = stage.getPointerPosition();
            if (!pos) return;
            
            // Cancel previous RAF if exists
            if (rafId.current) {
              cancelAnimationFrame(rafId.current);
            }
            
            // Use RAF for smooth updates
            const now = Date.now();
            const timeSinceLastUpdate = now - lastUpdateTime.current;
            
            // Throttle updates on low performance mode
            if (performanceMode === 'low' && timeSinceLastUpdate < updateThrottle) {
              return;
            }
            
            rafId.current = requestAnimationFrame(() => {
              lastUpdateTime.current = now;
              const deltaX = (pos.x - startPos.current.x) / stage.scaleX();
              const deltaY = (pos.y - startPos.current.y) / stage.scaleY();

              let newWidth = startPos.current.width;
              let newHeight = startPos.current.height;
              let newX = startPos.current.noteX;
              let newY = startPos.current.noteY;

            switch (handle.name) {
              case 'right':
                newWidth = startPos.current.width + deltaX;
                break;
              case 'bottom':
                newHeight = startPos.current.height + deltaY;
                break;
              case 'bottom-right':
                newWidth = startPos.current.width + deltaX;
                newHeight = startPos.current.height + deltaY;
                break;
              case 'left':
                newWidth = startPos.current.width - deltaX;
                newX = startPos.current.noteX + deltaX;
                break;
              case 'top':
                newHeight = startPos.current.height - deltaY;
                newY = startPos.current.noteY + deltaY;
                break;
              case 'top-left':
                newWidth = startPos.current.width - deltaX;
                newHeight = startPos.current.height - deltaY;
                newX = startPos.current.noteX + deltaX;
                newY = startPos.current.noteY + deltaY;
                break;
              case 'top-right':
                newWidth = startPos.current.width + deltaX;
                newHeight = startPos.current.height - deltaY;
                newY = startPos.current.noteY + deltaY;
                break;
              case 'bottom-left':
                newWidth = startPos.current.width - deltaX;
                newHeight = startPos.current.height + deltaY;
                newX = startPos.current.noteX + deltaX;
                break;
            }

            // Apply constraints
            if (newWidth < MIN_WIDTH) {
              if (handle.name.includes('left')) {
                newX = startPos.current.noteX + startPos.current.width - MIN_WIDTH;
              }
              newWidth = MIN_WIDTH;
            }
            if (newWidth > MAX_WIDTH) {
              if (handle.name.includes('left')) {
                newX = startPos.current.noteX + startPos.current.width - MAX_WIDTH;
              }
              newWidth = MAX_WIDTH;
            }
            if (newHeight < MIN_HEIGHT) {
              if (handle.name.includes('top')) {
                newY = startPos.current.noteY + startPos.current.height - MIN_HEIGHT;
              }
              newHeight = MIN_HEIGHT;
            }
            if (newHeight > MAX_HEIGHT) {
              if (handle.name.includes('top')) {
                newY = startPos.current.noteY + startPos.current.height - MAX_HEIGHT;
              }
              newHeight = MAX_HEIGHT;
            }

              // Call resize move with new dimensions
              if (newX !== startPos.current.noteX || newY !== startPos.current.noteY) {
                onResizeMove(newWidth, newHeight, newX, newY);
              } else {
                onResizeMove(newWidth, newHeight);
              }
            });
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true;
            
            const stage = e.target.getStage();
            if (!stage) return;

            const pos = stage.getPointerPosition();
            if (!pos) return;

            const deltaX = (pos.x - startPos.current.x) / stage.scaleX();
            const deltaY = (pos.y - startPos.current.y) / stage.scaleY();

            let finalWidth = startPos.current.width;
            let finalHeight = startPos.current.height;
            let finalX = startPos.current.noteX;
            let finalY = startPos.current.noteY;

            // Calculate final dimensions (same logic as onDragMove)
            switch (handle.name) {
              case 'right':
                finalWidth = startPos.current.width + deltaX;
                break;
              case 'bottom':
                finalHeight = startPos.current.height + deltaY;
                break;
              case 'bottom-right':
                finalWidth = startPos.current.width + deltaX;
                finalHeight = startPos.current.height + deltaY;
                break;
              case 'left':
                finalWidth = startPos.current.width - deltaX;
                finalX = startPos.current.noteX + deltaX;
                break;
              case 'top':
                finalHeight = startPos.current.height - deltaY;
                finalY = startPos.current.noteY + deltaY;
                break;
              case 'top-left':
                finalWidth = startPos.current.width - deltaX;
                finalHeight = startPos.current.height - deltaY;
                finalX = startPos.current.noteX + deltaX;
                finalY = startPos.current.noteY + deltaY;
                break;
              case 'top-right':
                finalWidth = startPos.current.width + deltaX;
                finalHeight = startPos.current.height - deltaY;
                finalY = startPos.current.noteY + deltaY;
                break;
              case 'bottom-left':
                finalWidth = startPos.current.width - deltaX;
                finalHeight = startPos.current.height + deltaY;
                finalX = startPos.current.noteX + deltaX;
                break;
            }

            // Apply constraints
            if (finalWidth < MIN_WIDTH) {
              if (handle.name.includes('left')) {
                finalX = startPos.current.noteX + startPos.current.width - MIN_WIDTH;
              }
              finalWidth = MIN_WIDTH;
            }
            if (finalWidth > MAX_WIDTH) {
              if (handle.name.includes('left')) {
                finalX = startPos.current.noteX + startPos.current.width - MAX_WIDTH;
              }
              finalWidth = MAX_WIDTH;
            }
            if (finalHeight < MIN_HEIGHT) {
              if (handle.name.includes('top')) {
                finalY = startPos.current.noteY + startPos.current.height - MIN_HEIGHT;
              }
              finalHeight = MIN_HEIGHT;
            }
            if (finalHeight > MAX_HEIGHT) {
              if (handle.name.includes('top')) {
                finalY = startPos.current.noteY + startPos.current.height - MAX_HEIGHT;
              }
              finalHeight = MAX_HEIGHT;
            }

            // Reset handle position
            e.target.position({ x: handle.x, y: handle.y });
            
            // Call resize end with final dimensions
            if (finalX !== startPos.current.noteX || finalY !== startPos.current.noteY) {
              onResizeEnd(finalWidth, finalHeight, finalX, finalY);
            } else {
              onResizeEnd(finalWidth, finalHeight);
            }
          }}
          onMouseEnter={(e) => {
            const stage = e.target.getStage();
            if (stage) {
              stage.container().style.cursor = getCursor(handle.name);
            }
          }}
          onMouseLeave={(e) => {
            const stage = e.target.getStage();
            if (stage) {
              stage.container().style.cursor = 'default';
            }
          }}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            e.evt.stopPropagation();
            e.evt.preventDefault();
          }}
          opacity={isMobileDevice ? 0.9 : 0.8}
          shadowColor={performanceMode === 'high' ? "rgba(0, 0, 0, 0.2)" : "transparent"}
          shadowBlur={performanceMode === 'high' ? 4 : 0}
          shadowOffset={{ x: 0, y: performanceMode === 'high' ? 2 : 0 }}
          shadowEnabled={performanceMode === 'high'}
          // Add touch area padding for mobile
          hitStrokeWidth={isMobileDevice ? 20 : 0}
        />
      ))}
    </Group>
  );
};