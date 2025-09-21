const normalizeTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const getAppBaseUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_APP_URL?.toString().trim();

  if (import.meta.env.PROD && envUrl) {
    try {
      const parsed = new URL(envUrl);
      return normalizeTrailingSlash(parsed.origin + parsed.pathname);
    } catch (error) {
      console.warn('[url] Invalid VITE_PUBLIC_APP_URL provided, falling back to window.location.origin.', error);
    }
  }

  if (typeof window !== 'undefined' && window.location) {
    return normalizeTrailingSlash(window.location.origin);
  }

  if (envUrl) {
    return normalizeTrailingSlash(envUrl);
  }

  return '';
};

export const buildShareLink = (token: string) => {
  const base = getAppBaseUrl();
  return base ? `${base}/share/${token}` : `/share/${token}`;
};
