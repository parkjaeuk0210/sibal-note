import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { Note } from '../../types';
import { useCanvasStore } from '../../store/canvasStore';
import { ResizeHandles } from './ResizeHandles';
import { NOTE_COLORS, PADDING, CORNER_RADIUS, FONT_SIZE, LINE_HEIGHT } from '../../constants/colors';

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
  
  const updateNote = useCanvasStore((state) => state.updateNote);
  const selectNote = useCanvasStore((state) => state.selectNote);
  const isSelected = useCanvasStore((state) => state.selectedNoteId === note.id);
  
  const colors = useMemo(() => NOTE_COLORS[note.color], [note.color]);

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
  }, [isSelected, isHovered, isDragging, isResizing, colors.accent]);

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

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (!isDragging) return;
    
    updateNote(note.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
    
    // Delay resetting isDragging to prevent click event
    setTimeout(() => {
      setIsDragging(false);
      onDraggingChange?.(false);
    }, 50);
  }, [isDragging, updateNote, note.id, onDraggingChange]);

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    
    // Don't process click if we just finished dragging
    if (isDragging) return;
    
    clickCount.current += 1;
    
    if (clickCount.current === 1) {
      // Single click - select note
      selectNote(note.id);
      
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 300);
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
      opacity={isDragging ? 0.85 : isResizing ? 0.9 : 1}
    >
      {/* Single clean card background */}
      <Rect
        width={currentWidth}
        height={currentHeight}
        fill={colors.primary}
        cornerRadius={CORNER_RADIUS}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowBlur={isSelected ? 20 : 8}
        shadowOffset={{ x: 0, y: isSelected ? 6 : 2 }}
        shadowEnabled={!isDragging && !isResizing}
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
          fill="rgba(0, 0, 0, 0.85)"
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