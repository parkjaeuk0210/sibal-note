import { useAppStore } from '../../contexts/StoreProvider';
import { useEffect } from 'react';

export const DarkModeToggle = () => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const setDarkMode = useAppStore((state) => state.setDarkMode);

  // Initialize from saved theme or system preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('interectnote-theme');
      if (saved === 'dark' || saved === 'light') {
        setDarkMode(saved === 'dark');
        return;
      }
    } catch {}
    // Fallback to system preference if no explicit choice saved
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(!!mq.matches);
      const onChange = (e: MediaQueryListEvent) => {
        // Only auto-follow system if user hasn't explicitly chosen a theme yet
        const saved = localStorage.getItem('interectnote-theme');
        if (!saved) setDarkMode(e.matches);
      };
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    } catch {}
  }, [setDarkMode]);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('interectnote-theme', isDarkMode ? 'dark' : 'light');
    } catch {}
  }, [isDarkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      className="glass-button rounded-full p-2 sm:p-3 hover:scale-105 transition-transform"
      title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
      aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDarkMode ? (
        // Sun icon for light mode
        <svg className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
          />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg className="w-4 sm:w-5 h-4 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
          />
        </svg>
      )}
    </button>
  );
};
