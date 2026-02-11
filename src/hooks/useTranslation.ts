import { useState, useCallback, useRef } from 'react';
import { fetch } from '@tauri-apps/plugin-http';
import { getCachedTranslation, saveCachedTranslation } from '../lib/booth-api';
import { useI18n } from '../lib/i18n';

// In-memory cache shared across all hook instances (keyed by text\tlang)
const memoryCache = new Map<string, string>();
// Track in-flight requests to prevent duplicate API calls
const inflight = new Map<string, Promise<string>>();

// Lingva API instances (fallback chain)
const LINGVA_INSTANCES = [
  'https://lingva.lunar.icu',
  'https://translate.plausibility.cloud',
  'https://lingva.ml',
];

/**
 * Standalone translation function — 3-tier cache (memory → SQLite → Lingva API).
 * Can be used directly without the full useTranslation hook overhead.
 */
export async function performTranslation(text: string, targetLang: string): Promise<string> {
  const cacheKey = `${text}\t${targetLang}`;

  // Tier 1: in-memory cache
  const memCached = memoryCache.get(cacheKey);
  if (memCached) return memCached;

  // Tier 2: SQLite cache via IPC
  try {
    const dbCached = await getCachedTranslation(cacheKey);
    if (dbCached) {
      memoryCache.set(cacheKey, dbCached);
      return dbCached;
    }
  } catch {
    // DB error, continue to API
  }

  // Tier 3: Lingva API (with deduplication + instance fallback)
  let apiPromise = inflight.get(cacheKey);
  if (!apiPromise) {
    apiPromise = (async () => {
      const encoded = encodeURIComponent(text);
      let lastError: Error | null = null;
      for (const base of LINGVA_INSTANCES) {
        try {
          const url = `${base}/api/v1/ja/${targetLang}/${encoded}`;
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
    inflight.set(cacheKey, apiPromise);
    apiPromise.finally(() => inflight.delete(cacheKey)).catch(() => {});
  }

  const translated = await apiPromise;
  memoryCache.set(cacheKey, translated);
  // Save to SQLite in background
  saveCachedTranslation(cacheKey, translated).catch((e) =>
    console.error('Failed to cache translation:', e),
  );
  return translated;
}

/**
 * Full hook with toggle/visibility state — used by ItemDetailPage
 * for name and description translation with toggle behavior.
 */
export function useTranslation() {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isTranslationVisible, setIsTranslationVisible] = useState(false);
  const { language } = useI18n();

  // Use refs so the useCallback closure always reads fresh values
  const visibleRef = useRef(false);
  const textRef = useRef<string | null>(null);
  const currentTextRef = useRef<string | null>(null);
  const langRef = useRef(language);
  langRef.current = language;

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
      const translated = await performTranslation(text, langRef.current);
      if (currentTextRef.current !== text) return; // stale

      textRef.current = translated;
      visibleRef.current = true;
      setTranslatedText(translated);
      setIsTranslationVisible(true);
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
