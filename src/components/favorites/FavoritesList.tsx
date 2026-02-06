import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import {
  useCollections,
  useAllUserTags,
  useAllItemTagsBatch,
  useAllItemCollectionsBatch,
} from '../../hooks/useCollections';
import { setItemTags } from '../../lib/booth-api';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../../lib/i18n';
import type { FavoriteItem } from '../../lib/types';
import TagEditor from './TagEditor';
import AddToCollectionMenu from './AddToCollectionMenu';

interface Props {
  items?: FavoriteItem[];
}

export default memo(function FavoritesList({ items }: Props) {
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const { collections, addItem, removeItem } = useCollections();
  const { data: allUserTags } = useAllUserTags();
  const { data: tagsBatch } = useAllItemTagsBatch();
  const { data: collectionsBatch } = useAllItemCollectionsBatch();
  const qc = useQueryClient();
  const { t } = useI18n();
  const displayItems = items ?? favorites;

  const handleSetTags = useCallback(
    async (itemId: number, tags: string[]) => {
      await setItemTags(itemId, tags);
      qc.invalidateQueries({ queryKey: ['all-item-tags-batch'] });
      qc.invalidateQueries({ queryKey: ['all-user-tags'] });
    },
    [qc],
  );

  if (isLoading && !items) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Heart className="w-16 h-16 mb-4" />
        <p className="text-lg">{t.favorites.empty}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {displayItems.map((fav) => (
        <div
          key={fav.id}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
        >
          <Link to={`/item/${fav.item_id}`} className="block">
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              {fav.thumbnail_url ? (
                <img
                  src={fav.thumbnail_url}
                  alt={fav.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>
          </Link>
          <div className="p-3">
            <div className="flex items-start justify-between gap-1">
              <Link
                to={`/item/${fav.item_id}`}
                className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 flex-1"
                title={fav.name}
              >
                {fav.name}
              </Link>
              <div className="flex items-center shrink-0">
                <AddToCollectionMenu
                  itemId={fav.item_id}
                  collections={collections}
                  memberCollectionIds={collectionsBatch?.[fav.item_id] ?? []}
                  onAddToCollection={addItem}
                  onRemoveFromCollection={removeItem}
                />
                <button
                  onClick={() =>
                    removeFavorite(fav.item_id).catch((e) => console.error('Remove failed:', e))
                  }
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                  title={t.favorites.removed}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`text-sm font-bold ${fav.price === 0 ? 'text-green-600' : 'text-gray-900'}`}
              >
                {fav.price === 0 ? t.item.free : `¥${fav.price.toLocaleString()}`}
              </span>
              {fav.shop_name && (
                <span className="text-xs text-gray-500 truncate max-w-[120px]">
                  {fav.shop_name}
                </span>
              )}
            </div>
            <div className="mt-2">
              <TagEditor
                itemId={fav.item_id}
                tags={tagsBatch?.[fav.item_id] ?? []}
                allUserTags={allUserTags ?? []}
                onSetTags={handleSetTags}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
