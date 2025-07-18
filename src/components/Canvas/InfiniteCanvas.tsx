import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import { useGesture } from '@use-gesture/react';
import { EnterpriseNote } from '../Note/EnterpriseNote';
import { useCanvasStore } from '../../store/canvasStore';
import { useNoteEditor } from '../../hooks/useNoteEditor';
import Konva from 'konva';
import { getPerformanceMode, isMobile, isTouch } from '../../utils/device';
import { useMobileOptimizations } from '../../hooks/useMobileOptimizations';

export const InfiniteCanvas = React.memo(() => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  const notes = useCanvasStore((state) => state.notes);
  const viewport = useCanvasStore((state) => state.viewport);
  const setViewport = useCanvasStore((state) => state.setViewport);
  const addNote = useCanvasStore((state) => state.addNote);
  const selectNote = useCanvasStore((state) => state.selectNote);
  const updateNote = useCanvasStore((state) => state.updateNote);
  
  // Device optimizations
  const performanceMode = useMemo(() => getPerformanceMode(), []);
  const isMobileDevice = useMemo(() => isMobile(), []);
  const isTouchDevice = useMemo(() => isTouch(), []);
  
  // Apply mobile optimizations
  useMobileOptimizations();
  
  // RAF for smooth viewport updates
  const rafId = useRef<number | null>(null);
  const pendingViewport = useRef<typeof viewport | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const updateThrottle = performanceMode === 'low' ? 32 : 16; // 30fps vs 60fps
  
  // Check if any note is currently being resized or dragged
  const [isAnyNoteResizing, setIsAnyNoteResizing] = useState(false);
  const [isAnyNoteDragging, setIsAnyNoteDragging] = useState(false);
  
  // Editor state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const editingNote = notes.find(note => note.id === editingNoteId);
  const { isEditing, startEditing, EditorComponent } = useNoteEditor(
    stageRef,
    editingNote || null,
    updateNote,
    () => setEditingNoteId(null)
  );
  
  // Start editing when note is selected
  useEffect(() => {
    if (editingNoteId && editingNote && !isEditing) {
      startEditing();
    }
  }, [editingNoteId, editingNote, isEditing, startEditing]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State to track if we're dragging the canvas
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  
  // Prevent canvas drag when notes are interacted with
  useEffect(() => {
    if (isAnyNoteDragging || isAnyNoteResizing) {
      setIsCanvasDragging(false);
    }
  }, [isAnyNoteDragging, isAnyNoteResizing]);

  // Optimized viewport update with throttling for mobile
  const updateViewportRAF = useCallback((newViewport: typeof viewport) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    
    // Throttle updates on low performance mode
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
    
    // Immediate update for high performance mode
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
  }, [setViewport, performanceMode, updateThrottle]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Pan and zoom gestures
  useGesture(
    {
      onWheel: ({ delta: [, dy], event }) => {
        if (isMobileDevice) return; // Disable wheel zoom on mobile
        
        // Prevent default to avoid bounce on Mac
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
        // Don't start canvas drag if any note is being resized or dragged
        if (isAnyNoteResizing || isAnyNoteDragging) return;
        
        // Check if clicking on canvas (not on a note)
        const target = event.target as HTMLElement;
        if (target.tagName === 'CANVAS') {
          const stage = stageRef.current;
          if (stage) {
            const pos = stage.getPointerPosition();
            if (pos) {
              const shape = stage.getIntersection(pos);
              // Only start canvas drag if we're definitely not on a shape
              if (!shape) {
                setIsCanvasDragging(true);
              }
            }
          }
        }
      },
      onDrag: ({ delta: [dx, dy], pinching, event }) => {
        if (pinching || !isCanvasDragging || isAnyNoteResizing || isAnyNoteDragging) return;
        
        // Double check we're still dragging the canvas
        const target = event.target as HTMLElement;
        if (target.tagName !== 'CANVAS') {
          setIsCanvasDragging(false);
          return;
        }
        
        updateViewportRAF({
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
        passive: !isTouchDevice, // iOS has issues with passive listeners
      },
    }
  );

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target;
    
    // If clicking on stage (not on a note)
    if (target === stageRef.current || target.parent?.className === 'Layer') {
      selectNote(null);
      // Also ensure canvas dragging is stopped
      setIsCanvasDragging(false);
    }
  }, [selectNote]);

  const handleStageDoubleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only add note if clicking on stage itself
    if (e.target !== e.currentTarget) return;
    
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Convert screen coordinates to canvas coordinates
    const x = (pointer.x - viewport.x) / viewport.scale;
    const y = (pointer.y - viewport.y) / viewport.scale;

    addNote(x, y);
  }, [viewport.x, viewport.y, viewport.scale, addNote]);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ 
      touchAction: 'none',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      cursor: isCanvasDragging ? 'grabbing' : 'grab',
    }}>
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onDblClick={handleStageDoubleClick}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        listening={!isCanvasDragging || performanceMode !== 'low'} // Optimize event handling during drag
        perfectDrawEnabled={performanceMode === 'high'}
        pixelRatio={performanceMode === 'low' ? 1 : window.devicePixelRatio}
      >
        <Layer>
          {notes.map((note) => (
            <EnterpriseNote 
              key={note.id} 
              note={note} 
              isEditing={editingNoteId === note.id}
              onStartEditing={() => setEditingNoteId(note.id)}
              onResizingChange={(isResizing) => {
                setIsAnyNoteResizing(isResizing);
              }}
              onDraggingChange={(isDragging) => {
                setIsAnyNoteDragging(isDragging);
              }}
            />
          ))}
        </Layer>
      </Stage>
      {EditorComponent}
    </div>
  );
});