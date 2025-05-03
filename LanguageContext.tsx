
'use client'; // Add this directive

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

// Define the shape of your translations
// You might want to generate this automatically or use a library like i18next
type Translations = typeof en; // Assuming 'en' has the full structure

interface LanguageContextProps {
  language: 'en' | 'ar';
  translations: Translations;
  setLanguage: (lang: 'en' | 'ar') => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const translationsMap = {
  en,
  ar,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'ar'>('en'); // Default to English

  useEffect(() => {
    // Load language from localStorage on initial mount
    const savedLang = localStorage.getItem('language') as 'en' | 'ar';
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
        // Set default if nothing saved
        document.documentElement.lang = 'en';
        document.documentElement.dir = 'ltr';
    }
  }, []);

  const setLanguage = (lang: 'en' | 'ar') => {
    if (lang === 'en' || lang === 'ar') {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      // Force reload or use a more sophisticated state management for instant UI update across all components
      // For simplicity now, let's rely on components re-rendering due to context change
    }
  };

  // Use 'en' as fallback if a key is missing in 'ar'
  const currentTranslations = {
      ...translationsMap.en, // Base English
      ...(language === 'ar' ? translationsMap.ar : {}), // Override with Arabic if selected
  } as Translations;

  return (
    <LanguageContext.Provider value={{ language, translations: currentTranslations, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

