## BoothHunter v0.3.0

Booth.pm VRChat 상품 검색 데스크탑 앱 — UI/UX 전면 개선 및 영어 지원 확장

A desktop app for searching VRChat products on Booth.pm — major UI/UX overhaul and full English support.

---

### 주요 변경사항 / What's New

#### UI 컴포넌트 전면 교체 / Component Library Migration

- **shadcn/ui 전체 마이그레이션**: 모든 UI 컴포넌트를 Radix UI 기반의 shadcn/ui로 교체 (Button, Dialog, Select, Tooltip, Badge, Skeleton, Checkbox, Input, Collapsible, AlertDialog 등)
- **Full shadcn/ui migration**: All UI components replaced with Radix UI-based shadcn/ui primitives for consistency and accessibility.

#### UI/UX 개선 / UI/UX Improvements

- **에러 토스트 알림**: 즐겨찾기/컬렉션/태그/클립보드 실패 시 토스트 메시지 표시 (sonner 라이브러리)
- **스켈레톤 로딩**: 검색 결과, 즐겨찾기 목록, 컬렉션 사이드바, 상품 상세 페이지에 로딩 스켈레톤 적용
- **삭제 확인 다이얼로그**: 즐겨찾기 제거 및 컬렉션 삭제 시 AlertDialog 확인 단계 추가
- **빈 상태 안내 통일**: 모든 빈 상태에 아이콘 + 텍스트 패턴 적용 (검색 없음, 즐겨찾기 없음, 컬렉션 없음, 통계 데이터 없음)
- **링크 복사 버튼**: 검색 카드 및 상세 페이지에서 한 클릭으로 상품 URL 복사
- **이름 툴팁**: 말줄임(...)이 적용된 상품명에 마우스를 올리면 전체 이름 표시
- **검색 상태 유지**: URL 기반 검색 상태 관리로 뒤로가기/앞으로가기 시 검색 결과 보존
- **아바타 필터 정확도 개선**: 인기 아바타 클릭 시 "3D衣装" 카테고리 자동 적용

#### 반응형 사이드바 / Responsive Sidebar

- **창 크기 대응**: 1024px 미만에서 사이드바가 아이콘 모드(w-14)로 자동 축소, 1024px 이상에서 전체 모드(w-56)로 복원
- **Responsive layout**: Sidebar collapses to icon-only mode below 1024px, expands fully above. Favorites page collection sidebar hidden on small windows with dropdown replacement.

#### 접근성(a11y) 개선 / Accessibility

- **Skip navigation**: "본문으로 건너뛰기" 링크 (Tab 키 첫 포커스)
- **시맨틱 HTML**: `role="search"`, `role="list"`, `role="navigation"`, `aria-label`, `aria-pressed`, `aria-current` 등 적용
- **모션 감소**: `prefers-reduced-motion` 미디어 쿼리 지원 — 시스템 설정에 따라 애니메이션 자동 비활성화
- **검색 제안 접근성**: 드롭다운에 `role="listbox"` / `role="option"` / `aria-selected` 적용

#### 영어 지원 확장 / English Language Support

- **인기 아바타 영어 이름**: 20개 인기 아바타에 영어 이름 추가 (언어 설정에 따라 자동 전환)
- **영어→일본어 검색 제안**: 영문 입력 시 일본어 변환 제안 표시 (예: "dress" → "ワンピース", "kipfel" → "キプフェル")
- **i18n 완전성**: 모든 하드코딩된 한국어/영어 텍스트를 i18n 키로 전환 (10개 컴포넌트, 12개 신규 키)
- **English avatar names**: 20 popular avatars now display English names when language is set to English.
- **English→Japanese suggestions**: Typing English triggers Japanese conversion suggestions (e.g., "dress" → "ワンピース").
- **Full i18n coverage**: All remaining hardcoded strings converted to i18n keys.

#### 번역 기능 / Translation Feature

- **일본어→한국어 번역**: 상품명 및 설명을 한 클릭으로 한국어 번역 (Lingva API)
- **3단계 캐시**: 메모리 → SQLite → Lingva API 순으로 조회하여 반복 번역 최소화
- **Japanese→Korean translation**: One-click translation of item names and descriptions via Lingva API with 3-tier caching.

#### 코드 품질 및 보안 / Quality & Security

9건의 코드 품질 및 보안 이슈 수정:
- 가격 필터 NaN 검증 강화
- Booth.pm 호스트명 정규식 강화
- 번역 Promise rejection 처리
- 태그 길이 제한 (100자)
- `parseInt` NaN 안전 처리
- `setTimeout` 정리(cleanup) 추가
- 에러 추출 fallback 개선
- silent catch에 `console.warn` 추가

#### 개발 도구 / Developer Tooling

- **ESLint + Prettier**: 코드 린팅 및 포매팅 도구 추가
- **Linux 빌드 지원**: DEB, RPM, AppImage 형식 빌드 타겟 추가
- **GitHub 브랜치 전략**: `main` (안정) + `dev` (개발) 분리

---

### 다운로드 / Download

| 파일 / File | 설명 / Description |
|------|------|
| `BoothHunter_0.3.0_x64-setup.exe` | Windows NSIS 설치 프로그램 (권장 / Recommended) |
| `BoothHunter_0.3.0_x64_en-US.msi` | Windows MSI 설치 패키지 |
| `BoothHunter_0.3.0_amd64.deb` | Linux DEB 패키지 (Ubuntu/Debian) |
| `BoothHunter_0.3.0_x86_64.rpm` | Linux RPM 패키지 (Fedora/RHEL) |
| `BoothHunter_0.3.0_amd64.AppImage` | Linux AppImage (portable) |

---

### 시스템 요구사항 / System Requirements

- **Windows**: Windows 10 이상 (64-bit), WebView2 필요 (Windows 10+ 기본 포함)
- **Linux**: WebKitGTK 4.1+ 필요

---

### 참고 / Notes

- 코드 서명이 적용되지 않아 SmartScreen 경고가 나올 수 있습니다. "추가 정보" → "실행"을 눌러주세요.
- Code signing is not applied. You may see a SmartScreen warning — click "More info" → "Run anyway".
- 일부 백신(Arctic Wolf, Cynet, WithSecure 등)에서 오탐이 발생할 수 있습니다. booth.pm에 HTTPS 요청하는 정상 동작이 hijacker로 오인된 것입니다.
- Some antivirus software may flag the app as a false positive due to HTTPS requests to booth.pm.

---

### FAQ

**Q: 언어를 영어로 바꾸려면?**
**How do I switch to English?**

A: 사이드바 하단의 언어 선택에서 "English"를 선택하면 전체 UI가 영어로 전환됩니다. 인기 아바타 이름도 영어로 표시됩니다.
Select "English" from the language selector at the bottom of the sidebar. Avatar names will also switch to English.

---

**Q: 영어로 검색할 수 있나요?**
**Can I search in English?**

A: 네. 영어를 입력하면 자동으로 일본어 변환 제안이 표시됩니다. 예를 들어 "dress"를 입력하면 "ワンピース"가 제안됩니다. 제안을 클릭하면 해당 일본어로 Booth.pm을 검색합니다.
Yes. English input triggers Japanese conversion suggestions (e.g., "dress" → "ワンピース"). Click a suggestion to search Booth.pm with the Japanese term.

---

**Q: 번역 기능은 어떻게 사용하나요?**
**How does translation work?**

A: 상품 카드나 상세 페이지에서 번역 아이콘(🌐)을 클릭하면 상품명이 한국어로 번역됩니다. 상세 페이지에서는 상품 설명도 번역할 수 있습니다. 번역 결과는 캐시되어 같은 텍스트는 즉시 표시됩니다.
Click the translation icon on item cards or detail pages. Results are cached locally for instant display on repeat views.

---

**Q: 검색 결과가 나오지 않아요.**
**Search returns no results.**

A: 다음을 확인하세요:
- 인터넷 연결이 되어 있는지 확인합니다.
- 일본어 키워드로 검색하면 결과가 더 정확합니다. 한국어/영어 입력 시 자동 변환 제안을 활용하세요.
- "Rate limited" 오류가 나타나면 잠시 후 다시 시도하세요 (Booth.pm의 요청 제한).

Check your internet connection. Japanese keywords yield the best results — use the auto-conversion suggestions when typing in Korean or English. If you see "Rate limited", wait a moment and retry.

---

**Q: 좋아요 수가 바로 표시되지 않아요.**
**Wish counts don't appear immediately.**

A: 좋아요(Wish) 데이터는 검색 후 백그라운드에서 순차적으로 불러옵니다. 필터 패널에 "로딩 중..." 표시가 사라지면 모든 데이터가 로드된 것입니다.
Wish count data loads in the background after search. Wait for the "Loading..." indicator in the filter panel to disappear.

---

**Q: 설치 시 Windows SmartScreen 경고가 나와요.**
**I see a Windows SmartScreen warning during installation.**

A: 코드 서명이 없는 개인 프로젝트이므로 정상적인 경고입니다. "추가 정보" → **"실행"**을 클릭하면 설치가 진행됩니다.
This is expected for unsigned personal projects. Click "More info" → "Run anyway" to proceed.

---

**Q: 즐겨찾기 데이터는 어디에 저장되나요?**
**Where is my data stored?**

A: 앱 데이터 폴더의 SQLite 데이터베이스에 로컬 저장됩니다.
- Windows: `C:\Users\{사용자}\AppData\Roaming\com.boothhunter.desktop\boothhunter.db`
- Linux: `~/.local/share/com.boothhunter.desktop/boothhunter.db`
- 서버 전송 없이 100% 로컬에서 관리됩니다. / 100% local, no server communication.

---

**Q: 컬렉션을 삭제하면 즐겨찾기도 삭제되나요?**
**Does deleting a collection remove my favorites?**

A: 아니요. 컬렉션을 삭제해도 즐겨찾기 자체는 그대로 유지됩니다. 컬렉션-상품 간의 연결만 제거됩니다.
No. Deleting a collection only removes the collection-item links. Your favorites remain intact.

---

**Q: 검색이 느려요.**
**Search is slow.**

A: Booth.pm의 요청 제한 정책에 맞춰 초당 1회로 제한하고 있습니다. 이는 IP 차단을 방지하기 위한 것이며, 정상 동작입니다.
Requests are rate-limited to 1 per second to respect Booth.pm's policies and prevent IP bans.

---

**Q: 앱을 제거하려면?**
**How do I uninstall?**

A: Windows: 설정 > 앱 > BoothHunter > 제거. Linux: 패키지 관리자로 제거. 데이터베이스 파일을 완전히 삭제하려면 위의 AppData/data 경로에서 `com.boothhunter.desktop` 폴더를 수동 삭제하세요.
Windows: Settings > Apps > BoothHunter > Uninstall. Linux: Use your package manager. To fully remove data, manually delete the `com.boothhunter.desktop` folder from the paths listed above.

---

**Q: v0.1.0에서 업데이트하면 데이터가 유지되나요?**
**Will my data be preserved when upgrading from v0.1.0?**

A: 네. 데이터베이스 마이그레이션이 자동으로 실행되어 기존 즐겨찾기, 컬렉션, 태그, 검색 기록이 모두 유지됩니다.
Yes. Database migrations run automatically, preserving all favorites, collections, tags, and search history.
