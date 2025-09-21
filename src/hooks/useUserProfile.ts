import { useCallback, useEffect, useState } from 'react';
import { saveUserProfile, subscribeToUserProfile } from '../lib/database';
import { DEFAULT_USER_PROFILE, UserProfileSettings } from '../types/user';
import { FirebaseUserProfile } from '../types/firebase';

const normalizeProfile = (profile: FirebaseUserProfile | null): UserProfileSettings => ({
  displayName: profile?.displayName ?? DEFAULT_USER_PROFILE.displayName,
  username: profile?.username ?? DEFAULT_USER_PROFILE.username,
  bio: profile?.bio ?? DEFAULT_USER_PROFILE.bio,
  website: profile?.website ?? DEFAULT_USER_PROFILE.website,
  accentColor: profile?.accentColor ?? DEFAULT_USER_PROFILE.accentColor,
  photoURL: profile?.photoURL ?? DEFAULT_USER_PROFILE.photoURL,
  updatedAt: profile?.updatedAt,
});

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfileSettings>(DEFAULT_USER_PROFILE);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(DEFAULT_USER_PROFILE);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserProfile(
      userId,
      (data) => {
        setProfile(normalizeProfile(data));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [userId]);

  const saveProfileData = useCallback(
    async (nextProfile: UserProfileSettings) => {
      if (!userId) {
        return;
      }

      setSaving(true);
      setError(null);
      try {
        await saveUserProfile(userId, nextProfile);
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error('Failed to save profile');
        setError(errorObject);
        throw errorObject;
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  return {
    profile,
    loading,
    saving,
    error,
    saveProfile: saveProfileData,
    setLocalProfile: setProfile,
  };
};
