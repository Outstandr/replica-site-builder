import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'nl' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isTransitioning: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setLanguage = (lang: Language) => {
    if (lang === language) return;

    setIsTransitioning(true);

    // Fade out
    setTimeout(() => {
      setLanguageState(lang);
      localStorage.setItem('language', lang);

      // Fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isTransitioning }}>
      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
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
