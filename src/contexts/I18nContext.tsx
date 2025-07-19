import React, { createContext, useContext } from 'react';
import { useI18n } from '../hooks/useI18n';
import { Language } from '../i18n/messages';

interface I18nContextType {
  t: (key: string, ...args: any[]) => string;
  language: Language;
  changeLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};