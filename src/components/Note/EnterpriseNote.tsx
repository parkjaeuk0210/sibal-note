import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Group, Rect, Text, Shape } from 'react-konva';
import Konva from 'konva';
import { Note } from '../../types';
import { useCanvasStore } from '../../store/canvasStore';
import { ResizeHandles } from './ResizeHandles';
import { NOTE_COLORS, NOTE_COLORS_DARK, PADDING, CORNER_RADIUS, FONT_SIZE, LINE_HEIGHT } from '../../constants/colors';
import { getPerformanceMode, isMobile } from '../../utils/device';

interface EnterpriseNoteProps {
  note: Note;
  isEditing?: boolean;
  onStartEditing?: () => void;
  onResizingChange?: (isResizing: boolean) => void;
  onDraggingChange?: (isDragging: boolean) => void;
}

export const EnterpriseNote = React.memo(({ note, isEditing = false, onStartEditing, onResizingChange, onDraggingChange }: EnterpriseNoteProps) => {
  const groupRef = useRef<Konva.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [tempSize, setTempSize] = useState<{
    width: number;
    height: number;
    x?: number;
    y?: number;
  } | null>(null);
  
  // Click timer to differentiate single/double click
  const clickTimer = useRef<number | null>(null);
  const clickCount = useRef(0);
  const dragEndFlag = useRef(false);
  
  // Get performance mode
  const performanceMode = useMemo(() => getPerformanceMode(), []);
  const isMobileDevice = useMemo(() => isMobile(), []);
  
  // RAF for mobile optimization
  const rafId = useRef<number | null>(null);
  
  const updateNote = useCanvasStore((state) => state.updateNote);
  const selectNote = useCanvasStore((state) => state.selectNote);
  const isSelected = useCanvasStore((state) => state.selectedNoteId === note.id);
  const isDarkMode = useCanvasStore((state) => state.isDarkMode);
  
  const colors = useMemo(
    () => isDarkMode ? NOTE_COLORS_DARK[note.color] : NOTE_COLORS[note.color], 
    [note.color, isDarkMode]
  );

  // Current dimensions (either temp during resize or actual note dimensions)
  const currentWidth = tempSize?.width || note.width;
  const currentHeight = tempSize?.height || note.height;
  const currentX = tempSize?.x !== undefined ? tempSize.x : note.x;
  const currentY = tempSize?.y !== undefined ? tempSize.y : note.y;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Remove shadow from group since we're handling it on the main rect
    group.setAttrs({
      shadowEnabled: false,
    });

    if (performanceMode === 'high') {
      // Only animate on desktop
      if (isSelected && !isResizing) {
        group.to({
          scaleX: 1.03,
          scaleY: 1.03,
          duration: 0.2,
          easing: Konva.Easings.EaseOut,
        });
      } else {
        group.to({
          scaleX: 1,
          scaleY: 1,
          duration: 0.2,
          easing: Konva.Easings.EaseOut,
        });
      }
    } else {
      // Instant change on mobile
      group.setAttrs({
        scaleX: isSelected && !isResizing ? 1.03 : 1,
        scaleY: isSelected && !isResizing ? 1.03 : 1,
      });
    }
  }, [isSelected, isHovered, isDragging, isResizing, colors.accent, performanceMode]);

  const handleDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    // Don't drag if editing
    if (isEditing) {
      e.target.stopDrag();
      return;
    }
    
    // Allow drag from anywhere on the note
    setIsDragging(true);
    selectNote(note.id);
    onDraggingChange?.(true);
    e.cancelBubble = true;
  }, [selectNote, note.id, isEditing, onDraggingChange]);

  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (!isDragging || !isMobileDevice) return;
    
    // Cancel previous RAF
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    // Use RAF for smoother updates on mobile
    rafId.current = requestAnimationFrame(() => {
      // Force re-render for smoother visual update
      e.target.getLayer()?.batchDraw();
    });
  }, [isDragging, isMobileDevice]);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (!isDragging) return;
    
    // Cancel any pending RAF
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    
    const finalX = e.target.x();
    const finalY = e.target.y();
    
    updateNote(note.id, {
      x: finalX,
      y: finalY,
    });
    
    // Use flag instead of setTimeout for mobile performance
    dragEndFlag.current = true;
    setIsDragging(false);
    onDraggingChange?.(false);
    
    // Reset flag after next frame
    requestAnimationFrame(() => {
      dragEndFlag.current = false;
    });
  }, [isDragging, updateNote, note.id, onDraggingChange]);

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    
    // Don't process click if we just finished dragging
    if (isDragging || dragEndFlag.current) return;
    
    clickCount.current += 1;
    
    if (clickCount.current === 1) {
      // Single click - select note
      selectNote(note.id);
      
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, isMobileDevice ? 300 : 250);
    }
  }, [selectNote, note.id, isDragging]);

  const handleDoubleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    
    // Clear single click timer
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    clickCount.current = 0;
    
    // Start editing only if not dragging or resizing
    if (!isDragging && !isResizing && onStartEditing) {
      onStartEditing();
    }
  }, [onStartEditing, isDragging, isResizing]);


  const handleResizeStart = useCallback(() => {
    // Don't resize if editing
    if (isEditing) return;
    
    setIsResizing(true);
    selectNote(note.id);
    onResizingChange?.(true);
  }, [selectNote, note.id, onResizingChange, isEditing]);

  const handleResizeMove = useCallback((width: number, height: number, x?: number, y?: number) => {
    setTempSize({ width, height, x, y });
  }, []);

  const handleResizeEnd = useCallback((width: number, height: number, x?: number, y?: number) => {
    setIsResizing(false);
    setTempSize(null);
    onResizingChange?.(false);
    
    const updates: Partial<Note> = { width, height };
    if (x !== undefined) updates.x = x;
    if (y !== undefined) updates.y = y;
    updateNote(note.id, updates);
  }, [updateNote, note.id, onResizingChange]);

  return (
    <Group
      ref={groupRef}
      x={currentX}
      y={currentY}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      onTap={handleClick}
      onDblTap={handleDoubleClick}
      onMouseEnter={(e) => {
        e.cancelBubble = true;
        if (!isEditing && !isDragging) {
          setIsHovered(true);
          const stage = e.target.getStage();
          if (stage && !isEditing) {
            stage.container().style.cursor = 'grab';
          }
        }
      }}
      onMouseLeave={(e) => {
        e.cancelBubble = true;
        setIsHovered(false);
        const stage = e.target.getStage();
        if (stage && !isDragging) {
          stage.container().style.cursor = 'default';
        }
      }}
      onMouseDown={(e) => {
        e.cancelBubble = true;
        if (!isEditing) {
          const stage = e.target.getStage();
          if (stage) {
            stage.container().style.cursor = 'grabbing';
          }
        }
      }}
      onMouseUp={(e) => {
        e.cancelBubble = true;
        if (!isEditing && !isDragging) {
          const stage = e.target.getStage();
          if (stage) {
            stage.container().style.cursor = 'grab';
          }
        }
      }}
      opacity={isDragging ? (performanceMode === 'high' ? 0.85 : 0.95) : isResizing ? 0.9 : 1}
      onDragMove={handleDragMove}
    >
      {/* Single clean card background with gradient */}
      <Shape
        sceneFunc={(context) => {
          const gradient = context.createLinearGradient(0, 0, currentWidth * 0.5, currentHeight);
          
          if (isDarkMode) {
            // Dark mode gradients
            switch (note.color) {
              case 'yellow':
                gradient.addColorStop(0, 'rgba(120, 53, 15, 0.95)');
                gradient.addColorStop(0.5, 'rgba(146, 64, 14, 0.88)');
                gradient.addColorStop(1, 'rgba(180, 83, 9, 0.82)');
                break;
              case 'pink':
                gradient.addColorStop(0, 'rgba(131, 24, 67, 0.95)');
                gradient.addColorStop(0.5, 'rgba(159, 18, 57, 0.88)');
                gradient.addColorStop(1, 'rgba(190, 24, 93, 0.82)');
                break;
              case 'blue':
                gradient.addColorStop(0, 'rgba(30, 58, 138, 0.95)');
                gradient.addColorStop(0.5, 'rgba(29, 78, 216, 0.88)');
                gradient.addColorStop(1, 'rgba(37, 99, 235, 0.82)');
                break;
              case 'green':
                gradient.addColorStop(0, 'rgba(20, 83, 45, 0.95)');
                gradient.addColorStop(0.5, 'rgba(22, 101, 52, 0.88)');
                gradient.addColorStop(1, 'rgba(34, 197, 94, 0.82)');
                break;
              case 'purple':
                gradient.addColorStop(0, 'rgba(76, 29, 149, 0.95)');
                gradient.addColorStop(0.5, 'rgba(91, 33, 182, 0.88)');
                gradient.addColorStop(1, 'rgba(124, 58, 237, 0.82)');
                break;
              case 'orange':
                gradient.addColorStop(0, 'rgba(124, 45, 18, 0.95)');
                gradient.addColorStop(0.5, 'rgba(154, 52, 18, 0.88)');
                gradient.addColorStop(1, 'rgba(194, 65, 12, 0.82)');
                break;
            }
          } else {
            // Light mode gradients
            switch (note.color) {
              case 'yellow':
                gradient.addColorStop(0, 'rgba(254, 243, 199, 0.95)');
                gradient.addColorStop(0.5, 'rgba(253, 230, 138, 0.88)');
                gradient.addColorStop(1, 'rgba(252, 211, 77, 0.82)');
                break;
              case 'pink':
                gradient.addColorStop(0, 'rgba(252, 231, 243, 0.95)');
                gradient.addColorStop(0.5, 'rgba(251, 207, 232, 0.88)');
                gradient.addColorStop(1, 'rgba(249, 168, 212, 0.82)');
                break;
              case 'blue':
                gradient.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
                gradient.addColorStop(0.5, 'rgba(186, 230, 253, 0.88)');
                gradient.addColorStop(1, 'rgba(147, 197, 253, 0.82)');
                break;
              case 'green':
                gradient.addColorStop(0, 'rgba(236, 253, 245, 0.95)');
                gradient.addColorStop(0.5, 'rgba(209, 250, 229, 0.88)');
                gradient.addColorStop(1, 'rgba(134, 239, 172, 0.82)');
                break;
              case 'purple':
                gradient.addColorStop(0, 'rgba(243, 232, 255, 0.95)');
                gradient.addColorStop(0.5, 'rgba(233, 213, 255, 0.88)');
                gradient.addColorStop(1, 'rgba(196, 167, 231, 0.82)');
                break;
              case 'orange':
                gradient.addColorStop(0, 'rgba(254, 243, 199, 0.95)');
                gradient.addColorStop(0.5, 'rgba(253, 230, 138, 0.88)');
                gradient.addColorStop(1, 'rgba(251, 191, 36, 0.82)');
                break;
            }
          }
          
          context.beginPath();
          context.roundRect(0, 0, currentWidth, currentHeight, CORNER_RADIUS);
          context.fillStyle = gradient;
          context.fill();
          context.closePath();
        }}
        shadowColor={isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)"}
        shadowBlur={performanceMode === 'high' ? (isSelected ? 20 : 8) : 0}
        shadowOffset={{ x: 0, y: performanceMode === 'high' ? (isSelected ? 6 : 2) : 0 }}
        shadowEnabled={performanceMode === 'high' && !isDragging && !isResizing}
      />



      {/* Content text - hide completely when editing */}
      {!isEditing && (
        <Text
          x={PADDING}
          y={PADDING}
          width={currentWidth - PADDING * 2}
          height={currentHeight - PADDING * 2}
          text={note.content || ''}
          fontSize={FONT_SIZE}
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif"
          fill={isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.85)"}
          wrap="word"
          lineHeight={LINE_HEIGHT}
        />
      )}


      {/* Editing indicator */}
      {isEditing && (
        <Rect
          width={currentWidth}
          height={currentHeight}
          stroke="#3B82F6"
          strokeWidth={2}
          cornerRadius={CORNER_RADIUS}
          fill="transparent"
          dash={[5, 5]}
          shadowEnabled={false}
        />
      )}

      {/* Resize handles */}
      {!isEditing && (
        <ResizeHandles
          note={note}
          isHovered={isHovered}
          isSelected={isSelected}
          tempSize={tempSize || undefined}
          onResizeMove={handleResizeMove}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
        />
      )}
    </Group>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.x === nextProps.note.x &&
    prevProps.note.y === nextProps.note.y &&
    prevProps.note.width === nextProps.note.width &&
    prevProps.note.height === nextProps.note.height &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.color === nextProps.note.color &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.isEditing === nextProps.isEditing
  );
});