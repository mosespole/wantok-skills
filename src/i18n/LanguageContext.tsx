import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

import { setCurrentLanguage, type Language } from './index';

const STORAGE_KEY = 'wantok-settings:language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /** False until the saved choice has been read from the phone. */
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Holds the chosen language and remembers it on the phone (AsyncStorage). */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'en' || saved === 'tpi') {
          setCurrentLanguage(saved);
          setLanguageState(saved);
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const setLanguage = useCallback((next: Language) => {
    // Update the module value first so everything that renders next uses the new language.
    setCurrentLanguage(next);
    setLanguageState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  return <LanguageContext value={{ language, setLanguage, ready }}>{children}</LanguageContext>;
}

export function useLanguage(): LanguageContextValue {
  const context = use(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside <LanguageProvider>.');
  return context;
}
