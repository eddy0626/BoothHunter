import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFavorites,
  addFavorite as addFavoriteApi,
  removeFavorite as removeFavoriteApi,
} from '../lib/booth-api';
import type { BoothItem, FavoriteItem } from '../lib/types';

export function useFavorites() {
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: (): Promise<FavoriteItem[]> => getFavorites(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const favorites = favoritesQuery.data ?? [];

  // O(1) lookup instead of O(n) .some() scan per call
  const favoriteIdSet = useMemo(() => new Set(favorites.map((f) => f.item_id)), [favorites]);

  const addMutation = useMutation({
    mutationFn: async (item: BoothItem) => {
      await addFavoriteApi({
        item_id: item.id,
        name: item.name,
        price: item.price,
        thumbnail_url: item.images[0] || null,
        category_name: item.category_name,
        shop_name: item.shop_name,
      });
    },
    onMutate: async (item: BoothItem) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData<FavoriteItem[]>(['favorites']);
      queryClient.setQueryData<FavoriteItem[]>(['favorites'], (old = []) => [
        {
          id: -Date.now(),
          item_id: item.id,
          name: item.name,
          price: item.price,
          thumbnail_url: item.images[0] || null,
          category_name: item.category_name,
          shop_name: item.shop_name,
          added_at: new Date().toISOString(),
          note: null,
        },
        ...old,
      ]);
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await removeFavoriteApi(itemId);
    },
    onMutate: async (itemId: number) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData<FavoriteItem[]>(['favorites']);
      queryClient.setQueryData<FavoriteItem[]>(['favorites'], (old = []) =>
        old.filter((f) => f.item_id !== itemId),
      );
      return { previous };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isFavorite = (itemId: number): boolean => favoriteIdSet.has(itemId);

  return {
    favorites,
    isLoading: favoritesQuery.isLoading,
    addFavorite: addMutation.mutateAsync,
    removeFavorite: removeMutation.mutateAsync,
    isFavorite,
  };
}
