import { fetch } from '@tauri-apps/plugin-http';
import { invoke } from '@tauri-apps/api/core';
import { parseSearchHtml, parseItemDetailHtml } from './booth-parser';
import type {
  BoothItem,
  SearchParams,
  SearchResult,
  FavoriteItem,
  Collection,
  AllStatistics,
} from './types';

// ── Rate limiters (separate queues for different priorities) ──

const RATE_LIMIT_MS = 1000;
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

function createRateLimiter(delayMs: number) {
  let queue: Promise<void> = Promise.resolve();
  return async function limitedFetch(url: string): Promise<Response> {
    const ticket = queue.then(() => new Promise<void>((r) => setTimeout(r, delayMs)));
    queue = ticket;
    await ticket;
    return fetch(url, { headers: HEADERS });
  };
}

/** Primary limiter for user-initiated searches and item detail fetches */
const rateLimitedFetch = createRateLimiter(RATE_LIMIT_MS);

/** Separate limiter for wish-count enrichment — runs independently of user searches */
const enrichFetch = createRateLimiter(RATE_LIMIT_MS);

/** Separate limiter for background avatar updates — never blocks user activity */
const backgroundFetch = createRateLimiter(1500);

// ── URL builder (ported from Rust client.rs) ─────────

function buildSearchUrl(params: SearchParams): string {
  const page = Math.min(params.page ?? 1, 10_000);
  const keyword = params.keyword.trim();
  const keywordEmpty = keyword === '';

  let url: string;
  if (params.category) {
    if (keywordEmpty) {
      url = `https://booth.pm/ja/browse/${encodeURIComponent(params.category)}?page=${page}`;
    } else {
      url = `https://booth.pm/ja/browse/${encodeURIComponent(params.category)}?q=${encodeURIComponent(keyword)}&page=${page}`;
    }
  } else {
    url = `https://booth.pm/ja/items?q=${encodeURIComponent(keyword)}&page=${page}`;
  }

  const validSorts = ['new', 'popular', 'price_asc', 'price_desc'];
  if (params.sort && validSorts.includes(params.sort)) {
    url += `&sort=${params.sort}`;
  }

  const isValidPrice = (p: unknown): p is number =>
    typeof p === 'number' && Number.isFinite(p) && p >= 0;

  if (params.only_free) {
    url += '&max_price=0';
  } else {
    if (isValidPrice(params.price_min)) url += `&min_price=${Math.floor(params.price_min)}`;
    if (isValidPrice(params.price_max)) url += `&max_price=${Math.floor(params.price_max)}`;
  }

  return url;
}

/** Exposed for background tasks (avatar updates) that should not block user activity */
export { backgroundFetch };

// ── Search API (direct fetch + JS parse) ─────────────

export async function searchBooth(params: SearchParams): Promise<SearchResult> {
  const url = buildSearchUrl(params);
  const resp = await rateLimitedFetch(url);

  if (resp.status === 429) throw new Error('Rate limited by Booth.pm');
  if (!resp.ok) throw new Error(`Search returned ${resp.status}`);

  const html = await resp.text();
  const { items, totalCount } = parseSearchHtml(html);

  return {
    items,
    total_count: totalCount,
    current_page: params.page ?? 1,
  };
}

// ── Item detail (direct fetch) ───────────────────────

export async function getBoothItem(itemId: number): Promise<BoothItem> {
  // Try JSON API first
  try {
    const resp = await rateLimitedFetch(`https://booth.pm/ja/items/${itemId}.json`);
    if (resp.ok) {
      const data = await resp.json();
      const item = jsonToBoothItem(data);
      if (item) return item;
    }
  } catch (e) {
    console.warn(`JSON API failed for item ${itemId}, falling back to HTML:`, e);
  }

  // Fallback to HTML
  const resp = await rateLimitedFetch(`https://booth.pm/ja/items/${itemId}`);
  if (resp.status === 429) throw new Error('Rate limited by Booth.pm');
  if (!resp.ok) throw new Error(`Item ${itemId} not found`);

  const html = await resp.text();
  const item = parseItemDetailHtml(html, itemId);
  if (!item) throw new Error(`Item ${itemId} not found in HTML`);
  return item;
}

// ── JSON item parser (mirrors Rust BoothJsonItemDetail) ──

function parsePrice(val: unknown): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/\D/g, '');
    return Number(cleaned) || 0;
  }
  return 0;
}

function jsonToBoothItem(data: Record<string, unknown>): BoothItem | null {
  const id = data.id as number | undefined;
  if (id == null) return null;

  const images: string[] = [];
  if (Array.isArray(data.images)) {
    for (const img of data.images) {
      const src =
        (img as Record<string, unknown>).original ?? (img as Record<string, unknown>).resized;
      if (typeof src === 'string') images.push(src);
    }
  }

  const tags: string[] = [];
  if (Array.isArray(data.tags)) {
    for (const t of data.tags) {
      const name = (t as Record<string, unknown>).name;
      if (typeof name === 'string') tags.push(name);
    }
  }

  const category = data.category as Record<string, unknown> | undefined;
  const shop = data.shop as Record<string, unknown> | undefined;

  const wishListsCount =
    typeof data.wish_lists_count === 'number' ? data.wish_lists_count : undefined;

  return {
    id,
    name: (data.name as string) || '',
    description: (data.description as string) || null,
    price: parsePrice(data.price),
    category_name: (category?.name as string) || null,
    shop_name: (shop?.name as string) || null,
    url: (data.url as string) || `https://booth.pm/ja/items/${id}`,
    images,
    tags,
    wish_lists_count: wishListsCount,
  };
}

// ── Wish count enrichment ────────────────────────────

const ENRICH_CONCURRENCY = 3;

/**
 * Fetch wish_lists_count for items that don't have it yet.
 * Calls the JSON API for each item with concurrency limiting.
 * Returns a new array with wish counts filled in progressively.
 * Calls `onProgress` after each batch so the UI can update incrementally.
 */
export async function enrichWithWishCount(
  items: BoothItem[],
  onProgress: (updated: BoothItem[]) => void,
): Promise<BoothItem[]> {
  const result = [...items];
  const toFetch = result
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => item.wish_lists_count == null);

  for (let i = 0; i < toFetch.length; i += ENRICH_CONCURRENCY) {
    const batch = toFetch.slice(i, i + ENRICH_CONCURRENCY);
    await Promise.allSettled(
      batch.map(async ({ item, idx }) => {
        try {
          const resp = await enrichFetch(`https://booth.pm/ja/items/${item.id}.json`);
          if (resp.ok) {
            const data = await resp.json();
            const count = typeof data.wish_lists_count === 'number' ? data.wish_lists_count : 0;
            result[idx] = { ...result[idx], wish_lists_count: count };
          }
        } catch {
          // Skip failed items — leave wish_lists_count as undefined
        }
      }),
    );
    onProgress([...result]);
  }

  return result;
}

// ── Cache / History (unchanged — Rust invoke) ────────

export async function cacheItems(items: BoothItem[]): Promise<void> {
  return invoke('cache_items', { items });
}

export async function saveSearchHistory(keyword: string): Promise<void> {
  return invoke('save_search_history', { keyword });
}

// ── Favorites (unchanged — Rust invoke) ──────────────

export async function getFavorites(): Promise<FavoriteItem[]> {
  return invoke<FavoriteItem[]>('get_favorites');
}

export async function addFavorite(params: {
  item_id: number;
  name: string;
  price: number;
  thumbnail_url: string | null;
  category_name: string | null;
  shop_name: string | null;
}): Promise<void> {
  return invoke('add_favorite', { params });
}

export async function removeFavorite(itemId: number): Promise<void> {
  return invoke('remove_favorite', { itemId });
}

// ── Popular Avatars (unchanged — Rust invoke) ────────

export interface PopularAvatar {
  id: number;
  name_ja: string;
  name_ko: string;
  item_count: number;
  thumbnail_url: string | null;
  updated_at: string;
  is_default: number;
}

export async function getPopularAvatars(): Promise<PopularAvatar[]> {
  return invoke<PopularAvatar[]>('get_popular_avatars');
}

export async function checkAvatarsNeedUpdate(): Promise<boolean> {
  return invoke<boolean>('check_avatars_need_update');
}

export async function updatePopularAvatar(
  id: number,
  itemCount: number,
  thumbnailUrl: string | null,
): Promise<void> {
  return invoke('update_popular_avatar', { id, itemCount, thumbnailUrl });
}

// ── Collections ──────────────────────────────────────

export async function getCollections(): Promise<Collection[]> {
  return invoke<Collection[]>('get_collections');
}

export async function createCollection(name: string, color?: string): Promise<number> {
  return invoke<number>('create_collection', { params: { name, color } });
}

export async function renameCollection(id: number, name: string): Promise<void> {
  return invoke('rename_collection', { id, name });
}

export async function deleteCollection(id: number): Promise<void> {
  return invoke('delete_collection', { id });
}

export async function addToCollection(collectionId: number, itemId: number): Promise<void> {
  return invoke('add_to_collection', { collectionId, itemId });
}

export async function removeFromCollection(collectionId: number, itemId: number): Promise<void> {
  return invoke('remove_from_collection', { collectionId, itemId });
}

export async function getCollectionItems(collectionId: number): Promise<FavoriteItem[]> {
  return invoke<FavoriteItem[]>('get_collection_items', { collectionId });
}

// ── Item Tags ────────────────────────────────────────

export async function setItemTags(itemId: number, tags: string[]): Promise<void> {
  return invoke('set_item_tags', { itemId, tags });
}

export async function getAllUserTags(): Promise<string[]> {
  return invoke<string[]>('get_all_user_tags');
}

export async function getAllItemTagsBatch(): Promise<Record<number, string[]>> {
  return invoke<Record<number, string[]>>('get_all_item_tags_batch');
}

export async function getAllItemCollectionsBatch(): Promise<Record<number, number[]>> {
  return invoke<Record<number, number[]>>('get_all_item_collections_batch');
}

// ── Statistics ────────────────────────────────────────

export async function getAllStatistics(): Promise<AllStatistics> {
  return invoke<AllStatistics>('get_all_statistics');
}

// ── Translation Cache ────────────────────────────────

export async function getCachedTranslation(sourceText: string): Promise<string | null> {
  return invoke<string | null>('get_cached_translation', { sourceText });
}

export async function saveCachedTranslation(
  sourceText: string,
  translatedText: string,
): Promise<void> {
  return invoke('save_cached_translation', { sourceText, translatedText });
}
