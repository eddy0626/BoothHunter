import { useState, useCallback, useRef } from 'react';
import { fetch } from '@tauri-apps/plugin-http';
import { getCachedTranslation, saveCachedTranslation } from '../lib/booth-api';

// In-memory cache shared across all hook instances
const memoryCache = new Map<string, string>();
// Track in-flight requests to prevent duplicate API calls
const inflight = new Map<string, Promise<string>>();

// Lingva API instances (fallback chain)
const LINGVA_INSTANCES = [
  'https://lingva.lunar.icu',
  'https://translate.plausibility.cloud',
  'https://lingva.ml',
];

export function useTranslation() {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isTranslationVisible, setIsTranslationVisible] = useState(false);

  // Use refs so the useCallback closure always reads fresh values
  const visibleRef = useRef(false);
  const textRef = useRef<string | null>(null);
  const currentTextRef = useRef<string | null>(null);

  const translate = useCallback(async (text: string) => {
    // Toggle off if already showing for the same text
    if (visibleRef.current && currentTextRef.current === text) {
      visibleRef.current = false;
      setIsTranslationVisible(false);
      return;
    }

    // If we already have a translation for this exact text, just show it
    if (textRef.current && currentTextRef.current === text) {
      visibleRef.current = true;
      setIsTranslationVisible(true);
      return;
    }

    // New text requested — reset state
    currentTextRef.current = text;
    setIsTranslating(true);
    setTranslationError(null);

    try {
      // Tier 1: in-memory cache
      const memCached = memoryCache.get(text);
      if (memCached) {
        textRef.current = memCached;
        visibleRef.current = true;
        setTranslatedText(memCached);
        setIsTranslationVisible(true);
        setIsTranslating(false);
        return;
      }

      // Tier 2: SQLite cache via IPC
      try {
        const dbCached = await getCachedTranslation(text);
        if (currentTextRef.current !== text) return; // stale
        if (dbCached) {
          memoryCache.set(text, dbCached);
          textRef.current = dbCached;
          visibleRef.current = true;
          setTranslatedText(dbCached);
          setIsTranslationVisible(true);
          setIsTranslating(false);
          return;
        }
      } catch {
        // DB error, continue to API
      }

      // Tier 3: Lingva API (with deduplication + instance fallback)
      let apiPromise = inflight.get(text);
      if (!apiPromise) {
        apiPromise = (async () => {
          const encoded = encodeURIComponent(text);
          let lastError: Error | null = null;
          for (const base of LINGVA_INSTANCES) {
            try {
              const url = `${base}/api/v1/ja/ko/${encoded}`;
              const resp = await fetch(url, {
                method: 'GET',
                headers: { Accept: 'application/json' },
              });
              if (!resp.ok) {
                lastError = new Error(`${base} returned ${resp.status}`);
                continue;
              }
              const data = await resp.json();
              const translated = data.translation as string;
              if (!translated) {
                lastError = new Error('No translation returned');
                continue;
              }
              return translated;
            } catch (e) {
              lastError = e instanceof Error ? e : new Error(String(e));
            }
          }
          throw lastError ?? new Error('All translation instances failed');
        })();
        inflight.set(text, apiPromise);
        apiPromise.finally(() => inflight.delete(text));
      }

      const translated = await apiPromise;
      if (currentTextRef.current !== text) return; // stale

      memoryCache.set(text, translated);
      textRef.current = translated;
      visibleRef.current = true;
      setTranslatedText(translated);
      setIsTranslationVisible(true);
      // Save to SQLite in background
      saveCachedTranslation(text, translated).catch((e) =>
        console.error('Failed to cache translation:', e),
      );
    } catch (err) {
      if (currentTextRef.current !== text) return; // stale
      setTranslationError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      if (currentTextRef.current === text) {
        setIsTranslating(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    visibleRef.current = false;
    textRef.current = null;
    currentTextRef.current = null;
    setTranslatedText(null);
    setIsTranslating(false);
    setTranslationError(null);
    setIsTranslationVisible(false);
  }, []);

  return {
    translatedText,
    isTranslating,
    translationError,
    isTranslationVisible,
    translate,
    reset,
  };
}
