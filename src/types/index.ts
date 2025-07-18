export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: NoteColor;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange';

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasState {
  notes: Note[];
  viewport: Viewport;
  selectedNoteId: string | null;
}