export interface CategoryNode {
  jaName: string;
  koLabel: string;
  icon: string;
}

export const VRCHAT_CATEGORIES: CategoryNode[] = [
  { jaName: '3Dキャラクター', koLabel: '3D 캐릭터', icon: 'User' },
  { jaName: '3D衣装', koLabel: '3D 의상', icon: 'Shirt' },
  { jaName: '3D小道具', koLabel: '3D 소품', icon: 'Gem' },
  { jaName: '3Dテクスチャ', koLabel: '3D 텍스처', icon: 'Paintbrush' },
  { jaName: '3Dモデル（その他）', koLabel: '3D 모델 (기타)', icon: 'Box' },
  { jaName: '3D装飾品', koLabel: '3D 장식품', icon: 'Crown' },
  { jaName: '3D環境・ワールド', koLabel: '3D 환경/월드', icon: 'Globe' },
  { jaName: '3Dモーション・アニメーション', koLabel: '3D 모션/애니메이션', icon: 'Play' },
  { jaName: '3Dツール・システム', koLabel: '3D 툴/시스템', icon: 'Wrench' },
  { jaName: 'VRoid', koLabel: 'VRoid', icon: 'Sparkles' },
];

export const UI_TEXT = {
  appName: 'BoothHunter',
  search: {
    placeholder: 'Booth.pm 상품 검색...',
    button: '검색',
    noResults: '검색 결과가 없습니다',
    searching: '검색 중...',
    error: '검색 중 오류가 발생했습니다',
    rateLimited: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  favorites: {
    title: '즐겨찾기',
    empty: '즐겨찾기한 상품이 없습니다',
    added: '즐겨찾기에 추가했습니다',
    removed: '즐겨찾기에서 제거했습니다',
  },
  item: {
    free: '무료',
    openInBooth: 'Booth에서 열기',
    price: '가격',
    shop: '샵',
    category: '카테고리',
    tags: '태그',
    description: '설명',
  },
  nav: {
    search: '검색',
    favorites: '즐겨찾기',
    stats: '통계',
    history: '검색 기록',
    vrchat: 'VRChat',
    allCategories: '전체 카테고리',
  },
  filter: {
    category: '카테고리',
    sort: '정렬',
    priceRange: '가격 범위',
    freeOnly: '무료만',
    apply: '적용',
    reset: '초기화',
    filter: '필터',
    minWishCount: '좋아요 최소',
  },
  avatarFilter: {
    title: '인기 아바타',
    clickHint: '클릭: 대응 의상 검색 | 우클릭: 전체 검색',
    items: '개',
  },
  suggestion: {
    avatar: '아바타',
    item: '의상',
    vrc: 'VRC용어',
    katakana: '카타카나',
    mixed: '혼합',
  },
  common: {
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    retry: '다시 시도',
    page: '페이지',
    prev: '이전',
    next: '다음',
    linkCopied: '링크가 복사되었습니다',
    copyLink: '링크 복사',
  },
  translation: {
    button: '번역',
    loading: '번역 중...',
    error: '번역 실패',
  },
} as const;

export const SORT_OPTIONS = [
  { value: 'new', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
] as const;

export const CATEGORIES: Record<string, string> = Object.fromEntries(
  VRCHAT_CATEGORIES.map((c) => [c.jaName, c.koLabel]),
);

export const ITEMS_PER_PAGE = 24;
