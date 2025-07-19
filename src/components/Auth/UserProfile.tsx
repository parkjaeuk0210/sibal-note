import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../utils/auth';
import { useTranslation } from '../../contexts/I18nContext';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    setShowMenu(false);
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