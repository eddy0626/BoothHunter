import { useCallback, useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchBooth, cacheItems, saveSearchHistory, enrichWithWishCount } from '../lib/booth-api';
import { useSearchContext } from '../lib/SearchContext';
import type { SearchParams, BoothItem } from '../lib/types';

// ── URL ↔ SearchParams helpers ──────────────────────

function paramsFromUrl(sp: URLSearchParams): SearchParams | null {
  const q = sp.get('q');
  if (q == null) return null;

  return {
    keyword: q,
    page: Number(sp.get('page')) || 1,
    category: sp.get('cat') ?? undefined,
    sort: sp.get('sort') ?? undefined,
    only_free: sp.get('free') === '1' ? true : undefined,
    price_min: sp.has('pmin') ? Number(sp.get('pmin')) : undefined,
    price_max: sp.has('pmax') ? Number(sp.get('pmax')) : undefined,
    min_wish_count: sp.has('mwc') ? Number(sp.get('mwc')) : undefined,
  };
}

function paramsToUrl(params: SearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  out.q = params.keyword;
  if (params.page && params.page > 1) out.page = String(params.page);
  if (params.category) out.cat = params.category;
  if (params.sort) out.sort = params.sort;
  if (params.only_free) out.free = '1';
  if (params.price_min != null) out.pmin = String(params.price_min);
  if (params.price_max != null) out.pmax = String(params.price_max);
  if (params.min_wish_count != null && params.min_wish_count > 0)
    out.mwc = String(params.min_wish_count);
  return out;
}

// ── Hook ─────────────────────────────────────────────

export function useSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = paramsFromUrl(searchParams);

  const [enrichedItems, setEnrichedItems] = useState<BoothItem[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const enrichAbort = useRef<AbortController | null>(null);

  const { setActiveCategory } = useSearchContext();

  // Sync URL cat param back to context on popstate / navigation
  useEffect(() => {
    const cat = searchParams.get('cat');
    setActiveCategory(cat);
  }, [searchParams, setActiveCategory]);

  const query = useQuery({
    queryKey: ['search', params],
    queryFn: async () => {
      if (!params) throw new Error('No params');
      const result = await searchBooth(params);
      cacheItems(result.items).catch((e) => console.error('Failed to cache items:', e));
      saveSearchHistory(params.keyword).catch((e) =>
        console.error('Failed to save search history:', e),
      );
      return result;
    },
    enabled: !!params,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Run wish count enrichment when search results arrive
  useEffect(() => {
    const items = query.data?.items;
    if (!items || items.length === 0) {
      setEnrichedItems([]);
      setIsEnriching(false);
      return;
    }

    setEnrichedItems(items);

    const needsEnrichment = items.some((i) => i.wish_lists_count == null);
    if (!needsEnrichment) {
      setIsEnriching(false);
      return;
    }

    enrichAbort.current?.abort();
    const controller = new AbortController();
    enrichAbort.current = controller;

    setIsEnriching(true);
    enrichWithWishCount(items, (updated) => {
      if (!controller.signal.aborted) {
        setEnrichedItems(updated);
      }
    })
      .then((final) => {
        if (!controller.signal.aborted) {
          setEnrichedItems(final);
          cacheItems(final).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsEnriching(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [query.data?.items]);

  // Client-side wish count filter
  const minWishCount = params?.min_wish_count;
  const filteredItems =
    minWishCount != null && minWishCount > 0
      ? enrichedItems.filter(
          (item) => item.wish_lists_count != null && item.wish_lists_count >= minWishCount,
        )
      : enrichedItems;

  const search = useCallback(
    (keyword: string, extra?: Partial<SearchParams>) => {
      const newParams: SearchParams = { keyword, page: 1, ...extra };
      setSearchParams(paramsToUrl(newParams), { replace: false });
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (page: number) => {
      setSearchParams(
        (prev) => {
          const current = paramsFromUrl(prev);
          if (!current) return prev;
          return paramsToUrl({ ...current, page });
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const updateFilters = useCallback(
    (filters: Partial<SearchParams>) => {
      setSearchParams(
        (prev) => {
          const current = paramsFromUrl(prev);
          if (!current) return prev;
          // min_wish_count is client-side only, don't reset page for it
          if (Object.keys(filters).length === 1 && 'min_wish_count' in filters) {
            return paramsToUrl({ ...current, ...filters });
          }
          return paramsToUrl({ ...current, ...filters, page: 1 });
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    search,
    setPage,
    updateFilters,
    items: filteredItems,
    totalCount: query.data?.total_count ?? null,
    currentPage: params?.page ?? 1,
    isLoading: query.isLoading || query.isFetching,
    isEnriching,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : String(query.error)
      : null,
    hasSearched: !!params,
    currentParams: params,
  };
}
