import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '../../lib/i18n';
import { getSuggestions, type SearchSuggestion } from '../../lib/search-suggestions';

interface Props {
  onSearch: (keyword: string) => void;
  initialKeyword?: string;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, initialKeyword = '', isLoading }: Props) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const { t } = useI18n();

  const CATEGORY_LABELS: Record<string, string> = {
    avatar: t.suggestion.avatar,
    item: t.suggestion.item,
    vrc: t.suggestion.vrc,
    katakana: t.suggestion.katakana,
    mixed: t.suggestion.mixed,
  };

  useEffect(() => setKeyword(initialKeyword), [initialKeyword]);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const updateSuggestions = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const results = getSuggestions(value);
      setSuggestions(results);
      setSelectedIdx(-1);
      setShowDropdown(results.length > 0);
    }, 150);
  }, []);

  const handleChange = (value: string) => {
    setKeyword(value);
    updateSuggestions(value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    const trimmed = keyword.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setKeyword(suggestion.converted);
    setShowDropdown(false);
    onSearch(suggestion.converted);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIdx]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={t.search.placeholder}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        />

        {/* Suggestion Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {suggestions.map((s, idx) => (
              <button
                key={`${s.converted}-${idx}`}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors',
                  idx === selectedIdx
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-gray-50 text-gray-700',
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-400 truncate">{s.original}</span>
                  <span className="text-gray-300">&rarr;</span>
                  <span className="font-medium truncate">{s.converted}</span>
                </div>
                <span
                  className={clsx(
                    'shrink-0 ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium',
                    s.category === 'avatar' && 'bg-purple-100 text-purple-700',
                    s.category === 'item' && 'bg-blue-100 text-blue-700',
                    s.category === 'vrc' && 'bg-green-100 text-green-700',
                    s.category === 'katakana' && 'bg-orange-100 text-orange-700',
                    s.category === 'mixed' && 'bg-gray-100 text-gray-600',
                  )}
                >
                  {CATEGORY_LABELS[s.category]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !keyword.trim()}
        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {t.search.button}
      </button>
    </form>
  );
}
