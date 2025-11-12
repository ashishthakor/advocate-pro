"use client";

import { useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

export default function LanguageUpdater() {
  const { language } = useLanguage();

  useEffect(() => {
    // Update HTML lang attribute when language changes
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return null;
}

