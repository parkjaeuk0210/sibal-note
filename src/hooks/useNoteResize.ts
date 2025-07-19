import { useCallback, useState } from 'react';
import { Note } from '../types';

interface UseNoteResizeProps {
  noteId: string;
  isEditing: boolean;
  selectNote: (id: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  onResizingChange?: (isResizing: boolean) => void;
}

export const useNoteResize = ({
  noteId,
  isEditing,
  selectNote,
  updateNote,
  onResizingChange,
}: UseNoteResizeProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [tempSize, setTempSize] = useState<{
    width: number;
    height: number;
    x?: number;
    y?: number;
  } | null>(null);

  const handleResizeStart = useCallback(() => {
    if (isEditing) return;
    
    setIsResizing(true);
    selectNote(noteId);
    onResizingChange?.(true);
  }, [selectNote, noteId, onResizingChange, isEditing]);

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
    updateNote(noteId, updates);
  }, [updateNote, noteId, onResizingChange]);

  return {
    isResizing,
    tempSize,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
  };
};