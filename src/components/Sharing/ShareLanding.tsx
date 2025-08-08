import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSharedCanvasStore } from '../../store/sharedCanvasStore';
import { generateGuestName } from '../../lib/firebase';
import { checkRateLimit, RATE_LIMITS, formatRetryMessage } from '../../utils/rateLimit';

export const ShareLanding: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading, signInAnonymously, isAnonymous } = useAuth();
  const { joinCanvas } = useSharedCanvasStore();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningInAnonymously, setIsSigningInAnonymously] = useState(false);

  useEffect(() => {
    if (!loading && user && token && !isJoining) {
      handleJoinCanvas();
    }
  }, [user, loading, token]);

  const handleJoinCanvas = async () => {
    if (!token || !user) return;
    
    // Check rate limit for canvas join
    const rateLimitCheck = await checkRateLimit(RATE_LIMITS.CANVAS_JOIN);
    if (!rateLimitCheck.allowed) {
      setError(formatRetryMessage(rateLimitCheck.retryAfter || 60));
      return;
    }
    
    setIsJoining(true);
    setError(null);
    
    try {
      // For anonymous users, use generated guest name
      const displayName = isAnonymous ? generateGuestName() : undefined;
      await joinCanvas(token, displayName);
      // Successfully joined, redirect to main app
      navigate('/');
    } catch (err) {
      console.error('Failed to join canvas:', err);
      setError(err instanceof Error ? err.message : '캔버스 참여에 실패했습니다.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleAnonymousJoin = async () => {
    // Check rate limit for anonymous sign-in
    const rateLimitCheck = await checkRateLimit(RATE_LIMITS.ANONYMOUS_SIGNIN);
    if (!rateLimitCheck.allowed) {
      setError(formatRetryMessage(rateLimitCheck.retryAfter || 60));
      return;
    }
    
    setIsSigningInAnonymously(true);
    setError(null);
    
    try {
      await signInAnonymously();
      // After anonymous sign in, the useEffect will trigger handleJoinCanvas
    } catch (err) {
      console.error('Anonymous sign in failed:', err);
      setError('익명 로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSigningInAnonymously(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.464 0m5.464 0a3 3 0 10-5.464 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              공유 캔버스 초대
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              친구가 캔버스를 공유했습니다. 참여하시겠습니까?
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleAnonymousJoin}
              disabled={isSigningInAnonymously}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSigningInAnonymously ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  익명으로 참여 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  바로 참여하기 (게스트)
                </>
              )}
            </button>
            
            <button
              onClick={() => navigate('/', { state: { showLogin: true, shareToken: token } })}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors border border-gray-300 dark:border-gray-600 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google 계정으로 참여
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>💡 게스트 모드 안내</strong><br/>
              • 즉시 협업에 참여할 수 있습니다<br/>
              • 브라우저를 닫으면 접근 권한이 사라집니다<br/>
              • Google 로그인으로 언제든 전환 가능합니다
            </p>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              참여 실패
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            메인 화면으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">캔버스에 참여하는 중...</p>
      </div>
    </div>
  );
};