import React from 'react';
import { useSync } from '../../contexts/SyncContext';
import { useTranslation } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

export const SyncStatus: React.FC = () => {
  const { syncStatus, lastSyncTime } = useSync();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Don't show sync status for anonymous users
  if (!user || user.isAnonymous) return null;

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-600 dark:text-blue-400';
      case 'synced':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'offline':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'synced':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'offline':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return t('syncing');
      case 'synced':
        return t('synced');
      case 'error':
        return t('syncError');
      case 'offline':
        return t('offline');
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg">
      <div className={`flex items-center gap-2 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      {lastSyncTime && syncStatus === 'synced' && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {lastSyncTime.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};