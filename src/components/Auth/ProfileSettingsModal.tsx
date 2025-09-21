import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { UserProfileSettings } from '../../types';
import { storageManager } from '../../lib/storageManager';
import { toast } from '../../utils/toast';

const ACCENT_COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f97316', '#0ea5e9', '#facc15', '#a855f7'];
const MAX_BIO_LENGTH = 150;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileSettings;
  onSave: (profile: UserProfileSettings) => Promise<void>;
  isSaving: boolean;
  loading: boolean;
  user: User;
  onLogout: () => Promise<void> | void;
  isAnonymous: boolean;
  onUpgradeAccount?: () => Promise<void>;
  isUpgrading?: boolean;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  isSaving,
  loading,
  user,
  onLogout,
  isAnonymous,
  onUpgradeAccount,
  isUpgrading,
}) => {
  const [form, setForm] = useState<UserProfileSettings>(profile);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      displayName: profile.displayName || user.displayName || '',
      username: profile.username || user.email?.split('@')[0] || '',
      bio: profile.bio || '',
      website: profile.website || '',
      accentColor: profile.accentColor || '#6366f1',
      photoURL: profile.photoURL || user.photoURL || '',
      updatedAt: profile.updatedAt,
    }));
  }, [isOpen, profile, user.displayName, user.email, user.photoURL]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const accentGradient = useMemo(() => {
    const color = form.accentColor || '#6366f1';
    return `linear-gradient(135deg, ${color} 0%, ${color}CC 70%)`;
  }, [form.accentColor]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setLocalError('이미지 파일을 선택해주세요.');
      return;
    }

    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > 5) {
      setLocalError('프로필 사진은 5MB 이하로 업로드해주세요.');
      return;
    }

    setLocalError(null);
    setIsUploadingPhoto(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const downloadUrl = await storageManager.uploadProfileImage(user.uid, dataUrl);
      setForm((prev) => ({
        ...prev,
        photoURL: downloadUrl,
      }));
      toast.success('프로필 사진이 업데이트되었습니다.');
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      setLocalError('프로필 사진 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await storageManager.deleteProfileImage(user.uid);
    } catch (error) {
      console.warn('Failed to delete profile image. Proceeding anyway.', error);
    }

    setForm((prev) => ({
      ...prev,
      photoURL: '',
    }));
  };

  const handleAccentChange = (color: string) => {
    setForm((prev) => ({
      ...prev,
      accentColor: color,
    }));
  };

  const handleChange = (field: keyof UserProfileSettings) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: field === 'username' ? value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase() : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || isSaving) {
      return;
    }

    const trimmedName = form.displayName.trim();
    const trimmedBio = form.bio.trim();
    const trimmedWebsite = form.website.trim();
    const sanitizedUsername = form.username.trim().replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase();

    if (!trimmedName) {
      setLocalError('이름을 입력해주세요.');
      return;
    }

    if (trimmedBio.length > MAX_BIO_LENGTH) {
      setLocalError(`소개는 ${MAX_BIO_LENGTH}자 이하로 작성해주세요.`);
      return;
    }

    setLocalError(null);

    const payload: UserProfileSettings = {
      displayName: trimmedName,
      username: sanitizedUsername,
      bio: trimmedBio,
      website: trimmedWebsite,
      accentColor: form.accentColor || '#6366f1',
      photoURL: form.photoURL,
      updatedAt: Date.now(),
    };

    try {
      await onSave(payload);

      if (user) {
        const updates: { displayName?: string | null; photoURL?: string | null } = {};
        if (user.displayName !== payload.displayName) {
          updates.displayName = payload.displayName;
        }
        if ((user.photoURL || '') !== (payload.photoURL || '')) {
          updates.photoURL = payload.photoURL || null;
        }

        if (Object.keys(updates).length > 0) {
          await updateProfile(user, updates);
        }
      }

      toast.success('프로필이 저장되었습니다.');
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
      setLocalError('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">프로필 설정</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">크리에이터 카드와 공개 정보를 꾸며보세요.</p>
          </div>
          <div className="flex items-center gap-3">
            {localError && (
              <span className="text-sm text-red-500">{localError}</span>
            )}
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isSaving || loading}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isSaving || loading
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isSaving ? '저장 중…' : '저장'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto bg-gray-50/60 p-6 dark:bg-gray-900/60 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <div
              className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl"
              style={{ background: accentGradient }}
            >
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-white/30">
                  {form.photoURL ? (
                    <img src={form.photoURL} alt="프로필 미리보기" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold">
                      {(form.displayName || user.displayName || 'U').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">{form.displayName || 'Your Name'}</span>
                  <span className="text-sm text-white/80">@{form.username || 'username'}</span>
                </div>
              </div>
              {form.bio && (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                  {form.bio}
                </p>
              )}
              {form.website && (
                <a
                  href={form.website.startsWith('http') ? form.website : `https://${form.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-white/90 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-3.197m0 0L18.364 1.16A4 4 0 1121.2 4l-6.364 6.364zm-3.197-3.197L5.636 11.14A4 4 0 108.464 14l6.364-6.364" />
                  </svg>
                  {form.website}
                </a>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">프로필 사진</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">최대 5MB, JPG · PNG · WEBP 지원</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
                  {form.photoURL ? (
                    <img src={form.photoURL} alt="프로필" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-lg font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-200">
                      {(form.displayName || user.displayName || 'U').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
                    disabled={isUploadingPhoto}
                  >
                    {isUploadingPhoto ? '업로드 중…' : '사진 변경'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    기본 이미지로 초기화
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">포인트 컬러</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">프로필 카드와 UI 강조 색상을 선택하세요.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleAccentChange(color)}
                    className={`h-10 w-10 rounded-full border-2 transition ${
                      form.accentColor === color
                        ? 'border-gray-900 shadow-lg dark:border-white'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Accent color ${color}`}
                  />
                ))}
                <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-300 text-xs text-gray-500 transition hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:text-gray-200">
                  직접
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(event) => handleAccentChange(event.target.value)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <form ref={formRef} className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">기본 정보</h3>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">이름</label>
                  <input
                    value={form.displayName}
                    onChange={handleChange('displayName')}
                    placeholder="닉네임"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">사용자 이름</label>
                  <input
                    value={form.username}
                    onChange={handleChange('username')}
                    placeholder="영문, 숫자, 밑줄, 점만 사용"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">소개 (최대 {MAX_BIO_LENGTH}자)</label>
                  <textarea
                    value={form.bio}
                    onChange={handleChange('bio')}
                    rows={4}
                    maxLength={MAX_BIO_LENGTH}
                    placeholder="나를 표현하는 한마디를 적어보세요."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <div className="mt-1 text-right text-xs text-gray-400 dark:text-gray-500">
                    {form.bio.length}/{MAX_BIO_LENGTH}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">웹사이트</label>
                  <input
                    value={form.website}
                    onChange={handleChange('website')}
                    placeholder="예: https://example.com"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">계정</h3>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">로그인 정보</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || '익명 계정'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    로그아웃
                  </button>
                </div>

                {isAnonymous && onUpgradeAccount && (
                  <button
                    type="button"
                    onClick={onUpgradeAccount}
                    disabled={!!isUpgrading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-indigo-600"
                  >
                    {isUpgrading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        업그레이드 중…
                      </>
                    ) : (
                      'Google 계정으로 업그레이드'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
