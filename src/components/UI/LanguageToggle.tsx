import React from 'react';
import { useTranslation } from '../../contexts/I18nContext';

export const LanguageToggle: React.FC = () => {
  const { language, changeLanguage } = useTranslation();

  return (
    <button
      onClick={() => changeLanguage(language === 'ko' ? 'en' : 'ko')}
      className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 text-gray-800 dark:text-gray-200"
      title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
      aria-label={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      <span className="text-lg font-medium">
        {language === 'ko' ? 'EN' : '한'}
      </span>
    </button>
  );
};