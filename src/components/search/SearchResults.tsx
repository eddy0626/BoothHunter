import { SearchX } from 'lucide-react';
import type { BoothItem } from '../../lib/types';
import { useI18n } from '../../lib/i18n';
import { useFavorites } from '../../hooks/useFavorites';
import { Skeleton } from '@/components/ui/skeleton';
import ItemCard from './ItemCard';

interface Props {
  items: BoothItem[];
  isLoading: boolean;
  error: string | null;
  totalCount?: number | null;
}

export default function SearchResults({ items, isLoading, error, totalCount }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { t, language } = useI18n();

  if (isLoading) {
    return (
      <div role="status" aria-live="polite">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <p className="sr-only">{t.search.searching}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20" role="alert">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <SearchX className="w-16 h-16 mb-4" />
        <p className="text-lg">{t.search.noResults}</p>
      </div>
    );
  }

  const resultsText =
    language === 'ko'
      ? `총 ${totalCount?.toLocaleString()}개의 결과`
      : `${totalCount?.toLocaleString()} results`;

  return (
    <div>
      {totalCount != null && <p className="text-sm text-gray-500 mb-4">{resultsText}</p>}
      <div role="list" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.id} role="listitem">
            <ItemCard
              item={item}
              favorited={isFavorite(item.id)}
              onAddFavorite={addFavorite}
              onRemoveFavorite={removeFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
