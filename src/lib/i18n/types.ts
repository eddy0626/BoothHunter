export type Language = 'ko' | 'en';

export interface Translations {
  appName: string;
  search: {
    placeholder: string;
    button: string;
    noResults: string;
    searching: string;
    error: string;
    rateLimited: string;
    resultsCount: (count: string) => string;
  };
  favorites: {
    title: string;
    empty: string;
    added: string;
    removed: string;
    confirmDeleteTitle: string;
    confirmDeleteDesc: string;
    deleteButton: string;
    cancelButton: string;
    searchPlaceholder: string;
    countText: (count: number) => string;
  };
  item: {
    free: string;
    openInBooth: string;
    price: string;
    shop: string;
    category: string;
    tags: string;
    description: string;
    noImage: string;
    goBack: string;
    invalidId: string;
  };
  nav: {
    search: string;
    favorites: string;
    stats: string;
    history: string;
    vrchat: string;
    allCategories: string;
  };
  filter: {
    category: string;
    sort: string;
    priceRange: string;
    freeOnly: string;
    apply: string;
    reset: string;
    filter: string;
    minWishCount: string;
    priceMin: string;
    priceMax: string;
    wishOrMore: string;
  };
  avatarFilter: {
    title: string;
    clickHint: string;
    items: string;
  };
  suggestion: {
    avatar: string;
    item: string;
    vrc: string;
    katakana: string;
    mixed: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    page: string;
    prev: string;
    next: string;
    linkCopied: string;
    copyLink: string;
  };
  translation: {
    button: string;
    error: string;
  };
  stats: {
    title: string;
    favorites: string;
    collections: string;
    tags: string;
    totalSearches: string;
    totalValue: (value: string) => string;
    avgPrice: (price: string) => string;
    categoryDistribution: string;
    priceDistribution: string;
    topShops: string;
    topTags: string;
    searchHistory: string;
    monthlyFavorites: string;
    noData: string;
  };
  collections: {
    title: string;
    create: string;
    rename: string;
    delete: string;
    empty: string;
    emptyList: string;
    all: (count: number) => string;
    addTo: string;
    removeFrom: string;
    namePlaceholder: string;
    addToCollection: string;
    confirmDeleteTitle: string;
    confirmDeleteDesc: string;
    deleteButton: string;
    cancelButton: string;
    createButton: string;
  };
  tags: {
    addTag: string;
  };
  errors: {
    collectionCreate: string;
    collectionRename: string;
    collectionDelete: string;
    collectionToggle: string;
    favoriteAdd: string;
    favoriteRemove: string;
    tagAdd: string;
    tagRemove: string;
    clipboardWrite: string;
  };
  errorBoundary: {
    unexpected: string;
  };
  settings: {
    title: string;
    language: string;
    languageHint: string;
  };
  sort: {
    new: string;
    popular: string;
    priceAsc: string;
    priceDesc: string;
  };
  categories: {
    '3Dキャラクター': string;
    '3D衣装': string;
    '3D小道具': string;
    '3Dテクスチャ': string;
    '3Dモデル（その他）': string;
    '3D装飾品': string;
    '3D環境・ワールド': string;
    '3Dモーション・アニメーション': string;
    '3Dツール・システム': string;
    VRoid: string;
  };
  updater: {
    available: string;
    downloading: string;
    install: string;
    dismiss: string;
    error: string;
  };
  a11y: {
    skipToContent: string;
    mainNav: string;
    collectionNav: string;
    filterRegion: string;
    paginationNav: string;
    prevPage: string;
    nextPage: string;
    pageN: (page: number) => string;
  };
  priceBuckets: {
    free: string;
    '~500': string;
    '501~1000': string;
    '1001~3000': string;
    '3001~5000': string;
    '5001~10000': string;
    '10000~': string;
  };
}
