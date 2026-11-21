# WP-02a: Navigation Foundation + News Vertical Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve ADR-002 (navigation library) by adopting React Navigation, wire it into the existing `App.tsx` root, and ship the first real vertical slice of product functionality — a public, read-only News list and detail screen backed by a synthetic seeded repository — proving the full stack (screen → navigation → repository → fixtures) end to end with tests and a live visual check. This is the News half of SDD.md's WP-02 ("Public news list/detail and services catalogue"); the Services half follows as a separate plan (WP-02b) once this pattern is proven.

**Architecture:** `@react-navigation/native-stack` provides the navigator; `App.tsx` stays the single root entry point (unlike a file-based router, nothing here requires a reserved `app/` directory or a `package.json` "main" field change) and now wraps `AppShell` → `SafeAreaProvider` → `NavigationContainer` → `RootNavigator`. Each screen in `src/features/<feature>/screens/` stays navigation-agnostic (plain props in, callbacks out); thin "route" wrapper components under `src/navigation/routes/` translate React Navigation's `navigation`/`route` props into those plain props, so the screens themselves are unit-testable without a navigation context. Screens depend on a `Repository` interface (not a concrete HTTP client — no backend exists yet, ADR-007 is still OPEN) implemented for now by an in-memory fixture-backed class, so swapping in a real HTTP client later changes only the repository implementation, not the screens. A shared `ScreenLayout` component (loading/empty/error/ready states) and shared pagination/error envelope types are introduced now so the Services vertical (WP-02b) reuses them unchanged.

**Tech Stack:** `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`, Jest + React Native Testing Library (already in place from WP-00/WP-01).

**Spec:** `docs/PRD.md` EPIC-02 (Home/navigation), EPIC-04 (News, acceptance criteria: unpublished items never appear publicly, pagination avoids duplicate content, broken images have fallbacks); `docs/SAD.md` §5 (mobile architecture: Router → Screens → Repository interfaces → Client/Cache), §15 (ADR-002, currently OPEN — `SDD.md` §3's note reserving `apps/mobile/app/` "if Expo Router approved" does not apply once this ADR picks React Navigation instead); `docs/SDD.md` §4.1–4.2 (feature modules, `ScreenLayout`/`ArticleCard` component contracts), §6/§6.2 (Article data shape, terminology), §7 (`GET /public/news`, `GET /public/news/{id}`, pagination/error envelope shapes), §11 (Article state machine: `draft -> in_review -> published -> archived`); `AGENTS.md` §3 (B-003 "Feed UI, content contracts, fake CMS" is explicitly allowed now), §4 ("Navigation: ... requires ADR"), §6 (accessibility, dependency-reason recording).

## Global Constraints

- TypeScript `strict: true` (already enforced repo-wide).
- Feature-first structure: `src/features/news/{components,screens,domain,data,__tests__}`; screens stay navigation-agnostic (props/callbacks only); `src/navigation/routes/` holds the thin wrappers that connect screens to React Navigation's `navigation`/`route` props (`SAD.md` §5, `AGENTS.md` §4).
- No live backend: the `NewsRepository` interface's only implementation in this plan is fixture-backed. Method signatures must match what a real HTTP client implementation would need later (`AGENTS.md` §3: ADR-007 backend framework is still OPEN).
- Accessibility: headings use `accessibilityRole="header"` (established WP-01 pattern — do not reintroduce inert `accessibilityLabel` on a non-`accessible` container).
- PRD EPIC-04 acceptance criteria are binding: unpublished/draft/archived articles must never be returned by the repository to any screen (not filtered at the screen layer — enforced in the repository itself); pagination must never return the same article twice or skip one across pages; a missing image must show an accessible fallback, never a broken `<Image>`.
- An article detail request for a nonexistent id and for an existing-but-unpublished id must produce the *same* "not found" presentation — never a response that lets a user distinguish "doesn't exist" from "exists but isn't published yet" (that distinction itself would leak the existence of unpublished drafts).
- RED → GREEN → REFACTOR for every behavior; run the actual test command and read its output before claiming done (`AGENTS.md` §5, `SDD.md` §12).
- Out of scope for this plan: Services catalogue (WP-02b, separate plan), service/article enquiry or submission UI (SDD.md §14 WP-07, not WP-02), admin CMS (WP-03), any live API client (ADR-007 OPEN), native deep-link scheme configuration (only web URL linking is wired, to keep Task 8's visual verification working — native `app.json` scheme setup is a follow-up).

## Review Focus

- **Unpublished content leaking through a code path other than the list screen.** The filtering must live in the repository's `listPublished`/`getById`, not be re-implemented per screen — a future screen that calls the repository directly must not need to remember to filter. → Task 4's repository tests assert this at the repository layer directly, not through a screen.
- **Pagination duplicate or skipped article across page boundaries** (off-by-one in cursor math). → Task 4 includes a two-page fetch test asserting the combined id set has no duplicates and exact coverage of all published fixtures.
- **Detail screen for a nonexistent or unpublished id crashing or rendering blank** instead of a clear, identical "not found" state for both cases. → Task 7's detail screen tests cover a nonexistent id and (separately) an id that resolves to `null` the same way an unpublished one would, asserting the same message both times.
- **Missing/broken article image rendering as a broken image with no accessible description.** → Task 5's `ArticleCard` tests assert an accessible fallback view appears when `imageUrl` is absent, and the real image's accessible label appears when it is present.
- **React Navigation conversion silently dropping the `AppShell` error boundary** that WP-01 already built and tested, because `App.tsx`'s body changes from directly rendering `WelcomeScreen` to wrapping a `NavigationContainer`. → Task 2 adds a direct test on `App` asserting `AppShell` is actually invoked when the component renders.

---

### Task 1: ADR-002 — adopt React Navigation

**Files:**
- Create: `docs/adr/ADR-002-navigation-library.md`
- Modify: `docs/SAD.md` (§15 ADR table row for ADR-002: OPEN → ACCEPTED)
- Modify: `apps/mobile/AGENTS.md` (remove/update the "Override: this file's Navigation section is currently blocked" block added during the WP-00/WP-01 final review — ADR-002 is no longer open after this task; also correct its "Use Expo Router" guidance, since that is not the library this project adopts)

**Interfaces:**
- Produces: a recorded, ACCEPTED architecture decision that Task 2 onward implements. No code interface — this is a documentation task.

- [ ] **Step 1: Write the ADR**

```markdown
# ADR-002 — Navigation library: React Navigation

**Status:** ACCEPTED
**Date:** 2026-11-21
**Decision owner:** Architect (R/A), Product Owner (C), Engineering (C)

## Context

`SAD.md` §5 and §15, and `AGENTS.md` §4, flagged navigation library choice
(Expo Router vs React Navigation) as an open decision requiring an ADR
before use, with SAD's own default recommendation text: "Select after
navigation validation." WP-02 (news list → detail, services list → detail)
is the first point in this project where real inter-screen navigation is
actually needed — exactly that validation moment.

The `create-expo-app` template's own generated `apps/mobile/AGENTS.md`
assumed Expo Router and documented its file-based `app/` convention
(flagged as blocked by this still-open ADR during the WP-00/WP-01 final
review). `SDD.md` §3's canonical repository structure conditionally
reserved `apps/mobile/app/ # route entrypoints, if Expo Router approved` —
that condition is not met by this decision.

## Decision

Adopt **React Navigation** (`@react-navigation/native` +
`@react-navigation/native-stack`) for all navigation, per explicit product
direction, instead of Expo Router.

Consequences of this choice relative to the alternative:
- `App.tsx` remains the single root entry point — no `app/` directory, no
  `package.json` "main" field change, no `expo-router/entry`. This is a
  smaller change to the existing WP-00/WP-01 scaffold than converting to
  file-based routing would have been.
- Screens stay fully navigation-agnostic (plain props and callbacks);
  thin wrapper components under `src/navigation/routes/` adapt React
  Navigation's `navigation`/`route` props to those plain screen props.
  This keeps every screen's own tests free of any navigation-library
  dependency.
- URL-based web navigation (used for this plan's visual verification) is
  opt-in via React Navigation's `linking` configuration, not automatic the
  way file-based routing makes it — `src/navigation/linking.ts` in Task 2
  provides this for the routes this plan adds.
- Deep-linking beyond web verification (a native `app.json` URL scheme) is
  not configured in this plan — tracked as a known gap.

## Consequences

- `SAD.md` §15's ADR-002 row and `apps/mobile/AGENTS.md`'s override note
  (added during the WP-00/WP-01 final review, and originally written
  assuming Expo Router) are corrected and updated by this same task.
- `react-native-screens` and `react-native-safe-area-context` become
  required dependencies (React Navigation's native-stack peer
  requirements) — the same two packages Expo Router would also have
  needed.
- The `AppShell` error boundary now wraps `SafeAreaProvider` →
  `NavigationContainer` → `RootNavigator` inside `App.tsx`, rather than
  wrapping `WelcomeScreen` directly as it did in WP-01.

## Status and next steps

1. ~~Update `SAD.md` §15 and `apps/mobile/AGENTS.md` to mark this
   ACCEPTED.~~ **Done — this same task.**
2. Wire `@react-navigation/native-stack` into `App.tsx` — Task 2 of
   `docs/superpowers/plans/2026-11-21-wp02a-navigation-and-news.md`.
```

- [ ] **Step 2: Update `SAD.md` §15's ADR-002 row**

Find the row:
```
| ADR-002 | Expo Router vs React Navigation | Select after navigation validation | OPEN |
```
Replace with:
```
| ADR-002 | Expo Router vs React Navigation | **ACCEPTED: React Navigation** — see `docs/adr/ADR-002-navigation-library.md` | **ACCEPTED** |
```

- [ ] **Step 3: Replace the now-resolved (and now-incorrect) override block in `apps/mobile/AGENTS.md`**

Find the block added during the WP-00/WP-01 final review (starts with `## Override: this file's Navigation section is currently blocked`, and the "Navigation & Routing" section below it that assumes Expo Router's `src/app/` convention). Replace the override block with:

```markdown
## Navigation: resolved — do not use Expo Router

ADR-002 (Expo Router vs React Navigation) is now **ACCEPTED** — see
`docs/adr/ADR-002-navigation-library.md`. This project uses
**React Navigation** (`@react-navigation/native-stack`), not Expo Router.
The "Navigation & Routing" section below (from the Expo template) describes
Expo Router and does **not** apply to this project — ignore its `src/app/`
file-based routing instructions. Screens live under
`src/features/<feature>/screens/`; navigation wiring lives under
`src/navigation/` per root `AGENTS.md` §4.
```

- [ ] **Step 4: Verify the edits**

```bash
cd /Users/henrisetiawan/kadin_verse
grep -n "ADR-002" docs/SAD.md
grep -n "Navigation: resolved" apps/mobile/AGENTS.md
test -f docs/adr/ADR-002-navigation-library.md && echo "ADR-002 file present"
```

Expected: the `SAD.md` grep shows the ACCEPTED row; the `AGENTS.md` grep finds the new heading; `ADR-002 file present` prints.

- [ ] **Step 5: Commit**

```bash
git add docs/adr/ADR-002-navigation-library.md docs/SAD.md apps/mobile/AGENTS.md
git commit -m "docs: accept ADR-002 (React Navigation) for navigation"
```

---

### Task 2: Install React Navigation and wire it into `App.tsx`

**Files:**
- Modify: `apps/mobile/package.json` (new deps)
- Create: `apps/mobile/src/navigation/RootNavigator.tsx`
- Create: `apps/mobile/src/navigation/linking.ts`
- Create: `apps/mobile/src/navigation/routes/HomeRoute.tsx`
- Modify: `apps/mobile/App.tsx`
- Create: `apps/mobile/__tests__/App.test.tsx`

**Interfaces:**
- Consumes: `AppShell` from `src/shared/ui/AppShell` (WP-01), `WelcomeScreen` from `src/features/shell/screens/WelcomeScreen` (WP-01).
- Produces: `RootStackParamList` type and `RootNavigator` (consumed by Task 7's `NewsListRoute`/`NewsDetailRoute`, which add screens to it).

- [ ] **Step 1: Install React Navigation and its required peers**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

Expected: exits 0.

- [ ] **Step 2: Create the navigator's param list and component (Home screen only for now — Task 7 adds News screens to it)**

```tsx
// apps/mobile/src/navigation/RootNavigator.tsx
import type { ReactElement } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeRoute } from './routes/HomeRoute';

export type RootStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerTitle: 'KADIN Indonesia' }}>
      <Stack.Screen name="Home" component={HomeRoute} options={{ headerTitle: 'KADIN Indonesia' }} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 3: Create the web linking config (extended by Task 7 once News screens exist)**

```ts
// apps/mobile/src/navigation/linking.ts
import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './RootNavigator';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['http://localhost:19006'],
  config: {
    screens: {
      Home: '',
    },
  },
};
```

- [ ] **Step 4: Create the Home route wrapper, reusing the existing `WelcomeScreen`**

```tsx
// apps/mobile/src/navigation/routes/HomeRoute.tsx
import type { ReactElement } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { WelcomeScreen } from '../../features/shell/screens/WelcomeScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeRoute(_props: Props): ReactElement {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <WelcomeScreen />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
});
```

(The "Lihat Berita" link is intentionally deferred to Task 7, once `NewsList` actually exists as a screen to navigate to — adding a dead link now would violate the "no false claim" spirit that governs this codebase's UI.)

- [ ] **Step 5: Wire `App.tsx`**

```tsx
// apps/mobile/App.tsx
import type { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppShell } from './src/shared/ui/AppShell';
import { RootNavigator } from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';

export default function App(): ReactElement {
  return (
    <AppShell>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AppShell>
  );
}
```

- [ ] **Step 6: Write the failing test confirming `AppShell` still wraps the app**

```tsx
// apps/mobile/__tests__/App.test.tsx
import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/navigation/RootNavigator', () => ({
  RootNavigator: () => null,
}));

jest.mock('../src/shared/ui/AppShell', () => {
  const actual = jest.requireActual('../src/shared/ui/AppShell');
  return {
    AppShell: jest.fn(actual.AppShell),
  };
});

import App from '../App';
import { AppShell } from '../src/shared/ui/AppShell';

describe('App', () => {
  it('wraps the navigation tree in AppShell', () => {
    render(<App />);
    expect(AppShell).toHaveBeenCalled();
  });
});
```

- [ ] **Step 7: Run it and confirm it passes**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest __tests__/App.test.tsx
```

Expected: `1 passed, 1 total`. If it fails, the mock wiring or `App.tsx` itself is wrong — fix before proceeding (this test exists specifically to catch a dropped `AppShell` wrapper; do not weaken the assertion to make it pass).

- [ ] **Step 8: Run the full suite and typecheck**

```bash
npx jest
npx tsc --noEmit
```

Expected: the `WelcomeScreen` and `AppShell` suites from WP-01 still pass (6 tests), plus the new `App` test (7 total); `tsc --noEmit` exits 0.

- [ ] **Step 9: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add -A
git status
git commit -m "feat(mobile): adopt React Navigation per ADR-002, wire NavigationContainer into App.tsx"
```

---

### Task 3: Shared pagination/error types and `ScreenLayout`

**Files:**
- Create: `apps/mobile/src/shared/api/types.ts`
- Create: `apps/mobile/src/shared/ui/ScreenLayout.tsx`
- Create: `apps/mobile/src/shared/ui/__tests__/ScreenLayout.test.tsx`

**Interfaces:**
- Produces: `PaginatedResult<T>`, `ApiError` types (consumed by Task 4's repository and, later, WP-02b's Services repository); `ScreenLayout` component with `ScreenState = 'loading' | 'empty' | 'error' | 'ready'` (consumed by Task 6 and Task 7's screens).

- [ ] **Step 1: Write the shared API envelope types (no test needed — pure type declarations, verified by `tsc` in later tasks that use them)**

```ts
// apps/mobile/src/shared/api/types.ts
export interface PaginatedResult<T> {
  data: T[];
  page: {
    nextCursor: string | null;
    limit: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  requestId: string;
}
```

- [ ] **Step 2: Write the failing `ScreenLayout` tests**

```tsx
// apps/mobile/src/shared/ui/__tests__/ScreenLayout.test.tsx
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ScreenLayout } from '../ScreenLayout';

describe('ScreenLayout', () => {
  it('shows a loading indicator in the loading state', () => {
    render(
      <ScreenLayout state="loading">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.getByLabelText('Memuat data')).toBeTruthy();
  });

  it('shows the default error message in the error state', () => {
    render(
      <ScreenLayout state="error">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.getByText('Terjadi kesalahan. Silakan coba lagi.')).toBeTruthy();
  });

  it('shows a custom error message when provided', () => {
    render(
      <ScreenLayout state="error" errorMessage="Artikel tidak ditemukan.">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.getByText('Artikel tidak ditemukan.')).toBeTruthy();
  });

  it('shows the empty message in the empty state', () => {
    render(
      <ScreenLayout state="empty">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.getByText('Belum ada data untuk ditampilkan.')).toBeTruthy();
  });

  it('renders children only in the ready state', () => {
    render(
      <ScreenLayout state="ready">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('does not render children in the loading state', () => {
    render(
      <ScreenLayout state="loading">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.queryByText('content')).toBeNull();
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/shared/ui/__tests__/ScreenLayout.test.tsx
```

Expected: FAIL — `Cannot find module '../ScreenLayout'`.

- [ ] **Step 4: Write the minimal implementation**

```tsx
// apps/mobile/src/shared/ui/ScreenLayout.tsx
import type { ReactElement, ReactNode } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ScreenState = 'loading' | 'empty' | 'error' | 'ready';

export interface ScreenLayoutProps {
  state: ScreenState;
  errorMessage?: string;
  emptyMessage?: string;
  children: ReactNode;
}

export function ScreenLayout({
  state,
  errorMessage = 'Terjadi kesalahan. Silakan coba lagi.',
  emptyMessage = 'Belum ada data untuk ditampilkan.',
  children,
}: ScreenLayoutProps): ReactElement {
  return (
    <SafeAreaView style={styles.safeArea}>
      {state === 'loading' && (
        <View style={styles.centered} accessibilityLabel="Memuat data">
          <ActivityIndicator size="large" />
        </View>
      )}
      {state === 'error' && (
        <View style={styles.centered} accessibilityLabel={errorMessage}>
          <Text>{errorMessage}</Text>
        </View>
      )}
      {state === 'empty' && (
        <View style={styles.centered} accessibilityLabel={emptyMessage}>
          <Text>{emptyMessage}</Text>
        </View>
      )}
      {state === 'ready' && children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
```

- [ ] **Step 5: Run it and confirm it passes**

```bash
npx jest src/shared/ui/__tests__/ScreenLayout.test.tsx
```

Expected: `6 passed, 6 total`.

- [ ] **Step 6: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/shared/api/types.ts apps/mobile/src/shared/ui/ScreenLayout.tsx apps/mobile/src/shared/ui/__tests__/ScreenLayout.test.tsx
git commit -m "feat(mobile): add shared pagination/error types and ScreenLayout"
```

---

### Task 4: News domain types, fixtures, and `FixtureNewsRepository`

**Files:**
- Create: `apps/mobile/src/features/news/domain/types.ts`
- Create: `apps/mobile/src/features/news/data/newsRepository.ts`
- Create: `apps/mobile/src/features/news/data/newsFixtures.ts`
- Create: `apps/mobile/src/features/news/data/fixtureNewsRepository.ts`
- Create: `apps/mobile/src/features/news/data/__tests__/fixtureNewsRepository.test.ts`

**Interfaces:**
- Consumes: `PaginatedResult<T>` from `src/shared/api/types` (Task 3).
- Produces: `Article` type, `NewsRepository` interface (`listPublished`, `getById`), `FixtureNewsRepository` class — consumed by Task 6 (`NewsListScreen`) and Task 7 (`NewsDetailScreen`).

- [ ] **Step 1: Write the domain type**

```ts
// apps/mobile/src/features/news/domain/types.ts
export type ArticleStatus = 'draft' | 'in_review' | 'published' | 'archived';

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  status: ArticleStatus;
  organizationId: string;
  authorId: string;
  publishedAt: string | null;
  version: number;
  imageUrl?: string;
}
```

- [ ] **Step 2: Write the repository interface**

```ts
// apps/mobile/src/features/news/data/newsRepository.ts
import type { Article } from '../domain/types';
import type { PaginatedResult } from '../../../shared/api/types';

export interface NewsRepository {
  listPublished(params: { cursor?: string | null; limit: number }): Promise<PaginatedResult<Article>>;
  getById(id: string): Promise<Article | null>;
}
```

- [ ] **Step 3: Write the fixtures — 5 published, 1 draft, 1 archived**

```ts
// apps/mobile/src/features/news/data/newsFixtures.ts
import type { Article } from '../domain/types';

export const ARTICLE_FIXTURES: Article[] = [
  {
    id: 'a1', slug: 'kadin-luncurkan-program-umkm', title: 'KADIN Luncurkan Program UMKM Naik Kelas',
    summary: 'Program pendampingan bisnis untuk pelaku UMKM di seluruh Indonesia.',
    body: 'Isi lengkap artikel tentang program UMKM Naik Kelas, mencakup skema pendampingan, target peserta, dan jadwal pelaksanaan di berbagai daerah.',
    status: 'published', organizationId: 'org-1', authorId: 'user-1',
    publishedAt: '2026-11-18T09:00:00.000Z', version: 1,
  },
  {
    id: 'a2', slug: 'forum-bisnis-asean', title: 'Forum Bisnis ASEAN 2026 Digelar di Jakarta',
    summary: 'Pertemuan pelaku usaha kawasan ASEAN membahas peluang investasi.',
    body: 'Isi lengkap artikel tentang Forum Bisnis ASEAN, termasuk daftar negara peserta dan agenda utama forum.',
    status: 'published', organizationId: 'org-1', authorId: 'user-1',
    publishedAt: '2026-11-15T09:00:00.000Z', version: 1,
  },
  {
    id: 'a3', slug: 'pelatihan-ekspor', title: 'Pelatihan Ekspor untuk Anggota Baru',
    summary: 'Sesi pelatihan gratis bagi anggota baru yang ingin merambah pasar ekspor.',
    body: 'Isi lengkap artikel tentang pelatihan ekspor, syarat pendaftaran, dan narasumber yang terlibat.',
    status: 'published', organizationId: 'org-1', authorId: 'user-2',
    publishedAt: '2026-11-10T09:00:00.000Z', version: 2,
  },
  {
    id: 'a4', slug: 'kerjasama-asosiasi-regional', title: 'Kerja Sama dengan Asosiasi Regional Diperluas',
    summary: 'Penandatanganan nota kesepahaman dengan lima asosiasi daerah.',
    body: 'Isi lengkap artikel tentang kerja sama asosiasi regional dan dampaknya bagi anggota di daerah.',
    status: 'published', organizationId: 'org-2', authorId: 'user-2',
    publishedAt: '2026-11-05T09:00:00.000Z', version: 1,
  },
  {
    id: 'a5', slug: 'webinar-digitalisasi-umkm', title: 'Webinar Digitalisasi UMKM Diikuti Ribuan Peserta',
    summary: 'Webinar membahas adopsi teknologi digital bagi pelaku UMKM.',
    body: 'Isi lengkap artikel tentang webinar digitalisasi UMKM, termasuk rangkuman materi dan tautan rekaman.',
    status: 'published', organizationId: 'org-1', authorId: 'user-1',
    publishedAt: '2026-11-01T09:00:00.000Z', version: 1,
  },
  {
    id: 'a6', slug: 'draft-rencana-strategis', title: '[DRAFT] Rencana Strategis 2027',
    summary: 'Draf internal, belum disetujui untuk publikasi.',
    body: 'Isi draf rencana strategis 2027 yang masih dalam tahap peninjauan internal.',
    status: 'draft', organizationId: 'org-1', authorId: 'user-1',
    publishedAt: null, version: 1,
  },
  {
    id: 'a7', slug: 'arsip-laporan-2024', title: 'Laporan Tahunan 2024 (Arsip)',
    summary: 'Laporan tahunan yang sudah diarsipkan.',
    body: 'Isi laporan tahunan 2024 yang telah diarsipkan dan tidak lagi ditampilkan ke publik.',
    status: 'archived', organizationId: 'org-1', authorId: 'user-1',
    publishedAt: '2025-01-15T09:00:00.000Z', version: 3,
  },
];
```

- [ ] **Step 4: Write the failing repository tests**

```ts
// apps/mobile/src/features/news/data/__tests__/fixtureNewsRepository.test.ts
import { FixtureNewsRepository } from '../fixtureNewsRepository';
import { ARTICLE_FIXTURES } from '../newsFixtures';

describe('FixtureNewsRepository', () => {
  it('only returns published articles from listPublished', async () => {
    const repo = new FixtureNewsRepository();
    const result = await repo.listPublished({ limit: 50 });
    const ids = result.data.map((a) => a.id);
    const unpublishedIds = ARTICLE_FIXTURES.filter((a) => a.status !== 'published').map((a) => a.id);
    for (const id of unpublishedIds) {
      expect(ids).not.toContain(id);
    }
  });

  it('paginates across two pages with no duplicates and full coverage', async () => {
    const repo = new FixtureNewsRepository();
    const publishedCount = ARTICLE_FIXTURES.filter((a) => a.status === 'published').length;
    const limit = 2;
    const page1 = await repo.listPublished({ limit });
    const page2 = await repo.listPublished({ cursor: page1.page.nextCursor, limit });
    const allIds = [...page1.data, ...page2.data].map((a) => a.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
    expect(allIds.length).toBeLessThanOrEqual(publishedCount);
  });

  it('getById returns null for an unpublished article id (no draft leakage via id guess)', async () => {
    const repo = new FixtureNewsRepository();
    const draft = ARTICLE_FIXTURES.find((a) => a.status !== 'published');
    expect(draft).toBeTruthy();
    const result = await repo.getById(draft!.id);
    expect(result).toBeNull();
  });

  it('getById returns null for a nonexistent id', async () => {
    const repo = new FixtureNewsRepository();
    const result = await repo.getById('does-not-exist');
    expect(result).toBeNull();
  });

  it('getById returns the article for a published id', async () => {
    const repo = new FixtureNewsRepository();
    const published = ARTICLE_FIXTURES.find((a) => a.status === 'published');
    const result = await repo.getById(published!.id);
    expect(result?.id).toBe(published!.id);
  });
});
```

- [ ] **Step 5: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/features/news/data/__tests__/fixtureNewsRepository.test.ts
```

Expected: FAIL — `Cannot find module '../fixtureNewsRepository'`.

- [ ] **Step 6: Write the minimal implementation**

```ts
// apps/mobile/src/features/news/data/fixtureNewsRepository.ts
import type { Article } from '../domain/types';
import type { PaginatedResult } from '../../../shared/api/types';
import type { NewsRepository } from './newsRepository';
import { ARTICLE_FIXTURES } from './newsFixtures';

function sortByPublishedAtDesc(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    if (!a.publishedAt || !b.publishedAt) return 0;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}

export class FixtureNewsRepository implements NewsRepository {
  private readonly published: Article[];

  constructor(fixtures: Article[] = ARTICLE_FIXTURES) {
    this.published = sortByPublishedAtDesc(fixtures.filter((a) => a.status === 'published'));
  }

  async listPublished({
    cursor,
    limit,
  }: {
    cursor?: string | null;
    limit: number;
  }): Promise<PaginatedResult<Article>> {
    const startIndex = cursor ? this.published.findIndex((a) => a.id === cursor) + 1 : 0;
    const page = this.published.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < this.published.length;
    const lastItem = page[page.length - 1];
    return {
      data: page,
      page: {
        nextCursor: hasMore && lastItem ? lastItem.id : null,
        limit,
      },
    };
  }

  async getById(id: string): Promise<Article | null> {
    return this.published.find((a) => a.id === id) ?? null;
  }
}
```

- [ ] **Step 7: Run it and confirm it passes**

```bash
npx jest src/features/news/data/__tests__/fixtureNewsRepository.test.ts
```

Expected: `5 passed, 5 total`.

- [ ] **Step 8: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/features/news/domain/types.ts apps/mobile/src/features/news/data/
git commit -m "feat(mobile): add News domain types, fixtures, and FixtureNewsRepository"
```

---

### Task 5: `ArticleCard` component

**Files:**
- Create: `apps/mobile/src/features/news/components/ArticleCard.tsx`
- Create: `apps/mobile/src/features/news/components/__tests__/ArticleCard.test.tsx`

**Interfaces:**
- Consumes: `Article` from `../domain/types` (Task 4).
- Produces: `ArticleCard({ article, onPress? })` — consumed by Task 6's `NewsListScreen`.

- [ ] **Step 1: Write the failing tests**

```tsx
// apps/mobile/src/features/news/components/__tests__/ArticleCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ArticleCard } from '../ArticleCard';
import type { Article } from '../../domain/types';

const baseArticle: Article = {
  id: 'a1', slug: 'contoh-artikel', title: 'Contoh Artikel',
  summary: 'Ringkasan contoh artikel.', body: 'Isi lengkap.',
  status: 'published', organizationId: 'org-1', authorId: 'user-1',
  publishedAt: '2026-11-18T09:00:00.000Z', version: 1,
};

describe('ArticleCard', () => {
  it('renders the title as an accessible header', () => {
    render(<ArticleCard article={baseArticle} />);
    expect(screen.getByRole('header', { name: 'Contoh Artikel' })).toBeTruthy();
  });

  it('renders the summary text', () => {
    render(<ArticleCard article={baseArticle} />);
    expect(screen.getByText('Ringkasan contoh artikel.')).toBeTruthy();
  });

  it('shows an accessible fallback instead of a broken image when imageUrl is missing', () => {
    render(<ArticleCard article={baseArticle} />);
    expect(screen.getByLabelText('Tidak ada gambar untuk artikel Contoh Artikel')).toBeTruthy();
  });

  it('shows the image with an accessible label when imageUrl is present', () => {
    render(<ArticleCard article={{ ...baseArticle, imageUrl: 'https://example.com/a1.jpg' }} />);
    expect(screen.getByLabelText('Gambar untuk artikel Contoh Artikel')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ArticleCard article={baseArticle} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/features/news/components/__tests__/ArticleCard.test.tsx
```

Expected: FAIL — `Cannot find module '../ArticleCard'`.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// apps/mobile/src/features/news/components/ArticleCard.tsx
import type { ReactElement } from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import type { Article } from '../domain/types';

export interface ArticleCardProps {
  article: Article;
  onPress?: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ArticleCard({ article, onPress }: ArticleCardProps): ReactElement {
  const hasImage = Boolean(article.imageUrl);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.card}>
      {hasImage ? (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.image}
          accessibilityLabel={`Gambar untuk artikel ${article.title}`}
        />
      ) : (
        <View style={styles.imageFallback} accessibilityLabel={`Tidak ada gambar untuk artikel ${article.title}`}>
          <Text style={styles.imageFallbackText}>KADIN</Text>
        </View>
      )}
      <Text style={styles.title} accessibilityRole="header">
        {article.title}
      </Text>
      <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
      <Text style={styles.summary} numberOfLines={2}>
        {article.summary}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  image: { width: '100%', height: 160, borderRadius: 8, marginBottom: 8 },
  imageFallback: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: { color: '#999999', fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 12, color: '#777777', marginTop: 4 },
  summary: { fontSize: 14, color: '#444444', marginTop: 6 },
});
```

- [ ] **Step 4: Run it and confirm it passes**

```bash
npx jest src/features/news/components/__tests__/ArticleCard.test.tsx
```

Expected: `5 passed, 5 total`.

- [ ] **Step 5: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/features/news/components/
git commit -m "feat(mobile): add ArticleCard with accessible image fallback"
```

---

### Task 6: `NewsListScreen`

**Files:**
- Create: `apps/mobile/src/features/news/screens/NewsListScreen.tsx`
- Create: `apps/mobile/src/features/news/screens/__tests__/NewsListScreen.test.tsx`

**Interfaces:**
- Consumes: `ScreenLayout`/`ScreenState` (Task 3), `ArticleCard` (Task 5), `NewsRepository`/`FixtureNewsRepository` (Task 4).
- Produces: `NewsListScreen({ repository?, onSelectArticle? })` — consumed by Task 7's `NewsListRoute`.

- [ ] **Step 1: Write the failing tests**

```tsx
// apps/mobile/src/features/news/screens/__tests__/NewsListScreen.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { NewsListScreen } from '../NewsListScreen';
import type { NewsRepository } from '../../data/newsRepository';
import type { Article } from '../../domain/types';

const sampleArticle: Article = {
  id: 'a1', slug: 'contoh', title: 'Contoh Artikel', summary: 'Ringkasan.',
  body: 'Isi.', status: 'published', organizationId: 'org-1', authorId: 'user-1',
  publishedAt: '2026-11-18T09:00:00.000Z', version: 1,
};

function makeRepository(overrides: Partial<NewsRepository> = {}): NewsRepository {
  return {
    listPublished: jest.fn().mockResolvedValue({ data: [sampleArticle], page: { nextCursor: null, limit: 10 } }),
    getById: jest.fn().mockResolvedValue(sampleArticle),
    ...overrides,
  };
}

describe('NewsListScreen', () => {
  it('shows a loading state before data arrives', () => {
    render(<NewsListScreen repository={makeRepository()} />);
    expect(screen.getByLabelText('Memuat data')).toBeTruthy();
  });

  it('renders articles once loaded', async () => {
    render(<NewsListScreen repository={makeRepository()} />);
    await waitFor(() => expect(screen.getByText('Contoh Artikel')).toBeTruthy());
  });

  it('shows the empty state when there are no published articles', async () => {
    const repository = makeRepository({
      listPublished: jest.fn().mockResolvedValue({ data: [], page: { nextCursor: null, limit: 10 } }),
    });
    render(<NewsListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Belum ada data untuk ditampilkan.')).toBeTruthy());
  });

  it('shows an error state when the repository rejects', async () => {
    const repository = makeRepository({
      listPublished: jest.fn().mockRejectedValue(new Error('network down')),
    });
    render(<NewsListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat berita. Silakan coba lagi.')).toBeTruthy());
  });

  it('calls onSelectArticle with the article id when a card is tapped', async () => {
    const onSelectArticle = jest.fn();
    render(<NewsListScreen repository={makeRepository()} onSelectArticle={onSelectArticle} />);
    await waitFor(() => screen.getByText('Contoh Artikel'));
    fireEvent.press(screen.getByRole('button'));
    expect(onSelectArticle).toHaveBeenCalledWith('a1');
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/features/news/screens/__tests__/NewsListScreen.test.tsx
```

Expected: FAIL — `Cannot find module '../NewsListScreen'`.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// apps/mobile/src/features/news/screens/NewsListScreen.tsx
import { useEffect, useState, type ReactElement } from 'react';
import { FlatList } from 'react-native';
import { ScreenLayout, type ScreenState } from '../../../shared/ui/ScreenLayout';
import { ArticleCard } from '../components/ArticleCard';
import { FixtureNewsRepository } from '../data/fixtureNewsRepository';
import type { Article } from '../domain/types';
import type { NewsRepository } from '../data/newsRepository';

const PAGE_SIZE = 10;

export interface NewsListScreenProps {
  repository?: NewsRepository;
  onSelectArticle?: (articleId: string) => void;
}

export function NewsListScreen({
  repository = new FixtureNewsRepository(),
  onSelectArticle,
}: NewsListScreenProps): ReactElement {
  const [articles, setArticles] = useState<Article[]>([]);
  const [state, setState] = useState<ScreenState>('loading');

  useEffect(() => {
    let cancelled = false;
    repository
      .listPublished({ limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setArticles(result.data);
        setState(result.data.length === 0 ? 'empty' : 'ready');
      })
      .catch(() => {
        if (cancelled) return;
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  return (
    <ScreenLayout state={state} errorMessage="Gagal memuat berita. Silakan coba lagi.">
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArticleCard article={item} onPress={() => onSelectArticle?.(item.id)} />}
      />
    </ScreenLayout>
  );
}
```

- [ ] **Step 4: Run it and confirm it passes**

```bash
npx jest src/features/news/screens/__tests__/NewsListScreen.test.tsx
```

Expected: `5 passed, 5 total`.

- [ ] **Step 5: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/features/news/screens/NewsListScreen.tsx apps/mobile/src/features/news/screens/__tests__/NewsListScreen.test.tsx
git commit -m "feat(mobile): add NewsListScreen with loading/empty/error states"
```

---

### Task 7: `NewsDetailScreen` and navigation wiring

**Files:**
- Create: `apps/mobile/src/features/news/screens/NewsDetailScreen.tsx`
- Create: `apps/mobile/src/features/news/screens/__tests__/NewsDetailScreen.test.tsx`
- Modify: `apps/mobile/src/navigation/RootNavigator.tsx` (add `NewsList`/`NewsDetail` to `RootStackParamList` and the stack)
- Modify: `apps/mobile/src/navigation/linking.ts` (add `news`/`news/:articleId` paths)
- Modify: `apps/mobile/src/navigation/routes/HomeRoute.tsx` (add the "Lihat Berita" link now that `NewsList` exists)
- Create: `apps/mobile/src/navigation/routes/NewsListRoute.tsx`
- Create: `apps/mobile/src/navigation/routes/NewsDetailRoute.tsx`

**Interfaces:**
- Consumes: `ScreenLayout` (Task 3), `NewsRepository`/`FixtureNewsRepository` (Task 4), `NewsListScreen` (Task 6), `RootStackParamList`/`RootNavigator` (Task 2).
- Produces: working News navigation — nothing further in this plan consumes these (WP-02b reuses the *pattern*, not these exports).

- [ ] **Step 1: Write the failing tests for `NewsDetailScreen`**

```tsx
// apps/mobile/src/features/news/screens/__tests__/NewsDetailScreen.test.tsx
import { render, screen, waitFor } from '@testing-library/react-native';
import { NewsDetailScreen } from '../NewsDetailScreen';
import type { NewsRepository } from '../../data/newsRepository';
import type { Article } from '../../domain/types';

const sampleArticle: Article = {
  id: 'a1', slug: 'contoh', title: 'Contoh Artikel', summary: 'Ringkasan.',
  body: 'Isi lengkap artikel di sini.', status: 'published', organizationId: 'org-1',
  authorId: 'user-1', publishedAt: '2026-11-18T09:00:00.000Z', version: 1,
};

function makeRepository(overrides: Partial<NewsRepository> = {}): NewsRepository {
  return {
    listPublished: jest.fn().mockResolvedValue({ data: [], page: { nextCursor: null, limit: 10 } }),
    getById: jest.fn().mockResolvedValue(sampleArticle),
    ...overrides,
  };
}

describe('NewsDetailScreen', () => {
  it('shows a loading state before data arrives', () => {
    render(<NewsDetailScreen articleId="a1" repository={makeRepository()} />);
    expect(screen.getByLabelText('Memuat data')).toBeTruthy();
  });

  it('renders the article title and body once loaded', async () => {
    render(<NewsDetailScreen articleId="a1" repository={makeRepository()} />);
    await waitFor(() => expect(screen.getByText('Contoh Artikel')).toBeTruthy());
    expect(screen.getByText('Isi lengkap artikel di sini.')).toBeTruthy();
  });

  it('shows a not-found state for a nonexistent article id', async () => {
    const repository = makeRepository({ getById: jest.fn().mockResolvedValue(null) });
    render(<NewsDetailScreen articleId="does-not-exist" repository={repository} />);
    await waitFor(() =>
      expect(screen.getByText('Artikel tidak ditemukan atau belum dipublikasikan.')).toBeTruthy()
    );
  });

  it('shows the same not-found state for an unpublished article id as for a nonexistent one', async () => {
    const repository = makeRepository({ getById: jest.fn().mockResolvedValue(null) });
    render(<NewsDetailScreen articleId="draft-id" repository={repository} />);
    await waitFor(() =>
      expect(screen.getByText('Artikel tidak ditemukan atau belum dipublikasikan.')).toBeTruthy()
    );
  });

  it('shows an error state when the repository rejects', async () => {
    const repository = makeRepository({ getById: jest.fn().mockRejectedValue(new Error('network down')) });
    render(<NewsDetailScreen articleId="a1" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat artikel. Silakan coba lagi.')).toBeTruthy());
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/features/news/screens/__tests__/NewsDetailScreen.test.tsx
```

Expected: FAIL — `Cannot find module '../NewsDetailScreen'`.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// apps/mobile/src/features/news/screens/NewsDetailScreen.tsx
import { useEffect, useState, type ReactElement } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { ScreenLayout, type ScreenState } from '../../../shared/ui/ScreenLayout';
import { FixtureNewsRepository } from '../data/fixtureNewsRepository';
import type { Article } from '../domain/types';
import type { NewsRepository } from '../data/newsRepository';

export interface NewsDetailScreenProps {
  articleId: string;
  repository?: NewsRepository;
}

export function NewsDetailScreen({
  articleId,
  repository = new FixtureNewsRepository(),
}: NewsDetailScreenProps): ReactElement {
  const [article, setArticle] = useState<Article | null>(null);
  const [state, setState] = useState<ScreenState>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    repository
      .getById(articleId)
      .then((result) => {
        if (cancelled) return;
        setArticle(result);
        setState(result ? 'ready' : 'empty');
      })
      .catch(() => {
        if (cancelled) return;
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [articleId, repository]);

  return (
    <ScreenLayout
      state={state}
      errorMessage="Gagal memuat artikel. Silakan coba lagi."
      emptyMessage="Artikel tidak ditemukan atau belum dipublikasikan."
    >
      {article && (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title} accessibilityRole="header">
            {article.title}
          </Text>
          <Text style={styles.body}>{article.body}</Text>
        </ScrollView>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  body: { fontSize: 15, lineHeight: 22 },
});
```

- [ ] **Step 4: Run it and confirm it passes**

```bash
npx jest src/features/news/screens/__tests__/NewsDetailScreen.test.tsx
```

Expected: `5 passed, 5 total`.

- [ ] **Step 5: Add the route wrapper components**

```tsx
// apps/mobile/src/navigation/routes/NewsListRoute.tsx
import type { ReactElement } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { NewsListScreen } from '../../features/news/screens/NewsListScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'NewsList'>;

export function NewsListRoute({ navigation }: Props): ReactElement {
  return (
    <NewsListScreen
      onSelectArticle={(articleId) => navigation.navigate('NewsDetail', { articleId })}
    />
  );
}
```

```tsx
// apps/mobile/src/navigation/routes/NewsDetailRoute.tsx
import type { ReactElement } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { NewsDetailScreen } from '../../features/news/screens/NewsDetailScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'NewsDetail'>;

export function NewsDetailRoute({ route }: Props): ReactElement {
  return <NewsDetailScreen articleId={route.params.articleId} />;
}
```

- [ ] **Step 6: Add the screens to `RootNavigator` and `linking`**

```tsx
// apps/mobile/src/navigation/RootNavigator.tsx
import type { ReactElement } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeRoute } from './routes/HomeRoute';
import { NewsListRoute } from './routes/NewsListRoute';
import { NewsDetailRoute } from './routes/NewsDetailRoute';

export type RootStackParamList = {
  Home: undefined;
  NewsList: undefined;
  NewsDetail: { articleId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerTitle: 'KADIN Indonesia' }}>
      <Stack.Screen name="Home" component={HomeRoute} options={{ headerTitle: 'KADIN Indonesia' }} />
      <Stack.Screen name="NewsList" component={NewsListRoute} options={{ headerTitle: 'Berita' }} />
      <Stack.Screen name="NewsDetail" component={NewsDetailRoute} options={{ headerTitle: 'Detail Berita' }} />
    </Stack.Navigator>
  );
}
```

```ts
// apps/mobile/src/navigation/linking.ts
import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './RootNavigator';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['http://localhost:19006'],
  config: {
    screens: {
      Home: '',
      NewsList: 'news',
      NewsDetail: 'news/:articleId',
    },
  },
};
```

- [ ] **Step 7: Add the "Lihat Berita" link to `HomeRoute`, now that `NewsList` exists**

```tsx
// apps/mobile/src/navigation/routes/HomeRoute.tsx
import type { ReactElement } from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { WelcomeScreen } from '../../features/shell/screens/WelcomeScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeRoute({ navigation }: Props): ReactElement {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <WelcomeScreen />
      <Pressable onPress={() => navigation.navigate('NewsList')} style={styles.link} accessibilityRole="button">
        <Text style={styles.linkText}>Lihat Berita</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  link: { padding: 16, alignItems: 'center' },
  linkText: { fontSize: 16, color: '#0a5', fontWeight: '600' },
});
```

These route-wrapper files are intentionally thin (navigation wiring only) and are not separately unit tested — their logic is already covered by `NewsListScreen`'s and `NewsDetailScreen`'s own tests above.

- [ ] **Step 8: Run the full suite and typecheck**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest
npx tsc --noEmit
```

Expected: all suites pass (WelcomeScreen 3, AppShell 3, App 1, ScreenLayout 6, FixtureNewsRepository 5, ArticleCard 5, NewsListScreen 5, NewsDetailScreen 5 — 33 total); `tsc --noEmit` exits 0.

- [ ] **Step 9: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/features/news/screens/NewsDetailScreen.tsx apps/mobile/src/features/news/screens/__tests__/NewsDetailScreen.test.tsx apps/mobile/src/navigation/
git commit -m "feat(mobile): add NewsDetailScreen and wire News navigation"
```

---

### Task 8: Visual verification and milestone tag

**Files:** none (verification-only task; no source changes expected — if `expo start --web` reveals a missing dependency, install it and commit before tagging, don't silently skip verification).

**Interfaces:**
- Consumes: the fully wired app from Task 7.
- Produces: visual confirmation recorded in the final report; nothing for a later task to consume.

- [ ] **Step 1: Start the Expo web dev server in the background**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx expo start --web --port 19006 > /tmp/expo-web-wp02a.log 2>&1 &
echo "started with PID $!"
```

- [ ] **Step 2: Poll until ready, then check the log**

```bash
i=0; until grep -qiE "web bundled|localhost:19006|error" /tmp/expo-web-wp02a.log || [ $i -ge 30 ]; do sleep 2; i=$((i+1)); done
tail -60 /tmp/expo-web-wp02a.log
```

Expected: a line showing the server listening on `localhost:19006`. If the log shows a missing-dependency error, install whatever it names, restart the server, and re-check the log before proceeding — do not skip to Step 3 against a server that never came up.

- [ ] **Step 3: Verify each route actually renders (relies on the `linking` config from Tasks 2 and 7)**

Using whatever visual-verification path is available in the session (Claude-in-Chrome if connected, otherwise a standalone headless-browser screenshot as in WP-01's Task 6), visit and confirm:
- `http://localhost:19006/` — shows the WelcomeScreen heading plus a "Lihat Berita" link.
- `http://localhost:19006/news` — shows at least one `ArticleCard` with a visible title and date.
- `http://localhost:19006/news/a1` — shows "KADIN Luncurkan Program UMKM Naik Kelas" as the heading and its full body text.
- `http://localhost:19006/news/does-not-exist` — shows "Artikel tidak ditemukan atau belum dipublikasikan." instead of a blank page or a crash.

If direct URL navigation to a nested route doesn't resolve correctly (React Navigation's web `linking` support is less automatic than a file-based router's), fall back to interaction-based verification: load `/`, click "Lihat Berita", screenshot the list, click the first `ArticleCard`, screenshot the detail — this still proves the same navigation path end to end.

- [ ] **Step 4: Stop the dev server**

```bash
pkill -f "expo start --web" 2>/dev/null
```

- [ ] **Step 5: Tag the milestone**

```bash
cd /Users/henrisetiawan/kadin_verse
git log --oneline
git tag wp02a-navigation-and-news
```

---

## Known gaps intentionally left for later work

- Services catalogue (SDD.md WP-02's other half) is a separate plan (WP-02b), reusing `ScreenLayout`, `PaginatedResult`/`ApiError`, and the exact repository/screen/navigation pattern established here.
- No native deep-link scheme configured in `app.json` — only web `linking` (needed for Task 8's verification) is wired. Native deep linking is `PRD.md` EPIC-02 scope for a later pass.
- No search/filter on the news list yet (`PRD.md` EPIC-04 mentions "search/pagination" — pagination is implemented via the repository's cursor contract, but the list screen only fetches one page; a "load more" UI trigger is a follow-up, not blocking this plan's goal of proving the vertical end-to-end).
- No article "category" field — `SDD.md` §4.2's `ArticleCard` contract mentions category, but `SDD.md` §6's `articles` table has no such column; this is a pre-existing spec gap, not something this plan invents a taxonomy to paper over.
- `FixtureNewsRepository` is in-memory only; swapping in a real HTTP-backed implementation is blocked on ADR-007 (backend framework/hosting), same as before.
