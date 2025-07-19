import { useCallback, RefObject } from 'react';
import Konva from 'konva';

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

interface UseCanvasHandlersProps {
  stageRef: RefObject<Konva.Stage | null>;
  viewport: Viewport;
  selectNote: (id: string | null) => void;
  selectImage: (id: string | null) => void;
  selectFile: (id: string | null) => void;
  addNote: (x: number, y: number) => void;
  setIsCanvasDragging: (isDragging: boolean) => void;
}

export const useCanvasHandlers = ({
  stageRef,
  viewport,
  selectNote,
  selectImage,
  selectFile,
  addNote,
  setIsCanvasDragging,
}: UseCanvasHandlersProps) => {
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target;
    
    // If clicking on stage (not on a note)
    if (target === stageRef.current || target.parent?.className === 'Layer') {
      selectNote(null);
      selectImage(null);
      selectFile(null);
      // Also ensure canvas dragging is stopped
      setIsCanvasDragging(false);
    }
  }, [selectNote, selectImage, selectFile, setIsCanvasDragging, stageRef]);

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
  }, [viewport.x, viewport.y, viewport.scale, addNote, stageRef]);

  return {
    handleStageClick,
    handleStageDoubleClick,
  };
};