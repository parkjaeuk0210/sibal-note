import { useCanvasStore } from '../../store/canvasStore';

export const FloatingButton = () => {
  const { addNote, viewport } = useCanvasStore();

  const handleAddNote = () => {
    console.log('Button clicked!');
    const centerX = (window.innerWidth / 2 - viewport.x) / viewport.scale;
    const centerY = (window.innerHeight / 2 - viewport.y) / viewport.scale;
    addNote(centerX - 130, centerY - 90);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-20 pointer-events-none" style={{ zIndex: 9999 }}>
      <button
        onClick={handleAddNote}
        className="pointer-events-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
        aria-label="새 메모 추가"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};