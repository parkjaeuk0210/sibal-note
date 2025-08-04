import { useState, useEffect } from 'react';
import { InfiniteCanvas } from './components/Canvas/InfiniteCanvas';
import { Toolbar } from './components/UI/Toolbar';
import { FloatingButton } from './components/UI/FloatingButton';
import { HelpTooltip } from './components/UI/HelpTooltip';
import { DarkModeToggle } from './components/UI/DarkModeToggle';
import { SyncStatus } from './components/UI/SyncStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CanvasErrorBoundary } from './components/CanvasErrorBoundary';
import { LoginModal } from './components/Auth/LoginModal';
import { UserProfile } from './components/Auth/UserProfile';
import { CollaboratorsList } from './components/Sharing/CollaboratorsList';
import { useAuth } from './contexts/AuthContext';
import { useAppStore, useStoreMode } from './contexts/StoreProvider';
import { useHistoryStore } from './store/historyStore';
import './styles/glassmorphism.css';
import './styles/dark-mode.css';

function App() {
  const { user } = useAuth();
  const { isSharedMode } = useStoreMode();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const canUndo = useHistoryStore((state) => state.canUndo());
  const canRedo = useHistoryStore((state) => state.canRedo());

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
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
  }, [undo, redo]);

  // Removed automatic login modal - users can now use the app freely
  // and sign in when they want using the Sign In button

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
        <Toolbar />
        <FloatingButton />
        <HelpTooltip />
        
        {/* Top bar */}
        <div className="fixed top-6 left-6 right-6 z-50 flex justify-between items-center">
          {/* Left side - Undo/Redo and Sync status */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`glass-button rounded-full p-3 transition-transform ${
                  canUndo ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                title="실행 취소 (Ctrl+Z)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`glass-button rounded-full p-3 transition-transform ${
                  canRedo ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                title="다시 실행 (Ctrl+Y)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>
            
            <SyncStatus />
          </div>
          
          {/* Right side - Settings */}
          <div className="flex gap-3 items-center">
            {user ? (
              <UserProfile />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
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
        {isSharedMode && <CollaboratorsList />}
      </div>
    </ErrorBoundary>
  );
}

export default App;