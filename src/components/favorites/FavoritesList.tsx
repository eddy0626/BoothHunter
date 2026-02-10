import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
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
    <div role="list" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {displayItems.map((fav) => (
        <div
          key={fav.id}
          role="listitem"
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
                  {t.item.noImage}
                </div>
              )}
            </div>
          </Link>
          <div className="p-3">
            <div className="flex items-start justify-between gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={`/item/${fav.item_id}`}
                    className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 flex-1"
                  >
                    {fav.name}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{fav.name}</TooltipContent>
              </Tooltip>
              <div className="flex items-center shrink-0">
                <AddToCollectionMenu
                  itemId={fav.item_id}
                  collections={collections}
                  memberCollectionIds={collectionsBatch?.[fav.item_id] ?? []}
                  onAddToCollection={addItem}
                  onRemoveFromCollection={removeItem}
                />
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <button className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>{t.favorites.removed}</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.favorites.confirmDeleteTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.favorites.confirmDeleteDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.favorites.cancelButton}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            await removeFavorite(fav.item_id);
                          } catch (e) {
                            console.error('Remove failed:', e);
                            toast.error(t.errors.favoriteRemove);
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t.favorites.deleteButton}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
