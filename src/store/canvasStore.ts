import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, NoteColor, Viewport } from '../types';

interface CanvasStore {
  notes: Note[];
  viewport: Viewport;
  selectedNoteId: string | null;
  
  addNote: (x: number, y: number) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  
  setViewport: (viewport: Viewport) => void;
  
  clearCanvas: () => void;
}

const defaultColors: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set) => ({
      notes: [],
      viewport: { x: 0, y: 0, scale: 1 },
      selectedNoteId: null,
      
      addNote: (x, y) => {
        const newNote: Note = {
          id: `note-${Date.now()}`,
          x,
          y,
          width: 260,
          height: 180,
          content: '',
          color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          notes: [...state.notes, newNote],
          selectedNoteId: newNote.id,
        }));
      },
      
      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        }));
      },
      
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
        }));
      },
      
      selectNote: (id) => {
        set({ selectedNoteId: id });
      },
      
      setViewport: (viewport) => {
        set({ viewport });
      },
      
      clearCanvas: () => {
        set({
          notes: [],
          viewport: { x: 0, y: 0, scale: 1 },
          selectedNoteId: null,
        });
      },
    }),
    {
      name: 'interectnote-storage',
    }
  )
);