import { useCallback, useState } from 'react';
import Konva from 'konva';

interface UseNoteHoverProps {
  isEditing: boolean;
  isDragging: boolean;
}

export const useNoteHover = ({ isEditing, isDragging }: UseNoteHoverProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (!isEditing && !isDragging) {
      setIsHovered(true);
      const stage = e.target.getStage();
      if (stage && !isEditing) {
        stage.container().style.cursor = 'grab';
      }
    }
  }, [isEditing, isDragging]);

  const handleMouseLeave = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setIsHovered(false);
    const stage = e.target.getStage();
    if (stage && !isDragging) {
      stage.container().style.cursor = 'default';
    }
  }, [isDragging]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (!isEditing) {
      const stage = e.target.getStage();
      if (stage) {
        stage.container().style.cursor = 'grabbing';
      }
    }
  }, [isEditing]);

  const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (!isEditing && !isDragging) {
      const stage = e.target.getStage();
      if (stage) {
        stage.container().style.cursor = 'grab';
      }
    }
  }, [isEditing, isDragging]);

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
  };
};