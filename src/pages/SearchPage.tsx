import { useSearch } from '../hooks/useSearch';
import { useSearchContext } from '../lib/SearchContext';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';
import FilterPanel from '../components/search/FilterPanel';
import AvatarQuickFilter from '../components/search/AvatarQuickFilter';
import Pagination from '../components/common/Pagination';
import { ITEMS_PER_PAGE } from '../lib/constants';
import { useI18n, getCategoryLabel } from '../lib/i18n';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SearchParams } from '../lib/types';

export default function SearchPage() {
  const {
    search,
    setPage,
    updateFilters,
    items,
    totalCount,
    currentPage,
    isLoading,
    isEnriching,
    error,
    hasSearched,
    currentParams,
  } = useSearch();

  const { activeCategory, setActiveCategory } = useSearchContext();
  const { t } = useI18n();

  const handleSearch = (keyword: string, extra?: Partial<SearchParams>) => {
    if (extra?.category) setActiveCategory(extra.category);
    search(keyword, { category: extra?.category ?? activeCategory ?? undefined, ...extra });
  };

  const handleClearCategory = () => {
    setActiveCategory(null);
    if (hasSearched) {
      updateFilters({ category: undefined });
    }
  };

  const totalPages = totalCount
    ? Math.ceil(totalCount / ITEMS_PER_PAGE)
    : items.length > 0
      ? currentPage + 1
      : currentPage;

  const categoryLabel = activeCategory ? getCategoryLabel(activeCategory, t) : null;

  return (
    <div className="p-3 md:p-6 pb-20 lg:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile: fixed above bottom tab bar / Desktop: static at top */}
        <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-2 lg:static lg:bg-transparent lg:backdrop-blur-none lg:border-t-0 lg:px-0 lg:py-0">
          <SearchBar
            onSearch={handleSearch}
            initialKeyword={currentParams?.keyword}
            isLoading={isLoading}
          />
        </div>

        {/* Active category badge */}
        {categoryLabel && (
          <div className="mt-2 flex items-center gap-2">
            <Badge className="gap-1 bg-indigo-100 text-indigo-700 border-transparent hover:bg-indigo-100">
              {categoryLabel}
              <button onClick={handleClearCategory} className="ml-0.5 p-0.5 hover:text-indigo-900">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        )}

        {/* Avatar Quick Filter */}
        <div className="mt-3">
          <AvatarQuickFilter onSearch={handleSearch} />
        </div>

        {hasSearched && currentParams && (
          <div className="mt-4">
            <FilterPanel
              params={currentParams}
              onFilterChange={updateFilters}
              isEnriching={isEnriching}
            />
          </div>
        )}

        <div className="mt-6">
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Search className="w-16 h-16 mb-4" />
              <p className="text-lg">{t.search.placeholder}</p>
              <p className="text-sm mt-1">{t.avatarFilter.clickHint}</p>
            </div>
          ) : (
            <>
              <SearchResults
                items={items}
                isLoading={isLoading}
                error={error}
                totalCount={totalCount}
              />
              {items.length > 0 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
