import { useCallback, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Konva from 'konva';
import { Note } from '../types';
import { PADDING, FONT_SIZE, LINE_HEIGHT } from '../constants/colors';

interface EditorPortalProps {
  note: Note;
  stageScale: number;
  position: { x: number; y: number };
  onSave: (content: string) => void;
  onClose: () => void;
}

const EditorPortal = ({ note, stageScale, position, onSave, onClose }: EditorPortalProps) => {
  const [value, setValue] = useState(note.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus and select all text when editor opens
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      onSave(value);
      onClose();
    }
    // Stop propagation to prevent canvas shortcuts
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        zIndex: 1000,
      }}
      onClick={handleClick}
      onMouseDown={handleClick}
      onDoubleClick={handleClick}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          onSave(value);
          onClose();
        }}
        style={{
          width: `${(note.width - PADDING * 2) * stageScale}px`,
          height: `${(note.height - PADDING * 2) * stageScale}px`,
          fontSize: `${FONT_SIZE * stageScale}px`,
          border: 'none',
          padding: '0px',
          margin: '0px',
          overflow: 'auto',
          background: 'transparent',
          outline: 'none',
          borderRadius: '0px',
          resize: 'none',
          lineHeight: `${LINE_HEIGHT}`,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif',
          color: 'rgba(0, 0, 0, 0.85)',
        }}
      />
    </div>,
    document.body
  );
};

export const useNoteEditor = (
  stageRef: React.RefObject<Konva.Stage | null>,
  note: Note | null,
  updateNote: (id: string, updates: Partial<Note>) => void,
  onClose?: () => void
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);

  const startEditing = useCallback(() => {
    if (!note || !stageRef.current) return;
    
    const stage = stageRef.current;
    const scale = stage.scaleX();
    const container = stage.container();
    const viewport = { x: stage.x(), y: stage.y() };
    
    // Calculate note position in screen coordinates
    const screenX = note.x * scale + viewport.x;
    const screenY = note.y * scale + viewport.y;
    
    setEditorPosition({
      x: container.offsetLeft + screenX + PADDING * scale,
      y: container.offsetTop + screenY + PADDING * scale,
    });
    
    setStageScale(scale);
    setIsEditing(true);
  }, [stageRef, note]);

  const handleSave = useCallback((content: string) => {
    if (!note) return;
    updateNote(note.id, { content });
  }, [note, updateNote]);

  const handleClose = useCallback(() => {
    setIsEditing(false);
    onClose?.();
  }, [onClose]);

  // Render portal outside of Konva context
  const EditorComponent = isEditing && note ? (
    <EditorPortal
      key={`editor-portal-${note.id}`}
      note={note}
      stageScale={stageScale}
      position={editorPosition}
      onSave={handleSave}
      onClose={handleClose}
    />
  ) : null;

  return {
    isEditing,
    startEditing,
    EditorComponent,
  };
};