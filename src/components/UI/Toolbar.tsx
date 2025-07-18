import { useCanvasStore } from '../../store/canvasStore';
import { ColorPicker } from './ColorPicker';

export const Toolbar = () => {
  const { notes, selectedNoteId, deleteNote, clearCanvas, viewport, setViewport, updateNote } = useCanvasStore();
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleResetView = () => {
    setViewport({ x: 0, y: 0, scale: 1 });
  };

  const handleDelete = () => {
    if (selectedNoteId) {
      deleteNote(selectedNoteId);
    }
  };


  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 glass rounded-full px-6 py-3 shadow-lg">
      <div className="flex items-center gap-4">
        <button
          onClick={handleResetView}
          className="glass-button rounded-full p-3 hover:scale-105 transition-transform"
          title="뷰 초기화"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <div className="text-sm text-gray-600">
          {notes.length}개 메모 | 배율 {Math.round(viewport.scale * 100)}%
        </div>

        {selectedNote && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            
            <ColorPicker
              currentColor={selectedNote.color}
              onColorChange={(color) => selectedNoteId && updateNote(selectedNoteId, { color })}
            />
            
            <button
              onClick={handleDelete}
              className="glass-button rounded-full p-3 hover:scale-105 transition-transform text-red-500"
              title="메모 삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}

        {notes.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            
            <button
              onClick={() => {
                if (confirm('모든 메모를 삭제하시겠습니까?')) {
                  clearCanvas();
                }
              }}
              className="glass-button rounded-full p-3 hover:scale-105 transition-transform text-gray-600"
              title="모두 지우기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};