import { ALL_DICT, type DictEntry } from './korean-dict';
import { containsHangul, hangulToKatakana } from './hangul-katakana';

export interface SearchSuggestion {
  original: string;
  converted: string;
  category: DictEntry['category'] | 'katakana' | 'mixed';
}

// ── Korean matching (existing) ────────────────────────

function matchDictKo(token: string): DictEntry | undefined {
  return ALL_DICT.find((entry) => entry.ko === token || token.includes(entry.ko));
}

function convertTokenKo(token: string): SearchSuggestion | null {
  if (!containsHangul(token)) return null;

  const dictMatch = matchDictKo(token);
  if (dictMatch && dictMatch.ko === token) {
    return {
      original: token,
      converted: dictMatch.ja,
      category: dictMatch.category,
    };
  }

  if (dictMatch) {
    const remaining = token.replace(dictMatch.ko, '');
    const convertedRemaining = containsHangul(remaining) ? hangulToKatakana(remaining) : remaining;
    return {
      original: token,
      converted: dictMatch.ja + convertedRemaining,
      category: 'mixed',
    };
  }

  const katakana = hangulToKatakana(token);
  if (katakana !== token) {
    return {
      original: token,
      converted: katakana,
      category: 'katakana',
    };
  }

  return null;
}

// ── English matching (new) ────────────────────────────

function isLatin(input: string): boolean {
  return /^[a-zA-Z\s]+$/.test(input.trim());
}

function matchDictEn(token: string): DictEntry | undefined {
  const lower = token.toLowerCase();
  return ALL_DICT.find((entry) => entry.en.toLowerCase() === lower);
}

function getEnglishSuggestions(input: string): SearchSuggestion[] {
  const trimmed = input.trim().toLowerCase();
  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();

  // Exact match for full input
  const fullMatch = matchDictEn(trimmed);
  if (fullMatch && !seen.has(fullMatch.ja)) {
    seen.add(fullMatch.ja);
    suggestions.push({
      original: input.trim(),
      converted: fullMatch.ja,
      category: fullMatch.category,
    });
  }

  // Multi-word: convert each token individually
  const tokens = trimmed.split(/\s+/);
  if (tokens.length > 1) {
    const convertedTokens = tokens.map((token) => {
      const match = matchDictEn(token);
      return match ? match.ja : token;
    });
    const combined = convertedTokens.join(' ');
    if (combined !== trimmed && !seen.has(combined)) {
      seen.add(combined);
      suggestions.push({
        original: input.trim(),
        converted: combined,
        category: 'mixed',
      });
    }
  }

  // Prefix match
  for (const entry of ALL_DICT) {
    if (entry.en.toLowerCase().startsWith(trimmed) && !seen.has(entry.ja)) {
      seen.add(entry.ja);
      suggestions.push({
        original: entry.en,
        converted: entry.ja,
        category: entry.category,
      });
    }
  }

  return suggestions.slice(0, 8);
}

// ── Public API ────────────────────────────────────────

export function getSuggestions(input: string): SearchSuggestion[] {
  if (!input.trim()) return [];

  // English input → Japanese suggestions
  if (isLatin(input)) {
    return getEnglishSuggestions(input);
  }

  // Korean input → Japanese suggestions (existing logic)
  if (!containsHangul(input)) return [];

  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();

  const tokens = input.trim().split(/\s+/);

  const fullMatch = matchDictKo(input.trim());
  if (fullMatch) {
    const key = fullMatch.ja;
    if (!seen.has(key)) {
      seen.add(key);
      suggestions.push({
        original: input.trim(),
        converted: fullMatch.ja,
        category: fullMatch.category,
      });
    }
  }

  if (tokens.length >= 1) {
    const convertedTokens = tokens.map((token) => {
      const result = convertTokenKo(token);
      return result ? result.converted : token;
    });
    const combined = convertedTokens.join(' ');
    if (combined !== input.trim() && !seen.has(combined)) {
      seen.add(combined);
      suggestions.push({
        original: input.trim(),
        converted: combined,
        category: tokens.length > 1 ? 'mixed' : 'katakana',
      });
    }
  }

  const trimmed = input.trim().toLowerCase();
  for (const entry of ALL_DICT) {
    if (entry.ko.startsWith(trimmed) && !seen.has(entry.ja)) {
      seen.add(entry.ja);
      suggestions.push({
        original: entry.ko,
        converted: entry.ja,
        category: entry.category,
      });
    }
  }

  const fullKatakana = hangulToKatakana(input.trim());
  if (fullKatakana !== input.trim() && !seen.has(fullKatakana)) {
    seen.add(fullKatakana);
    suggestions.push({
      original: input.trim(),
      converted: fullKatakana,
      category: 'katakana',
    });
  }

  return suggestions.slice(0, 8);
}
