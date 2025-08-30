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
  const handleStageClick = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Only clear selection when clicking empty space (no shape under pointer)
    const hit = stage.getIntersection(pointer);
    if (!hit) {
      selectNote(null);
      selectImage(null);
      selectFile(null);
      setIsCanvasDragging(false);
    }
  }, [selectNote, selectImage, selectFile, setIsCanvasDragging, stageRef]);

  const handleStageDoubleClick = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // If there is a shape under pointer, treat as editing that shape – do not add a note
    const hit = stage.getIntersection(pointer);
    if (hit) return;

    // Convert screen coordinates to canvas coordinates (empty area)
    const x = (pointer.x - viewport.x) / viewport.scale;
    const y = (pointer.y - viewport.y) / viewport.scale;

    addNote(x, y);
  }, [viewport.x, viewport.y, viewport.scale, addNote, stageRef]);

  return {
    handleStageClick,
    handleStageDoubleClick,
  };
};
