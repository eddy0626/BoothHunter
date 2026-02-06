import type { BoothItem } from '../../lib/types';
import { useI18n } from '../../lib/i18n';
import { useFavorites } from '../../hooks/useFavorites';
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
      <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-500">{t.search.searching}</p>
        </div>
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
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500">{t.search.noResults}</p>
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            favorited={isFavorite(item.id)}
            onAddFavorite={addFavorite}
            onRemoveFavorite={removeFavorite}
          />
        ))}
      </div>
    </div>
  );
}
