import { useState, useEffect } from 'react';
import { messages, Language, MessageKey } from '../i18n/messages';

const LANGUAGE_KEY = 'interectnote-language';

export const useI18n = () => {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'ko' || saved === 'en') {
      return saved;
    }
    
    // Default to browser language
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('ko') ? 'ko' : 'en';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const t = (key: MessageKey | string, ...args: any[]): string => {
    const message = messages[language][key as MessageKey];
    
    if (!message) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    
    if (typeof message === 'function') {
      return message(...args);
    }
    
    return message;
  };

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
  };

  return {
    t,
    language,
    changeLanguage,
  };
};