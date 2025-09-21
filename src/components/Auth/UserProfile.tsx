import React, { useState } from 'react';
import { linkWithPopup } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';
import { logout, signInWithGoogle } from '../../utils/auth';
import { toast } from '../../utils/toast';
import { googleProvider } from '../../lib/firebase';
import { useUserProfile } from '../../hooks/useUserProfile';
import { ProfileSettingsModal } from './ProfileSettingsModal';

export const UserProfile: React.FC = () => {
  const { user, isAnonymous } = useAuth();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!user) return null;

  const {
    profile,
    loading: profileLoading,
    saving: profileSaving,
    saveProfile,
  } = useUserProfile(user.uid);

  const displayName = profile.displayName
    || user.displayName
    || (user.isAnonymous ? t('guestUser') : user.email?.split('@')[0])
    || 'User';

  const accentColor = profile.accentColor || '#3B82F6';
  const photoURL = profile.photoURL
    || user.photoURL
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${accentColor.replace('#', '')}&color=fff`;

  const handleLogout = async () => {
    await logout();
    setIsModalOpen(false);
  };

  const handleUpgradeAccount = async () => {
    if (!user || !isAnonymous) return;

    setIsUpgrading(true);
    try {
      await linkWithPopup(user, googleProvider);
      toast.success('계정이 성공적으로 업그레이드되었습니다!');
    } catch (error: any) {
      console.error('Account upgrade failed:', error);
      if (error.code === 'auth/credential-already-in-use') {
        await signInWithGoogle();
      } else {
        toast.error('계정 업그레이드에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition hover:shadow-xl dark:bg-gray-800/80"
      >
        <div
          className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white shadow-sm dark:border-gray-700"
          style={{ boxShadow: `0 0 0 2px ${accentColor}33` }}
        >
          <img
            src={photoURL}
            alt={displayName}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${accentColor.replace('#', '')}&color=fff`;
            }}
          />
        </div>
        <span className="hidden max-w-[150px] truncate text-sm font-medium text-gray-700 dark:text-gray-200 sm:block">
          {profileLoading ? '로딩 중…' : displayName}
        </span>
      </button>

      <ProfileSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
        onSave={saveProfile}
        isSaving={profileSaving}
        loading={profileLoading}
        user={user}
        onLogout={handleLogout}
        isAnonymous={isAnonymous}
        onUpgradeAccount={isAnonymous ? handleUpgradeAccount : undefined}
        isUpgrading={isUpgrading}
      />
    </>
  );
};
