"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enTranslations from '@/languages/en';
import hiTranslations from '@/languages/hi';
import mrTranslations from '@/languages/mr';
import guTranslations from '@/languages/gu';

export type Language = 'en' | 'hi' | 'mr' | 'gu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: enTranslations,
  hi: hiTranslations,
  mr: mrTranslations,
  gu: guTranslations,
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['en', 'hi', 'mr', 'gu'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  const handleSetLanguage = useCallback((lang: Language) => {
    console.log('handleSetLanguage called with:', lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
    setLanguage(lang);
  }, []);

  const t = useCallback((key: string): string => {
    const currentTranslations = translations[language];
    if (!currentTranslations) {
      console.warn(`No translations found for language: ${language}`);
      return key;
    }
    const translation = currentTranslations[key as keyof typeof currentTranslations];
    if (!translation) {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      // Fallback to English if translation not found
      const englishTranslation = translations.en?.[key as keyof typeof translations.en];
      return englishTranslation || key;
    }
    return translation;
  }, [language]);

  // Debug: Log when language state changes
  useEffect(() => {
    console.log('Language state changed to:', language);
  }, [language]);

  // Create context value - don't memoize to ensure React always detects changes
  // This ensures components re-render when language changes
  const contextValue = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  console.log('Rendering LanguageProvider with language:', language);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
