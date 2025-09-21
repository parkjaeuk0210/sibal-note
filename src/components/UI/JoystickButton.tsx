import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../contexts/StoreProvider';

const MAX_DRAG_DISTANCE = 40;
const VIEWPORT_SPEED = 10;

export const JoystickButton = () => {
  const addNote = useAppStore((state) => state.addNote);
  const viewport = useAppStore((state) => state.viewport);
  const setViewport = useAppStore((state) => state.setViewport);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLongPress, setIsLongPress] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrame = useRef<number | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  const dragOffsetRef = useRef(dragOffset);

  const handleAddNote = () => {
    if (!isDragging && !isLongPress) {
      const centerX = (window.innerWidth / 2 - viewportRef.current.x) / viewportRef.current.scale;
      const centerY = (window.innerHeight / 2 - viewportRef.current.y) / viewportRef.current.scale;
      addNote(centerX - 130, centerY - 90);
    }
  };

  const startDrag = (clientX: number, clientY: number) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    dragStartPos.current = { x: centerX, y: centerY };
    setIsDragging(true);
    setIsLongPress(true);
    
    updateDragPosition(clientX, clientY);
  };

  const updateDragPosition = (clientX: number, clientY: number) => {
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > MAX_DRAG_DISTANCE) {
      const ratio = MAX_DRAG_DISTANCE / distance;
      const limitedOffset = { x: deltaX * ratio, y: deltaY * ratio };
      setDragOffset(limitedOffset);
      dragOffsetRef.current = limitedOffset;
    } else {
      const offset = { x: deltaX, y: deltaY };
      setDragOffset(offset);
      dragOffsetRef.current = offset;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    longPressTimer.current = setTimeout(() => {
      startDrag(e.clientX, e.clientY);
    }, 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    longPressTimer.current = setTimeout(() => {
      startDrag(touch.clientX, touch.clientY);
    }, 200);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateDragPosition(e.clientX, e.clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      updateDragPosition(touch.clientX, touch.clientY);
    }
  };

  const handleEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isDragging) {
      setIsDragging(false);
      const resetOffset = { x: 0, y: 0 };
      setDragOffset(resetOffset);
      dragOffsetRef.current = resetOffset;
    } else if (!isLongPress) {
      handleAddNote();
    }

    setIsLongPress(false);
  };

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  useEffect(() => {
    if (isDragging) {
      const updateViewport = () => {
        const { x, y, scale } = viewportRef.current;
        const { x: offsetX, y: offsetY } = dragOffsetRef.current;
        const normalizedX = offsetX / MAX_DRAG_DISTANCE;
        const normalizedY = offsetY / MAX_DRAG_DISTANCE;

        setViewport({
          x: x - normalizedX * VIEWPORT_SPEED,
          y: y - normalizedY * VIEWPORT_SPEED,
          scale,
        });

        animationFrame.current = requestAnimationFrame(updateViewport);
      };

      animationFrame.current = requestAnimationFrame(updateViewport);
    } else {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [isDragging, setViewport]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
    const handleGlobalEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('mouseup', handleGlobalEnd);
      document.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <div 
      className="fixed right-6 bottom-24"
      style={{ zIndex: 9999 }}
    >
      {isDragging && (
        <div 
          className="absolute w-24 h-24 rounded-full border-2 border-white/20 bg-white/5"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`
          w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full 
          shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group
          ${!isDragging ? 'hover:scale-105 active:scale-95' : ''}
        `}
        style={{ 
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) ${isDragging ? 'scale(0.9)' : ''}`,
          boxShadow: isDragging 
            ? '0 6px 30px rgba(79, 70, 229, 0.6), 0 3px 12px rgba(0, 0, 0, 0.2)'
            : '0 4px 20px rgba(79, 70, 229, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: isDragging ? 'box-shadow 0.2s' : 'all 0.2s',
        }}
        aria-label={isDragging ? "조이스틱 모드" : "새 메모 추가"}
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        
        <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        
        {isDragging && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            조이스틱 모드
          </div>
        )}
      </button>
    </div>
  );
};
