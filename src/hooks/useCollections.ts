import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCollections,
  createCollection,
  renameCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
  getCollectionItems,
  getAllUserTags,
  getAllItemTagsBatch,
  getAllItemCollectionsBatch,
} from "../lib/booth-api";
import type { FavoriteItem } from "../lib/types";

export function useCollections() {
  const qc = useQueryClient();

  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });

  const createMut = useMutation({
    mutationFn: (params: { name: string; color?: string }) =>
      createCollection(params.name, params.color),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });

  const renameMut = useMutation({
    mutationFn: (params: { id: number; name: string }) =>
      renameCollection(params.id, params.name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteCollection(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections"] });
      qc.invalidateQueries({ queryKey: ["collection-items"] });
    },
  });

  const addItemMut = useMutation({
    mutationFn: (params: { collectionId: number; itemId: number }) =>
      addToCollection(params.collectionId, params.itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections"] });
      qc.invalidateQueries({ queryKey: ["collection-items"] });
      qc.invalidateQueries({ queryKey: ["item-collections"] });
      qc.invalidateQueries({ queryKey: ["all-item-collections-batch"] });
    },
  });

  const removeItemMut = useMutation({
    mutationFn: (params: { collectionId: number; itemId: number }) =>
      removeFromCollection(params.collectionId, params.itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections"] });
      qc.invalidateQueries({ queryKey: ["collection-items"] });
      qc.invalidateQueries({ queryKey: ["item-collections"] });
      qc.invalidateQueries({ queryKey: ["all-item-collections-batch"] });
    },
  });

  return {
    collections: collectionsQuery.data ?? [],
    isLoading: collectionsQuery.isLoading,
    create: createMut.mutateAsync,
    rename: renameMut.mutateAsync,
    remove: deleteMut.mutateAsync,
    addItem: addItemMut.mutateAsync,
    removeItem: removeItemMut.mutateAsync,
  };
}

export function useCollectionItems(collectionId: number | null) {
  return useQuery<FavoriteItem[]>({
    queryKey: ["collection-items", collectionId],
    queryFn: () => getCollectionItems(collectionId!),
    enabled: collectionId != null,
  });
}

export function useAllUserTags() {
  return useQuery<string[]>({
    queryKey: ["all-user-tags"],
    queryFn: getAllUserTags,
  });
}

/** Batch: all item→tags mappings for favorited items (single IPC call) */
export function useAllItemTagsBatch() {
  return useQuery<Record<number, string[]>>({
    queryKey: ["all-item-tags-batch"],
    queryFn: getAllItemTagsBatch,
    staleTime: 30 * 1000,
  });
}

/** Batch: all item→collection mappings for favorited items (single IPC call) */
export function useAllItemCollectionsBatch() {
  return useQuery<Record<number, number[]>>({
    queryKey: ["all-item-collections-batch"],
    queryFn: getAllItemCollectionsBatch,
    staleTime: 30 * 1000,
  });
}
