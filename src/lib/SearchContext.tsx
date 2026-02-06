import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface SearchContextValue {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const value = useMemo(() => ({ activeCategory, setActiveCategory }), [activeCategory]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error('useSearchContext must be used within SearchProvider');
  }
  return ctx;
}
