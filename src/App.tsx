import { useState, useEffect } from 'react';
import { InfiniteCanvas } from './components/Canvas/InfiniteCanvas';
import { Toolbar } from './components/UI/Toolbar';
import { JoystickButton } from './components/UI/JoystickButton';
import { HelpTooltip } from './components/UI/HelpTooltip';
import { ToastContainer } from './components/UI/ToastContainer';
import { DarkModeToggle } from './components/UI/DarkModeToggle';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CanvasErrorBoundary } from './components/CanvasErrorBoundary';
import { LoginModal } from './components/Auth/LoginModal';
import { UserProfile } from './components/Auth/UserProfile';
import { CollaboratorsList } from './components/Sharing/CollaboratorsList';
import { CanvasList } from './components/Canvas/CanvasList';
import { ChatWindow } from './components/Chat/ChatWindow';
import { useAuth } from './contexts/AuthContext';
import { useAppStore, useStoreMode } from './contexts/StoreProvider';
import { useSharedCanvasStore } from './store/sharedCanvasStore';
import { useHistoryStore } from './store/historyStore';
import './styles/glassmorphism.css';
import './styles/dark-mode.css';

function App() {
  const { user } = useAuth();
  const { isSharedMode } = useStoreMode();
  const { canvasInfo } = useSharedCanvasStore();
  const { loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCanvasList, setShowCanvasList] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(true); // Show by default in shared mode
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const canUndo = useHistoryStore((state) => state.canUndo());
  const canRedo = useHistoryStore((state) => state.canRedo());
  const selectedNoteId = useAppStore((state) => state.selectedNoteId);
  const selectedImageId = useAppStore((state) => state.selectedImageId);
  const selectedFileId = useAppStore((state) => state.selectedFileId);
  const deleteNote = useAppStore((state) => state.deleteNote);
  const deleteImage = useAppStore((state) => state.deleteImage);
  const deleteFile = useAppStore((state) => state.deleteFile);
  
  // Check if we need to show login modal from share link
  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.showLogin) {
      setShowLoginModal(true);
      // Store share token for after login
      if (state.shareToken) {
        sessionStorage.setItem('pendingShareToken', state.shareToken);
      }
    }
  }, []);

  // Check if we need to load a shared canvas
  useEffect(() => {
    const canvasId = sessionStorage.getItem('loadSharedCanvas');
    if (canvasId && user) {
      sessionStorage.removeItem('loadSharedCanvas');
      const sharedStore = useSharedCanvasStore.getState();
      sharedStore.initializeSharedCanvas(canvasId);
    }
  }, [user]);

  // Keyboard shortcuts for undo/redo and delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Delete or Backspace for deleting selected note/image/file
      if (e.key === 'Delete' || e.key === 'Backspace') {
        console.log('[App] Delete/Backspace key pressed', {
          selectedNoteId,
          selectedImageId,
          selectedFileId
        });
        e.preventDefault();
        if (selectedNoteId) {
          console.log('[App] Calling deleteNote for:', selectedNoteId);
          deleteNote(selectedNoteId);
        } else if (selectedImageId) {
          console.log('[App] Calling deleteImage for:', selectedImageId);
          deleteImage(selectedImageId);
        } else if (selectedFileId) {
          console.log('[App] Calling deleteFile for:', selectedFileId);
          deleteFile(selectedFileId);
        } else {
          console.log('[App] No item selected to delete');
        }
      }
      // Ctrl+Z for undo
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y or Ctrl+Shift+Z for redo
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedNoteId, selectedImageId, selectedFileId, deleteNote, deleteImage, deleteFile]);

  // Removed automatic login modal - users can now use the app freely
  // and sign in when they want using the Sign In button

  // Gate rendering only while auth is loading (not for Firebase data)
  // Only show loading screen while authentication is being determined
  if (loading) {
    return (
      <ErrorBoundary>
        <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm">불러오는 중…</div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden relative transition-colors duration-300">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none transition-opacity duration-300"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <CanvasErrorBoundary>
          <InfiniteCanvas />
        </CanvasErrorBoundary>
        <Toolbar 
          isSharedMode={isSharedMode}
          showCollaborators={showCollaborators}
          onToggleCollaborators={() => setShowCollaborators(!showCollaborators)}
        />
        <JoystickButton />
        <ChatWindow />
        <HelpTooltip />
        <ToastContainer />
        
        {/* Top bar */}
        <div className="fixed top-3 sm:top-6 left-2 sm:left-6 right-2 sm:right-6 z-50 flex justify-between items-center">
          {/* Left side - Canvas selector, Undo/Redo and Sync status */}
          <div className="flex items-center gap-1 sm:gap-3">
            {user && (
              <button
                onClick={() => setShowCanvasList(true)}
                className="glass-button rounded-full px-2 sm:px-4 py-2 flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform text-gray-700 dark:text-gray-200"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="font-medium text-sm sm:text-base hidden sm:inline">
                  {isSharedMode && canvasInfo ? canvasInfo.name : '내 캔버스'}
                </span>
                {isSharedMode && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 sm:px-2 py-0.5 rounded-full">
                    공유
                  </span>
                )}
              </button>
            )}
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`glass-button rounded-full p-2 sm:p-3 transition-transform text-gray-700 dark:text-gray-200 ${
                  canUndo ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                title="실행 취소 (Ctrl+Z)"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`glass-button rounded-full p-2 sm:p-3 transition-transform text-gray-700 dark:text-gray-200 ${
                  canRedo ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                title="다시 실행 (Ctrl+Y)"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>
            
            {/* <SyncStatus /> */}
          </div>
          
          {/* Right side - Settings */}
          <div className="flex gap-1 sm:gap-3 items-center">
            {user ? (
              <UserProfile />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm sm:text-base rounded-lg transition-colors"
              >
                Sign In
              </button>
            )}
            <DarkModeToggle />
          </div>
        </div>
        
        {/* Login Modal */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
        
        {/* Collaborators List - Only show in shared mode */}
        {isSharedMode && showCollaborators && (
          <CollaboratorsList onClose={() => setShowCollaborators(false)} />
        )}
        
        {/* Canvas List */}
        <CanvasList 
          isOpen={showCanvasList} 
          onClose={() => setShowCanvasList(false)} 
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
