# CurrencyExchangeApp (환율 변환기) — CLAUDE.md

> 이 문서는 Claude Code가 본 프로젝트에서 작업할 때 반드시 따라야 하는 아키텍처·코드 규칙을 정의합니다.

---

## 1. Project Overview

- **앱 이름**: CurrencyExchangeApp (환율 변환기)
- **태그라인**: 실시간 환율 조회 + 오프라인 캐시
- **목적**: frankfurter.app 공개 API로 30종 이상 통화의 실시간 환율을 조회하고, 30분 TTL 캐시 + 오프라인 stale 폴백으로 네트워크 없이도 변환이 동작하는 가벼운 금융 유틸.
- **타깃**: iOS / Android (React Native, New Architecture)
- **핵심 가치**: 즉시성 (instant), 오프라인 (offline-first), 명료 (clarity)
- **저장소**: MMKV (로컬 only, 즐겨찾기/최근 조회/환율 캐시)
- **외부 API**: `https://api.frankfurter.app` (API 키 없음, ECB 데이터, CORS OK)
- **Rate TTL**: 30분 (`RATE_TTL_MS = 30 * 60 * 1000`)
- **히스토리 용량**: 최근 조회 10건 (cap-10), 즐겨찾기 20건 (cap-20)
- **위젯**: 없음

---

## 2. Clean Architecture

```
src/
├── domain/              # 순수 비즈니스 로직 (RN 의존성 0%)
│   ├── models/          # Currency.ts: CurrencyInfo, ExchangeRate, ConversionResult, RecentLookup, FavoritePair, ExchangeState
│   ├── usecases/        # validateCurrencyCode, convertAmount, formatCurrencyAmount, isRateStale, generateLookupId
│   └── repositories/    # CurrencyRepository, LookupHistoryRepository, FavoritesRepository
├── data/
│   ├── datasources/     # FrankfurterCurrencyDataSource (fetch + 10s timeout), MmkvRateCacheDataSource
│   ├── repositories/    # FrankfurterCurrencyRepository, MmkvLookupHistoryRepository, MmkvFavoritesRepository
│   ├── storage/         # mmkvStorage.ts (createMMKV)
│   └── config.ts        # FRANKFURTER_BASE_URL, RATE_TTL_MS, FETCH_TIMEOUT_MS, MMKV_KEY, caps
├── presentation/
│   ├── screens/         # ExchangeScreen, CurrencyPickerSheet
│   ├── components/common/ # ThrottledPressable, PlatformIcon
│   ├── navigation/      # AppNavigator (Stack, single screen)
│   ├── theme/           # Material Design 3 tokens
│   └── hooks/
├── store/               # Redux Toolkit (currencySlice)
├── di/                  # DependencyProvider
├── utils/               # logger, appError
└── i18n/                # ko / en 리소스
```

### 의존성 규칙

| Layer | 의존 가능 | 의존 금지 |
|-------|----------|----------|
| domain | (없음) | data, presentation, store, RN |
| data | domain | presentation, store |
| store | domain, data (DI 통해서만) | presentation |
| presentation | domain, store, di | data 직접 import 금지 |

---

## 3. TypeScript Strict Mode

- `any` 사용 금지. 정말 필요하면 `unknown` 후 narrowing.
- Domain 모델은 모두 `readonly` 필드.
- Redux state(`CurrencyState`)는 Immer 제약으로 mutable 타입이지만, 노출된 도메인 타입은 readonly.
- `npx tsc --noEmit` 0 errors.

---

## 4. React Compiler

- React Compiler 활성화 전제. `useMemo`, `useCallback`, `React.memo` 수동 사용 금지.
- 예외: `ThrottledPressable` 내부 `useCallback`, `DependencyProvider`의 `useMemo`, `CurrencyPickerSheet`의 `useImperativeHandle`.

---

## 5. Frankfurter API Integration

### 엔드포인트

- `GET /currencies` → 통화 코드 → 이름 매핑 (30+)
- `GET /latest?from=USD&to=KRW` → 현재 환율

### 캐싱 전략 (필수)

1. `getRate(from, to)` 호출 시 MMKV에서 `rate:${from}:${to}` 키 조회
2. `isRateStale` → fresh면 `isStale: false`로 즉시 반환
3. 아니면 네트워크 호출 — 성공 시 MMKV 업데이트 + `isStale: false` 반환
4. 네트워크 실패 시 stale 캐시 있으면 `isStale: true`로 반환
5. stale 캐시도 없으면 `AppError('NetworkError', ...)` throw

### 네트워크 규칙

- `fetch()` 는 반드시 `AbortController` + 10s 타임아웃으로 감싼다
- 모든 네트워크 오류는 `AppError('NetworkError', ...)`로 정규화
- Redux에는 frankfurter 응답 원본을 저장하지 않는다 — 반드시 `ExchangeRate` 도메인 타입으로 변환
- 통화 목록은 TTL 없는 영구 캐시 (frankfurter는 통화를 제거하지 않음)

---

## 6. React Native UI

### 6.1 Screen Architecture

```
ExchangeScreen.tsx       # 단일 화면 — pair/amount/convert/result/stale/favorite/recent/favorites
CurrencyPickerSheet.tsx  # BottomSheet 모달 — 검색 + FlatList
```

### 6.2 testID

| 요소 | testID |
|------|--------|
| Screen root | `screen.exchange` |
| From chip | `exchange.pair.from` |
| To chip | `exchange.pair.to` |
| Swap button | `exchange.swap` |
| Amount input | `exchange.amount` |
| Convert button | `exchange.convertButton` |
| Result card | `exchange.result` |
| Stale badge | `exchange.stale` |
| Favorite toggle | `exchange.favoriteToggle` |
| Recent chip | `exchange.recent.{id}` |
| Favorite pair chip | `exchange.favorite.{id}` |
| Picker search | `picker.search` |
| Picker item | `picker.item.{code}` |

### 6.3 Accessibility

- Amount input: `accessibilityLabel="금액 입력"` (i18n `exchange.amountAccessibility`)
- Swap button: `accessibilityLabel="통화 쌍 전환"` (i18n `exchange.swap`)
- Stale badge: `accessibilityLabel="{{minutes}}분 전 캐시"` (i18n `exchange.stale`)
- Favorite toggle: `accessibilityState={{checked: isFavorite}}`
- Result output: `accessibilityLabel="{{amount}} {{code}}"`

---

## 7. Design System

**Material Design 3**. 자세한 토큰은 `src/presentation/theme/*`.

- **Primary**: `#00695C` (deep teal, 금융 트러스트) — tip-calculator `#26A69A`와 명확히 구분
- **Primary Dark**: `#003D33`
- **Secondary**: `#FFB300` (favorites/stale badge)
- 시스템 폰트 사용 (iOS=System, Android=sans-serif). Pretendard 미사용.
- **금지**: raw hex, raw fontSize, raw padding, raw borderRadius — 모두 `theme.colors.* / typography.* / spacing.* / borderRadius.*` 토큰 사용
- **헤더 타이틀**: 반드시 `typography.headerTitle` + `headerTitleAlign` (iOS=center, Android=left)
- **첫 콘텐츠 블록 marginTop/paddingTop 금지** — ScrollView `contentContainerStyle` paddingHorizontal/paddingBottom만 사용, 내부 블록은 두 번째 자식부터 marginTop
- **insets.top paddingTop 금지** — React Navigation header가 safe area 처리
- **Pressable 직접 사용 금지** → `ThrottledPressable`
- **MaterialIcons**만 사용: `swap-horiz`, `star`, `star-border`, `search`, `warning`, (refresh)

### 7.1 iOS 폰트 등록 (필수)

`ios/CurrencyExchangeApp/Info.plist` → `UIAppFonts` 배열에 `MaterialIcons.ttf`. `react-native-asset` 금지.

### 7.2 Android MaterialIcons 번들링 (필수)

`android/app/build.gradle` 끝에 `apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"` 필수. 검증: `aapt list app-release.apk | grep MaterialIcons` → `assets/fonts/MaterialIcons.ttf`.

### 7.3 Babel Worklets Plugin (필수)

`babel.config.js`에 `react-native-worklets/plugin` 필수 (reanimated 4 + @gorhom/bottom-sheet 런타임 요구).

### 7.4 MainActivity `super.onCreate(null)` (필수)

react-native-screens fragment 복원 크래시 방지.

---

## 8. Currency Formatting

`formatCurrencyAmount(amount, code)` — **Intl.NumberFormat 사용 금지** (Hermes ICU 회피).

- `KRW`, `JPY`: 소수점 없음, 천단위 쉼표, `₩` / `¥` 기호
- `USD`: `$1,234.56` (dot decimal, comma thousands)
- `GBP`: `£1,234.56`
- `EUR`: `€1.234,56` (comma decimal, dot thousands — 유럽 방식)
- 기타: `CODE 1,234.56` (default)
- 음수 지원: `-$100.00`, `-₩1,340`

---

## 9. Redux Toolkit

### 9.1 Slice 구조

```
src/store/
├── store.ts              # configureStore
├── currencySlice.ts      # currencies + pair + amount + exchangeState + history + favorites
├── selectors.ts          # selectCurrencies, selectExchangeState, selectIsFavorited...
├── repositoryRefs.ts     # DI bridge (3 repos)
└── hooks.ts              # typed useAppDispatch / useAppSelector
```

### 9.2 currencySlice 설계

- `exchangeState`: discriminated union `{kind: idle|loading|ready|error}`
- Thunks: `loadCurrencies`, `loadHistory`, `loadFavorites`, `convert`, `addToHistory`, `addFavorite`, `removeFavorite`
- 원시 API 응답을 절대 저장하지 않음 — 항상 `ExchangeRate` 도메인 타입

### 9.3 Persistence

- MMKV (`currency-exchange-storage`) 에 JSON 직렬화
- Redux는 메모리 캐시. 앱 시작 시 `loadCurrencies` + `loadHistory` + `loadFavorites`로 부팅

---

## 10. Navigation

단일 `createStackNavigator` (`@react-navigation/stack`). 한 개의 스크린 `Exchange`만 등록. 헤더 타이틀은 `app.title` i18n 키 (`환율 변환기` / `Currency Exchange`).

---

## 11. Dependency Injection

- `src/di/DependencyProvider.tsx` — `FrankfurterCurrencyRepository`, `MmkvLookupHistoryRepository`, `MmkvFavoritesRepository` 싱글톤 생성 후 `setCurrencyRepository`/`setLookupHistoryRepository`/`setFavoritesRepository`로 store에 주입.
- 화면은 절대 `data/` layer를 직접 import 하지 않음.

---

## 12. i18n

- **react-i18next**, 기본 언어 `ko`, fallback `ko`.
- 키 컨벤션: `app.*`, `common.*`, `exchange.*`, `picker.*`.
- **하드코딩 문자열 금지**.

---

## 13. Testing

| 종류 | 도구 | 대상 |
|------|------|------|
| Unit (pure) | Jest | domain/usecases |
| Unit (repo) | Jest + fake DS | data/repositories (cache/fallback 로직) |

- Pure usecase 테스트 + 캐시 폴백 테스트 합계 **48건 통과**.
  - `validateCurrencyCode` 10건
  - `convertAmount` 8건
  - `formatCurrencyAmount` 16건
  - `isRateStale` 6건
  - `generateLookupId` 3건
  - `FrankfurterCurrencyRepository` 5건 (fresh cache hit / no cache success / stale fallback / throw when no cache)
- Given-When-Then 한국어 주석.

---

## 14. 작업 체크리스트

- [ ] 의존성 방향 위반 없음
- [ ] `any` 사용 없음
- [ ] `useMemo`/`useCallback` 수동 사용 없음 (명시된 예외 제외)
- [ ] 하드코딩 문자열 없음 (i18n)
- [ ] testID 부착됨
- [ ] Pure usecase 테스트 통과
- [ ] `npx tsc --noEmit` 0 errors
- [ ] `rg "fontSize:\s*\d+" src/presentation` 0 matches
- [ ] `rg "'#[0-9A-Fa-f]{3,8}'" src/presentation/screens` 0 matches
- [ ] iOS Release 빌드 성공
- [ ] Android Release APK 빌드 성공 (keystore 서명)
- [ ] MaterialIcons가 iOS/Android 양쪽에서 정상 렌더링
- [ ] `Intl.NumberFormat` 사용 없음
- [ ] 네트워크 호출이 `AbortController` + 10s 타임아웃으로 감싸짐
- [ ] stale 캐시 폴백 동작 확인 (오프라인 테스트)

---

## 15. Android Release Build

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
cd android && ./gradlew assembleRelease
```

- Keystore: `android/app/keystore.jks` (워크스페이스 공용 키)
- `gradle.properties`의 `RELEASE_*` 프로퍼티 사용
- 빌드 전 `grep "fonts.gradle" android/app/build.gradle` 필수
- 빌드 후 `aapt list app-release.apk | grep MaterialIcons` 검증

## 16. iOS Release Build

```bash
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
cd ios && pod install && cd ..
npx react-native run-ios --mode Release --no-packager --simulator="iPhone 17 Pro"
```

- `--mode Release` + `--no-packager` 필수 (Metro 포트 점유 방지)
