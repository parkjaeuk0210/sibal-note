import { useRef } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { ColorPicker } from './ColorPicker';
import { FileType } from '../../types';

export const Toolbar = () => {
  const { 
    notes, 
    selectedNoteId, 
    selectedImageId,
    selectedFileId,
    deleteNote, 
    deleteImage,
    deleteFile,
    clearCanvas, 
    viewport, 
    updateNote,
    addImage,
    addFile
  } = useCanvasStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleDelete = () => {
    if (selectedNoteId) {
      deleteNote(selectedNoteId);
    } else if (selectedImageId) {
      deleteImage(selectedImageId);
    } else if (selectedFileId) {
      deleteFile(selectedFileId);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const fileType = file.type;
        
        // Calculate position for new item
        const x = (window.innerWidth / 2 - viewport.x) / viewport.scale;
        const y = (window.innerHeight / 2 - viewport.y) / viewport.scale;
        
        if (fileType.startsWith('image/')) {
          // Handle image
          const img = new Image();
          img.onload = () => {
            const maxSize = 400;
            let width = img.width;
            let height = img.height;
            
            if (width > maxSize || height > maxSize) {
              const ratio = Math.min(maxSize / width, maxSize / height);
              width *= ratio;
              height *= ratio;
            }
            
            addImage({
              x,
              y,
              width,
              height,
              url,
              originalWidth: img.width,
              originalHeight: img.height,
              fileName: file.name,
              fileSize: file.size,
            });
          };
          img.src = url;
        } else {
          // Handle other files
          let fileTypeCategory: FileType = 'other';
          if (fileType === 'application/pdf') fileTypeCategory = 'pdf';
          else if (fileType.includes('document') || fileType.includes('text')) fileTypeCategory = 'document';
          
          addFile({
            x,
            y,
            width: 200,
            height: 240,
            fileName: file.name,
            fileType: fileTypeCategory,
            fileSize: file.size,
            url,
          });
        }
      };
      
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 glass rounded-full px-6 py-3 shadow-lg">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="glass-button rounded-full p-3 hover:scale-105 transition-transform"
          title="파일 추가"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
        
        {(selectedImageId || selectedFileId) && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            
            <button
              onClick={handleDelete}
              className="glass-button rounded-full p-3 hover:scale-105 transition-transform text-red-500"
              title="삭제"
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