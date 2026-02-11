## v0.3.1

---

### :kr: 한국어

#### 성능 최적화
- **번역 훅 리프팅 (P-1)**: ItemCard마다 생성되던 useTranslation 훅(useState 4개 + useRef 3개)을 `performTranslation()` 독립 함수로 추출하여 카드당 useState 1개로 경량화
- **React.memo 최적화 (P-2)**: `isFavorite`에 useCallback 적용으로 ItemCard의 React.memo가 정상 작동
- **아바타 필터 컴포넌트 분리 (P-3)**: AvatarQuickFilter의 60개 아이템 맵에서 인라인 화살표 함수를 memo 서브컴포넌트(`AvatarChip`)로 추출
- **검색 결과 메모이제이션 (P-4)**: `filteredItems`에 useMemo 적용으로 불필요한 배열 재생성 방지

#### 코드 품질 개선
- **공유 훅 추출 (Q-1)**: Sidebar와 CategorySheet에 중복되던 카테고리 네비게이션 로직을 `useCategoryNavigation` 훅으로 통합
- **타입 안전성 강화 (Q-4)**: booth-api의 JSON 파서에서 `as` 타입 캐스트를 `isRecord()` 타입 가드로 교체
- **에러 로깅 추가 (Q-5)**: useSearch, booth-api의 빈 catch 블록에 console.error/warn 추가

#### 기능 개선
- **번역 언어 연동**: 앱 언어 설정에 따라 번역 출력 언어가 자동 변경 (한국어 선택 시 일본어→한국어, English 선택 시 일본어→영어)
- **인기 아바타 확장**: 인기 아바타 목록을 20개에서 64개로 확장, 영문 이름(name_en) 추가

#### 버그 수정
- **외부 URL 열기**: Booth 상품 페이지 열기 버튼이 작동하지 않던 문제 수정 (`plugin-shell` → `plugin-opener` 전환)

#### 정리
- i18n 시스템으로 대체된 레거시 상수(`UI_TEXT`, `SORT_OPTIONS`, `CATEGORIES`) 제거

---

### :us: English

#### Performance Optimization
- **Translation hook lifting (P-1)**: Extracted `performTranslation()` standalone function from useTranslation hook — reduces per-ItemCard overhead from 4 useState + 3 useRef to a single useState
- **React.memo fix (P-2)**: Wrapped `isFavorite` in useCallback so ItemCard's React.memo properly prevents unnecessary re-renders
- **Avatar filter component extraction (P-3)**: Extracted memoized `AvatarChip` sub-component from AvatarQuickFilter's 60-item map to eliminate inline arrow function re-creation
- **Search result memoization (P-4)**: Applied useMemo to `filteredItems` to prevent redundant array allocations on re-renders

#### Code Quality
- **Shared hook extraction (Q-1)**: Consolidated duplicate category navigation logic from Sidebar and CategorySheet into `useCategoryNavigation` hook
- **Type safety (Q-4)**: Replaced `as` type casts with `isRecord()` type guard in booth-api JSON parser
- **Error logging (Q-5)**: Added console.error/warn to empty catch blocks in useSearch and booth-api

#### Feature Improvements
- **Translation language sync**: Translation output now follows app language setting (Korean mode: JA→KO, English mode: JA→EN)
- **Expanded avatar list**: Popular avatars expanded from 20 to 64 entries with English names (name_en)

#### Bug Fixes
- **External URL opening**: Fixed "Open in Booth" button not working by switching from `plugin-shell` to `plugin-opener`

#### Cleanup
- Removed legacy constants (`UI_TEXT`, `SORT_OPTIONS`, `CATEGORIES`) superseded by i18n system
