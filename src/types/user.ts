export interface UserProfileSettings {
  displayName: string;
  username: string;
  bio: string;
  website: string;
  accentColor: string;
  photoURL?: string;
  updatedAt?: number;
}

export const DEFAULT_USER_PROFILE: UserProfileSettings = {
  displayName: '',
  username: '',
  bio: '',
  website: '',
  accentColor: '#6366f1',
  photoURL: '',
};
