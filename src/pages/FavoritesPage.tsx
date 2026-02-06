import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import FavoritesList from '../components/favorites/FavoritesList';
import CollectionSidebar from '../components/favorites/CollectionSidebar';
import { useFavorites } from '../hooks/useFavorites';
import { useCollectionItems } from '../hooks/useCollections';
import { useI18n } from '../lib/i18n';
import type { FavoriteItem } from '../lib/types';

export default function FavoritesPage() {
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState('');
  const { favorites } = useFavorites();
  const collectionItemsQuery = useCollectionItems(selectedCollection);
  const { t, language } = useI18n();

  const baseItems: FavoriteItem[] =
    selectedCollection != null ? (collectionItemsQuery.data ?? []) : favorites;

  const displayItems = useMemo(() => {
    if (!tagFilter.trim()) return baseItems;
    const q = tagFilter.trim().toLowerCase();
    return baseItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.shop_name?.toLowerCase().includes(q) ?? false) ||
        (item.category_name?.toLowerCase().includes(q) ?? false),
    );
  }, [tagFilter, baseItems]);

  const searchPlaceholder =
    language === 'ko' ? '이름/샵/카테고리 검색...' : 'Search name/shop/category...';
  const countText = language === 'ko' ? `${displayItems.length}건` : `${displayItems.length} items`;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.favorites.title}</h2>

        <div className="flex gap-6">
          {/* Sidebar */}
          <CollectionSidebar
            selected={selectedCollection}
            onSelect={setSelectedCollection}
            totalCount={favorites.length}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search / filter bar */}
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <span className="text-sm text-gray-500">{countText}</span>
            </div>

            <FavoritesList items={displayItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
