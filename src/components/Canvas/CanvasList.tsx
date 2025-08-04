import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useStoreMode } from '../../contexts/StoreProvider';
import { useSharedCanvasStore } from '../../store/sharedCanvasStore';
import { getUserSharedCanvases, leaveSharedCanvas } from '../../lib/sharedCanvas';

interface CanvasListProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CanvasItem {
  canvasId: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: number;
  participantCount?: number;
}

export const CanvasList: React.FC<CanvasListProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { isSharedMode } = useStoreMode();
  const { canvasId: currentCanvasId, leaveCanvas } = useSharedCanvasStore();
  const [sharedCanvases, setSharedCanvases] = useState<CanvasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user && isOpen) {
      loadSharedCanvases();
    }
  }, [user, isOpen, refreshKey]);

  const loadSharedCanvases = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const canvases = await getUserSharedCanvases(user.uid);
      setSharedCanvases(canvases);
    } catch (error) {
      console.error('Failed to load shared canvases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToPersonal = () => {
    if (isSharedMode) {
      leaveCanvas();
    }
    window.location.href = '/';
  };

  const handleSwitchToShared = (canvasId: string) => {
    window.location.href = `/`;
    // After redirect, the app will need to load the shared canvas
    sessionStorage.setItem('loadSharedCanvas', canvasId);
  };

  const handleLeaveCanvas = async (canvasId: string) => {
    if (!user || !confirm('이 공유 캔버스에서 나가시겠습니까?')) return;

    try {
      await leaveSharedCanvas(user.uid, canvasId);
      if (currentCanvasId === canvasId) {
        leaveCanvas();
        window.location.href = '/';
      } else {
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '캔버스 나가기 실패');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              내 캔버스
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Personal Canvas */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">개인 캔버스</h3>
            <button
              onClick={handleSwitchToPersonal}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                !isSharedMode 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">내 캔버스</span>
              </div>
            </button>
          </div>

          {/* Shared Canvases */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">공유 캔버스</h3>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : sharedCanvases.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                참여 중인 공유 캔버스가 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {sharedCanvases.map((canvas) => (
                  <div
                    key={canvas.canvasId}
                    className={`p-3 rounded-lg transition-colors ${
                      currentCanvasId === canvas.canvasId
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <button
                      onClick={() => handleSwitchToShared(canvas.canvasId)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.464 0m5.464 0a3 3 0 10-5.464 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-medium">{canvas.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{canvas.role === 'owner' ? '소유자' : canvas.role === 'editor' ? '편집자' : '뷰어'}</span>
                              {canvas.participantCount && (
                                <>
                                  <span>•</span>
                                  <span>👥 {canvas.participantCount}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {canvas.role !== 'owner' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLeaveCanvas(canvas.canvasId);
                            }}
                            className="ml-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="나가기"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};