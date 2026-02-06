import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { ko } from './ko';
import { en } from './en';
import type { Language, Translations } from './types';

export type { Language, Translations };

const STORAGE_KEY = 'boothhunter-language';

const translations: Record<Language, Translations> = { ko, en };

export const LANGUAGE_OPTIONS: { value: Language; label: string; nativeLabel: string }[] = [
  { value: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { value: 'en', label: 'English', nativeLabel: 'English' },
];

function getInitialLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ko' || stored === 'en') return stored;

    // Auto-detect from browser
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ko')) return 'ko';
  }
  return 'en';
}

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ko' || stored === 'en') {
      setLanguageState(stored);
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

// Helper to get translated category label
export function getCategoryLabel(jaName: string, t: Translations): string {
  return t.categories[jaName as keyof typeof t.categories] ?? jaName;
}

// Helper to get translated sort label
export function getSortLabel(value: string, t: Translations): string {
  const key = value as keyof typeof t.sort;
  return t.sort[key] ?? value;
}
