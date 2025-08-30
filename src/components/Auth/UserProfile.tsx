import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { logout, signInWithGoogle } from '../../utils/auth';
import { toast } from '../../utils/toast';
import { useTranslation } from '../../contexts/I18nContext';
import { linkWithPopup } from 'firebase/auth';
import { googleProvider } from '../../lib/firebase';

export const UserProfile: React.FC = () => {
  const { user, isAnonymous } = useAuth();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    setShowMenu(false);
  };

  const handleUpgradeAccount = async () => {
    if (!user || !isAnonymous) return;
    
    setIsUpgrading(true);
    try {
      // Link anonymous account with Google
      await linkWithPopup(user, googleProvider);
      setShowMenu(false);
      toast.success('계정이 성공적으로 업그레이드되었습니다!');
    } catch (error: any) {
      console.error('Account upgrade failed:', error);
      if (error.code === 'auth/credential-already-in-use') {
        // If the Google account is already in use, sign in with it instead
        await signInWithGoogle();
      } else {
        toast.error('계정 업그레이드에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsUpgrading(false);
    }
  };

  const displayName = user.displayName || (user.isAnonymous ? t('guestUser') : user.email?.split('@')[0]) || 'User';
  const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff`;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <img
          src={photoURL}
          alt={displayName}
          className="w-8 h-8 rounded-full"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff`;
          }}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[150px] truncate hidden sm:block">
          {displayName}
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {displayName}
              </p>
              {!user.isAnonymous && user.email && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              )}
              {user.isAnonymous && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('guestMode')}
                </p>
              )}
            </div>
            
            {isAnonymous && (
              <button
                onClick={handleUpgradeAccount}
                disabled={isUpgrading}
                className="w-full text-left px-4 py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 border-b border-gray-200 dark:border-gray-700"
              >
                {isUpgrading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    업그레이드 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google 계정으로 전환
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
