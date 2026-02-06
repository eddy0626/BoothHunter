export interface BoothItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category_name: string | null;
  shop_name: string | null;
  url: string;
  images: string[];
  tags: string[];
  wish_lists_count?: number;
}

export interface SearchParams {
  keyword: string;
  page?: number;
  category?: string;
  sort?: string;
  only_free?: boolean;
  price_min?: number;
  price_max?: number;
  /** Client-side only: filter items with at least N wish list adds */
  min_wish_count?: number;
}

export interface SearchResult {
  items: BoothItem[];
  total_count: number | null;
  current_page: number;
}

export interface FavoriteItem {
  id: number;
  item_id: number;
  name: string;
  price: number;
  thumbnail_url: string | null;
  category_name: string | null;
  shop_name: string | null;
  added_at: string;
  note: string | null;
}

export interface Collection {
  id: number;
  name: string;
  color: string;
  created_at: string;
  sort_order: number;
  item_count: number;
}

// ── Statistics ─────────────────────────────────────────

export interface DashboardStats {
  favorites_count: number;
  collections_count: number;
  tags_count: number;
  searches_count: number;
  total_value: number;
  avg_price: number;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export interface PriceBucket {
  label: string;
  count: number;
}

export interface TagStat {
  tag: string;
  count: number;
}

export interface SearchFrequency {
  keyword: string;
  count: number;
}

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface ShopStat {
  shop: string;
  count: number;
}

export interface AllStatistics {
  stats: DashboardStats;
  categories: CategoryStat[];
  prices: PriceBucket[];
  tags: TagStat[];
  searches: SearchFrequency[];
  monthly: MonthlyCount[];
  shops: ShopStat[];
}
