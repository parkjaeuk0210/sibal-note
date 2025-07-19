import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage } from 'react-konva';
import { CanvasItems } from './CanvasItems';
import { useCanvasStore } from '../../store/canvasStore';
import { useNoteEditor } from '../../hooks/useNoteEditor';
import { useViewportManager } from '../../hooks/useViewportManager';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { useWindowResize } from '../../hooks/useWindowResize';
import { useCanvasHandlers } from '../../hooks/useCanvasHandlers';
import { useMobileOptimizations } from '../../hooks/useMobileOptimizations';
import Konva from 'konva';
import { getPerformanceMode } from '../../utils/device';

export const InfiniteCanvas = React.memo(() => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get store values
  const notes = useCanvasStore((state) => state.notes);
  const images = useCanvasStore((state) => state.images);
  const files = useCanvasStore((state) => state.files);
  const viewport = useCanvasStore((state) => state.viewport);
  const setViewport = useCanvasStore((state) => state.setViewport);
  const addNote = useCanvasStore((state) => state.addNote);
  const selectNote = useCanvasStore((state) => state.selectNote);
  const updateNote = useCanvasStore((state) => state.updateNote);
  const selectedImageId = useCanvasStore((state) => state.selectedImageId);
  const selectedFileId = useCanvasStore((state) => state.selectedFileId);
  const selectImage = useCanvasStore((state) => state.selectImage);
  const selectFile = useCanvasStore((state) => state.selectFile);
  
  // Device optimizations
  const performanceMode = useMemo(() => getPerformanceMode(), []);
  
  // Apply mobile optimizations
  useMobileOptimizations();
  
  // Window dimensions
  const dimensions = useWindowResize();
  
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
  
  // Temporary canvas dragging state
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  
  // Viewport manager
  const { updateViewportRAF, cleanup } = useViewportManager({
    setViewport,
    isCanvasDragging,
  });
  
  // Canvas gestures
  const canvasGestures = useCanvasGestures({
    containerRef,
    stageRef,
    viewport,
    setViewport,
    updateViewportRAF,
    isAnyNoteResizing,
    isAnyNoteDragging,
  });
  
  // Update canvas dragging state
  useEffect(() => {
    setIsCanvasDragging(canvasGestures.isCanvasDragging);
  }, [canvasGestures.isCanvasDragging]);
  
  // Prevent canvas drag when notes are interacted with
  useEffect(() => {
    if (isAnyNoteDragging || isAnyNoteResizing) {
      canvasGestures.setIsCanvasDragging(false);
    }
  }, [isAnyNoteDragging, isAnyNoteResizing, canvasGestures]);
  
  // Cleanup RAF on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Canvas click handlers
  const { handleStageClick, handleStageDoubleClick } = useCanvasHandlers({
    stageRef,
    viewport,
    selectNote,
    selectImage,
    selectFile,
    addNote,
    setIsCanvasDragging: canvasGestures.setIsCanvasDragging,
  });

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
        <CanvasItems
          notes={notes}
          images={images}
          files={files}
          editingNoteId={editingNoteId}
          selectedImageId={selectedImageId}
          selectedFileId={selectedFileId}
          selectImage={selectImage}
          selectFile={selectFile}
          setEditingNoteId={setEditingNoteId}
          setIsAnyNoteResizing={setIsAnyNoteResizing}
          setIsAnyNoteDragging={setIsAnyNoteDragging}
        />
      </Stage>
      {EditorComponent}
    </div>
  );
});