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

export type FileType = 'image' | 'pdf' | 'document' | 'other';

export interface CanvasFile {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

export interface CanvasImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
  originalWidth: number;
  originalHeight: number;
  fileName: string;
  fileSize: number;
  createdAt: Date;
}