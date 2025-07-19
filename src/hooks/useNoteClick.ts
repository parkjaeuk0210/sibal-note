import { useCallback, useRef, useEffect } from 'react';
import Konva from 'konva';
import { isMobile } from '../utils/device';

interface UseNoteClickProps {
  noteId: string;
  isDragging: boolean;
  isResizing: boolean;
  dragEndFlag: React.MutableRefObject<boolean>;
  selectNote: (id: string) => void;
  onStartEditing?: () => void;
}

export const useNoteClick = ({
  noteId,
  isDragging,
  isResizing,
  dragEndFlag,
  selectNote,
  onStartEditing,
}: UseNoteClickProps) => {
  const clickTimer = useRef<number | null>(null);
  const clickCount = useRef(0);
  const isMobileDevice = isMobile();

  useEffect(() => {
    return () => {
      if (clickTimer.current) {
        window.clearTimeout(clickTimer.current);
      }
    };
  }, []);

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    
    if (isDragging || dragEndFlag.current) return;
    
    clickCount.current += 1;
    
    if (clickCount.current === 1) {
      selectNote(noteId);
      
      clickTimer.current = window.setTimeout(() => {
        clickCount.current = 0;
      }, isMobileDevice ? 300 : 250);
    }
  }, [selectNote, noteId, isDragging, dragEndFlag, isMobileDevice]);

  const handleDoubleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    clickCount.current = 0;
    
    if (!isDragging && !isResizing && onStartEditing) {
      onStartEditing();
    }
  }, [onStartEditing, isDragging, isResizing]);

  return {
    handleClick,
    handleDoubleClick,
  };
};