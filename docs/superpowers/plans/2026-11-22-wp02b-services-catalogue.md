# WP-02b: Services Catalogue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Services half of SDD.md's WP-02 ("Public news list/detail and services catalogue") — a public, read-only Service catalogue list and detail screen backed by a synthetic seeded repository, reusing the exact `ScreenLayout`/navigation/repository pattern WP-02a already built and had independently reviewed, with every finding from that review's fix pass applied from the start instead of retrofitted.

**Architecture:** Identical shape to WP-02a's News vertical (`src/features/services/{domain,data,components,screens}` + thin `src/navigation/routes/Service*Route.tsx` wrappers + `RootNavigator`/`linking` additions), with one deliberate semantic difference: News hides unpublished articles entirely, but PRD EPIC-05 requires `inactive` services to stay **visible** with a status badge ("unavailable service displays status") — `ServiceRepository.list()` returns every service regardless of status; only a genuinely nonexistent id produces "not found". No navigation-library or shared-infrastructure decisions remain open — `ScreenLayout`, `colors.ts`, and `PaginatedResult`/`ApiError` from WP-02a are reused unchanged except one addition (`colors.dangerText` for the "Tidak tersedia" badge).

**Tech Stack:** Same as WP-02a — React Navigation (already installed), Jest + React Native Testing Library. No new dependencies.

**Spec:** `docs/PRD.md` EPIC-05 (Service catalogue: taxonomy, eligibility, owner, SLA disclaimer, enquiry routing; acceptance criteria "each published service has an owner and valid contact/action", "unavailable service displays status", "no false claim of completed issuance"); `docs/SDD.md` §4.1-4.2 (`ServiceCard` component contract: title, description, eligibility summary, actionable CTA), §6 (`services` table: id, code, title, description, status, organization_id, owner_id, eligibility_json), §7 (`GET /public/services`, `GET /public/services/{id}`); `AGENTS.md` §3 (B-004 "Catalogue UI and mock data" explicitly allowed now); the WP-02a plan and its final-review ledger at `docs/superpowers/plans/2026-11-21-wp02a-navigation-and-news.md` (read this for the exact patterns being reused: `ScreenLayout`'s `onRetry`, the module-scope-singleton default-repository rule, the composite-accessible-label rule, the full-cursor-drain pagination test shape).

## Global Constraints

- TypeScript `strict: true`.
- **Default repository must be a module-scope singleton, never an inline default-parameter expression.** WP-02a shipped a Critical bug here (`repository = new FixtureNewsRepository()` re-created every render, looping both News screens indefinitely on the exact no-prop path production uses) — this plan's screens are written with the fix already in place (`const defaultServiceRepository = new FixtureServiceRepository();` at module scope), and each screen's test suite includes the loop-regression test from WP-02a's fix (`jest.spyOn(FixtureServiceRepository.prototype, '<method>')`, render with no `repository` prop, assert called exactly once after a timing window) from the start.
- **Inactive services stay visible, unlike News's hidden drafts.** `ServiceRepository.list()`/`getById()` never filter by status — filtering inactive services out would be copying the News pattern into a spec it doesn't apply to. The UI (`ServiceCard`, `ServiceDetailScreen`) marks inactive services with a "Tidak tersedia" badge and a status-only CTA, never the same "view/apply" wording an active service gets (PRD EPIC-05: "no false claim of completed issuance").
- **Accessible labels go on the `Pressable` itself, composed from the card's own data** (e.g. `"${title}, tidak tersedia"` when inactive) — never on a child element inside the Pressable, which WP-02a's review found gets swallowed by the Pressable's default accessibility grouping.
- **Pagination tests drain the full cursor chain and assert the exact resulting id array**, not just "no duplicates and length ≤ count" — the weaker form passed on a verified skip-mutant in WP-02a.
- Reuse `ScreenLayout`, `colors.ts`, `PaginatedResult`/`ApiError` from WP-02a without modification except adding one new named color (`dangerText`) with its own WCAG contrast test case in the existing `colors.test.ts`.
- RED → GREEN → REFACTOR for every behavior; run the actual test command and read its output before claiming done.
- Out of scope: service enquiry/application submission UI (`SDD.md` §14 WP-07, not WP-02), admin CMS (WP-03), any live API client (ADR-007 OPEN), native deep-link scheme (web `linking` only, same as WP-02a).

## Review Focus

- **Inactive services accidentally filtered out by a screen-level or repository-level check** — the opposite mistake from News's "hide unpublished" pattern, easy to copy by habit. → Task 1's repository tests assert an inactive service is returned by both `list()` and `getById()`.
- **CTA or label text implying an action is possible for an inactive service** (PRD: "no false claim of completed issuance"). → Task 2's `ServiceCard` tests assert the active-only CTA text never appears for an inactive service, and Task 4's `ServiceDetailScreen` tests assert the same at the detail level.
- **Pagination duplicate or skipped service across page boundaries.** → Task 1's pagination test drains the full cursor chain and asserts the exact id order, following WP-02a's corrected pattern from the start.
- **Detail screen conflating "genuinely nonexistent id" with "inactive service"** — unlike News where both cases must look identical, here they must NOT: an inactive service shows its full detail plus a badge, only a truly nonexistent id shows "Layanan tidak ditemukan." → Task 4's tests cover both cases and assert they render differently.
- **Reintroducing WP-02a's infinite-loop bug** in the new Services screens via an inline default-parameter repository. → Task 3 and Task 4 each include the loop-regression test from the start, not as an afterthought.

---

### Task 1: Service domain types, fixtures, repository, and `colors.dangerText`

**Files:**
- Create: `apps/mobile/src/features/services/domain/types.ts`
- Create: `apps/mobile/src/features/services/data/serviceRepository.ts`
- Create: `apps/mobile/src/features/services/data/serviceFixtures.ts`
- Create: `apps/mobile/src/features/services/data/fixtureServiceRepository.ts`
- Create: `apps/mobile/src/features/services/data/__tests__/fixtureServiceRepository.test.ts`
- Modify: `apps/mobile/src/shared/ui/colors.ts` (add `dangerText`)
- Modify: `apps/mobile/src/shared/ui/__tests__/colors.test.ts` (add a contrast case for `dangerText`)

**Interfaces:**
- Consumes: `PaginatedResult<T>` from `src/shared/api/types` (WP-02a), `colors` from `src/shared/ui/colors` (WP-02a, extended here).
- Produces: `Service`/`ServiceStatus` types, `ServiceRepository` interface (`list`, `getById`), `FixtureServiceRepository` class — consumed by Task 2 (`ServiceCard`), Task 3 (`ServiceListScreen`), Task 4 (`ServiceDetailScreen`).

- [ ] **Step 1: Add `dangerText` to the shared color palette**

```ts
// apps/mobile/src/shared/ui/colors.ts
export const colors = {
  linkText: '#007a3d',
  mutedText: '#6b6b6b',
  imageFallbackBackground: '#eeeeee',
  dangerText: '#b00020',
};
```

- [ ] **Step 2: Write the failing contrast test for the new color**

Add to the existing `describe` block in `apps/mobile/src/shared/ui/__tests__/colors.test.ts`:

```ts
  it('danger text on a white background meets AA', () => {
    expect(contrastRatio(colors.dangerText, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });
```

- [ ] **Step 3: Run it — it should already pass, since `#b00020` on white is independently computable at ≈7.32:1**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/shared/ui/__tests__/colors.test.ts
```

Expected: `4 passed, 4 total`. If it fails, the color value is wrong — do not weaken the 4.5 threshold to make it pass.

- [ ] **Step 4: Write the domain type**

```ts
// apps/mobile/src/features/services/domain/types.ts
export type ServiceStatus = 'active' | 'inactive';

export interface Service {
  id: string;
  code: string;
  title: string;
  description: string;
  status: ServiceStatus;
  organizationId: string;
  ownerId: string;
  eligibilitySummary: string;
}
```

- [ ] **Step 5: Write the repository interface**

```ts
// apps/mobile/src/features/services/data/serviceRepository.ts
import type { Service } from '../domain/types';
import type { PaginatedResult } from '../../../shared/api/types';

export interface ServiceRepository {
  list(params: { cursor?: string | null; limit: number }): Promise<PaginatedResult<Service>>;
  getById(id: string): Promise<Service | null>;
}
```

- [ ] **Step 6: Write the fixtures — 4 active, 1 inactive**

```ts
// apps/mobile/src/features/services/data/serviceFixtures.ts
import type { Service } from '../domain/types';

export const SERVICE_FIXTURES: Service[] = [
  {
    id: 's1', code: 'SKA', title: 'Surat Keterangan Asal (SKA)',
    description: 'Layanan penerbitan Surat Keterangan Asal untuk keperluan ekspor barang ke luar negeri.',
    status: 'active', organizationId: 'org-1', ownerId: 'user-1',
    eligibilitySummary: 'Anggota aktif KADIN dengan Nomor Induk Berusaha (NIB) yang valid.',
  },
  {
    id: 's2', code: 'LEGALISASI', title: 'Legalisasi Dokumen Perdagangan',
    description: 'Legalisasi dokumen perdagangan internasional untuk keperluan ekspor dan impor.',
    status: 'active', organizationId: 'org-1', ownerId: 'user-2',
    eligibilitySummary: 'Anggota aktif KADIN dengan dokumen asli yang akan dilegalisasi.',
  },
  {
    id: 's3', code: 'KONSULTASI-EKSPOR', title: 'Konsultasi Bisnis Ekspor',
    description: 'Sesi konsultasi dengan pakar perdagangan ekspor untuk membantu merencanakan ekspansi pasar.',
    status: 'active', organizationId: 'org-2', ownerId: 'user-2',
    eligibilitySummary: 'Terbuka untuk seluruh anggota KADIN yang terdaftar.',
  },
  {
    id: 's4', code: 'PENDAMPINGAN-LEGALITAS', title: 'Pendampingan Legalitas Usaha',
    description: 'Pendampingan pengurusan izin dan legalitas usaha bagi anggota baru.',
    status: 'active', organizationId: 'org-1', ownerId: 'user-1',
    eligibilitySummary: 'Anggota baru yang bergabung dalam 12 bulan terakhir.',
  },
  {
    id: 's5', code: 'COO', title: 'Certificate of Origin (COO)',
    description: 'Penerbitan Certificate of Origin untuk barang ekspor ke negara mitra dagang.',
    status: 'inactive', organizationId: 'org-1', ownerId: 'user-1',
    eligibilitySummary: 'Sementara tidak tersedia, menunggu persetujuan regulasi terkait.',
  },
];
```

- [ ] **Step 7: Write the failing repository tests (full cursor-drain pagination test from the start)**

```ts
// apps/mobile/src/features/services/data/__tests__/fixtureServiceRepository.test.ts
import { FixtureServiceRepository } from '../fixtureServiceRepository';
import { SERVICE_FIXTURES } from '../serviceFixtures';

describe('FixtureServiceRepository', () => {
  it('includes inactive services in list(), unlike News which hides unpublished articles', async () => {
    const repo = new FixtureServiceRepository();
    const result = await repo.list({ limit: 50 });
    const inactiveIds = SERVICE_FIXTURES.filter((s) => s.status === 'inactive').map((s) => s.id);
    const ids = result.data.map((s) => s.id);
    for (const id of inactiveIds) {
      expect(ids).toContain(id);
    }
  });

  it('paginates across all pages with no duplicates, no skips, and preserves fixture order', async () => {
    const repo = new FixtureServiceRepository();
    const expectedIds = SERVICE_FIXTURES.map((s) => s.id);
    const collectedIds: string[] = [];
    let cursor: string | null = null;
    do {
      const page = await repo.list({ cursor, limit: 2 });
      collectedIds.push(...page.data.map((s) => s.id));
      cursor = page.page.nextCursor;
    } while (cursor);
    expect(collectedIds).toEqual(expectedIds);
  });

  it('getById returns an inactive service rather than hiding it', async () => {
    const repo = new FixtureServiceRepository();
    const inactive = SERVICE_FIXTURES.find((s) => s.status === 'inactive');
    const result = await repo.getById(inactive!.id);
    expect(result?.id).toBe(inactive!.id);
    expect(result?.status).toBe('inactive');
  });

  it('getById returns null for a nonexistent id', async () => {
    const repo = new FixtureServiceRepository();
    const result = await repo.getById('does-not-exist');
    expect(result).toBeNull();
  });

  it('getById returns the service for an active id', async () => {
    const repo = new FixtureServiceRepository();
    const active = SERVICE_FIXTURES.find((s) => s.status === 'active');
    const result = await repo.getById(active!.id);
    expect(result?.id).toBe(active!.id);
  });
});
```

- [ ] **Step 8: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/features/services/data/__tests__/fixtureServiceRepository.test.ts
```

Expected: FAIL — `Cannot find module '../fixtureServiceRepository'`.

- [ ] **Step 9: Write the minimal implementation**

```ts
// apps/mobile/src/features/services/data/fixtureServiceRepository.ts
import type { Service } from '../domain/types';
import type { PaginatedResult } from '../../../shared/api/types';
import type { ServiceRepository } from './serviceRepository';
import { SERVICE_FIXTURES } from './serviceFixtures';

export class FixtureServiceRepository implements ServiceRepository {
  private readonly services: Service[];

  constructor(fixtures: Service[] = SERVICE_FIXTURES) {
    this.services = [...fixtures];
  }

  async list({
    cursor,
    limit,
  }: {
    cursor?: string | null;
    limit: number;
  }): Promise<PaginatedResult<Service>> {
    const startIndex = cursor ? this.services.findIndex((s) => s.id === cursor) + 1 : 0;
    const page = this.services.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < this.services.length;
    const lastItem = page[page.length - 1];
    return {
      data: page,
      page: {
        nextCursor: hasMore && lastItem ? lastItem.id : null,
        limit,
      },
    };
  }

  async getById(id: string): Promise<Service | null> {
    return this.services.find((s) => s.id === id) ?? null;
  }
}
```

- [ ] **Step 10: Run it and confirm it passes**

```bash
npx jest src/features/services/data/__tests__/fixtureServiceRepository.test.ts
```

Expected: `5 passed, 5 total`.

- [ ] **Step 11: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/shared/ui/colors.ts apps/mobile/src/shared/ui/__tests__/colors.test.ts apps/mobile/src/features/services/domain/types.ts apps/mobile/src/features/services/data/
git commit -m "feat(mobile): add Service domain types, fixtures, FixtureServiceRepository, and dangerText color"
```

---

### Task 2: `ServiceCard` component

**Files:**
- Create: `apps/mobile/src/features/services/components/ServiceCard.tsx`
- Create: `apps/mobile/src/features/services/components/__tests__/ServiceCard.test.tsx`

**Interfaces:**
- Consumes: `Service` from `../domain/types` (Task 1), `colors` from `src/shared/ui/colors`.
- Produces: `ServiceCard({ service, onPress? })` — consumed by Task 3's `ServiceListScreen`.

- [ ] **Step 1: Write the failing tests**

```tsx
// apps/mobile/src/features/services/components/__tests__/ServiceCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ServiceCard } from '../ServiceCard';
import type { Service } from '../../domain/types';

const activeService: Service = {
  id: 's1', code: 'SKA', title: 'Surat Keterangan Asal', description: 'Deskripsi layanan.',
  status: 'active', organizationId: 'org-1', ownerId: 'user-1',
  eligibilitySummary: 'Anggota aktif KADIN.',
};

describe('ServiceCard', () => {
  it('renders the title as an accessible header', () => {
    render(<ServiceCard service={activeService} />);
    expect(screen.getByRole('header', { name: 'Surat Keterangan Asal' })).toBeTruthy();
  });

  it('does not show an unavailable badge or note for an active service', () => {
    render(<ServiceCard service={activeService} />);
    expect(screen.queryByText('Tidak tersedia')).toBeNull();
    expect(screen.queryByLabelText(/tidak tersedia/)).toBeNull();
  });

  it('shows an unavailable badge, status-only CTA, and an accessible note for an inactive service', () => {
    render(<ServiceCard service={{ ...activeService, status: 'inactive' }} />);
    expect(screen.getByText('Tidak tersedia')).toBeTruthy();
    expect(screen.getByText('Lihat status layanan')).toBeTruthy();
    expect(screen.queryByText('Lihat detail layanan')).toBeNull();
    expect(screen.getByLabelText(/Surat Keterangan Asal.*tidak tersedia/)).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ServiceCard service={activeService} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/features/services/components/__tests__/ServiceCard.test.tsx
```

Expected: FAIL — `Cannot find module '../ServiceCard'`.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// apps/mobile/src/features/services/components/ServiceCard.tsx
import type { ReactElement } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import type { Service } from '../domain/types';
import { colors } from '../../../shared/ui/colors';

export interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
}

export function ServiceCard({ service, onPress }: ServiceCardProps): ReactElement {
  const isActive = service.status === 'active';
  // Composite label on the Pressable itself — a label on a child inside it
  // would be swallowed by the Pressable's default accessibility grouping
  // (see WP-02a's ArticleCard fix for the same issue).
  const accessibleLabel = `${service.title}${isActive ? '' : ', tidak tersedia'}`;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibleLabel} style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {service.title}
      </Text>
      {!isActive && <Text style={styles.unavailableBadge}>Tidak tersedia</Text>}
      <Text style={styles.description}>{service.description}</Text>
      <Text style={styles.eligibility}>{service.eligibilitySummary}</Text>
      <Text style={styles.cta}>{isActive ? 'Lihat detail layanan' : 'Lihat status layanan'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 16, fontWeight: '600' },
  unavailableBadge: { fontSize: 12, color: colors.dangerText, fontWeight: '600', marginTop: 4 },
  description: { fontSize: 14, color: '#444444', marginTop: 6 },
  eligibility: { fontSize: 12, color: colors.mutedText, marginTop: 6 },
  cta: { fontSize: 14, color: colors.linkText, fontWeight: '600', marginTop: 10 },
});
```

- [ ] **Step 4: Run it and confirm it passes**

```bash
npx jest src/features/services/components/__tests__/ServiceCard.test.tsx
```

Expected: `4 passed, 4 total`.

- [ ] **Step 5: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/features/services/components/
git commit -m "feat(mobile): add ServiceCard with status badge and composite accessible label"
```

---

### Task 3: `ServiceListScreen`

**Files:**
- Create: `apps/mobile/src/features/services/screens/ServiceListScreen.tsx`
- Create: `apps/mobile/src/features/services/screens/__tests__/ServiceListScreen.test.tsx`

**Interfaces:**
- Consumes: `ScreenLayout`/`ScreenState` (WP-02a), `ServiceCard` (Task 2), `ServiceRepository`/`FixtureServiceRepository` (Task 1).
- Produces: `ServiceListScreen({ repository?, onSelectService? })` — consumed by Task 4's `ServiceListRoute`.

- [ ] **Step 1: Write the failing tests (retry and loop-regression included from the start)**

```tsx
// apps/mobile/src/features/services/screens/__tests__/ServiceListScreen.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { ServiceListScreen } from '../ServiceListScreen';
import { FixtureServiceRepository } from '../../data/fixtureServiceRepository';
import type { ServiceRepository } from '../../data/serviceRepository';
import type { Service } from '../../domain/types';

const sampleService: Service = {
  id: 's1', code: 'SKA', title: 'Surat Keterangan Asal', description: 'Deskripsi layanan.',
  status: 'active', organizationId: 'org-1', ownerId: 'user-1',
  eligibilitySummary: 'Anggota aktif KADIN.',
};

function makeRepository(overrides: Partial<ServiceRepository> = {}): ServiceRepository {
  return {
    list: jest.fn().mockResolvedValue({ data: [sampleService], page: { nextCursor: null, limit: 10 } }),
    getById: jest.fn().mockResolvedValue(sampleService),
    ...overrides,
  };
}

describe('ServiceListScreen', () => {
  it('shows a loading state before data arrives', async () => {
    render(<ServiceListScreen repository={makeRepository()} />);
    expect(screen.getByLabelText('Memuat data')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
  });

  it('renders services once loaded', async () => {
    render(<ServiceListScreen repository={makeRepository()} />);
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
  });

  it('shows the empty state when there are no services', async () => {
    const repository = makeRepository({
      list: jest.fn().mockResolvedValue({ data: [], page: { nextCursor: null, limit: 10 } }),
    });
    render(<ServiceListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Belum ada data untuk ditampilkan.')).toBeTruthy());
  });

  it('shows an error state when the repository rejects', async () => {
    const repository = makeRepository({ list: jest.fn().mockRejectedValue(new Error('network down')) });
    render(<ServiceListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat layanan. Silakan coba lagi.')).toBeTruthy());
  });

  it('calls onSelectService with the service id when a card is tapped', async () => {
    const onSelectService = jest.fn();
    render(<ServiceListScreen repository={makeRepository()} onSelectService={onSelectService} />);
    await waitFor(() => screen.getByText('Surat Keterangan Asal'));
    fireEvent.press(screen.getByRole('button'));
    expect(onSelectService).toHaveBeenCalledWith('s1');
  });

  it('retries fetching when the error state retry button is pressed', async () => {
    const list = jest
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ data: [sampleService], page: { nextCursor: null, limit: 10 } });
    const repository = makeRepository({ list });
    render(<ServiceListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat layanan. Silakan coba lagi.')).toBeTruthy());
    fireEvent.press(screen.getByText('Coba Lagi'));
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('does not loop when no repository prop is given (uses a stable default instance)', async () => {
    const spy = jest.spyOn(FixtureServiceRepository.prototype, 'list');
    render(<ServiceListScreen />);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/features/services/screens/__tests__/ServiceListScreen.test.tsx
```

Expected: FAIL — `Cannot find module '../ServiceListScreen'`.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// apps/mobile/src/features/services/screens/ServiceListScreen.tsx
import { useEffect, useState, type ReactElement } from 'react';
import { FlatList } from 'react-native';
import { ScreenLayout, type ScreenState } from '../../../shared/ui/ScreenLayout';
import { ServiceCard } from '../components/ServiceCard';
import { FixtureServiceRepository } from '../data/fixtureServiceRepository';
import type { Service } from '../domain/types';
import type { ServiceRepository } from '../data/serviceRepository';

const PAGE_SIZE = 10;

// Module-scope singleton — see WP-02a's NewsListScreen for why an inline
// default parameter here would re-create the repository every render and
// loop on the exact no-prop path production uses.
const defaultServiceRepository = new FixtureServiceRepository();

export interface ServiceListScreenProps {
  repository?: ServiceRepository;
  onSelectService?: (serviceId: string) => void;
}

export function ServiceListScreen({
  repository = defaultServiceRepository,
  onSelectService,
}: ServiceListScreenProps): ReactElement {
  const [services, setServices] = useState<Service[]>([]);
  const [state, setState] = useState<ScreenState>('loading');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    repository
      .list({ limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setServices(result.data);
        setState(result.data.length === 0 ? 'empty' : 'ready');
      })
      .catch(() => {
        if (cancelled) return;
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [repository, reloadToken]);

  return (
    <ScreenLayout
      state={state}
      errorMessage="Gagal memuat layanan. Silakan coba lagi."
      onRetry={() => setReloadToken((t) => t + 1)}
    >
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServiceCard service={item} onPress={() => onSelectService?.(item.id)} />}
      />
    </ScreenLayout>
  );
}
```

- [ ] **Step 4: Run it and confirm it passes**

```bash
npx jest src/features/services/screens/__tests__/ServiceListScreen.test.tsx
```

Expected: `7 passed, 7 total`.

- [ ] **Step 5: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/features/services/screens/ServiceListScreen.tsx apps/mobile/src/features/services/screens/__tests__/ServiceListScreen.test.tsx
git commit -m "feat(mobile): add ServiceListScreen with retry and loop-regression coverage from the start"
```

---

### Task 4: `ServiceDetailScreen` and navigation wiring

**Files:**
- Create: `apps/mobile/src/features/services/screens/ServiceDetailScreen.tsx`
- Create: `apps/mobile/src/features/services/screens/__tests__/ServiceDetailScreen.test.tsx`
- Modify: `apps/mobile/src/navigation/RootNavigator.tsx` (add `ServiceList`/`ServiceDetail`)
- Modify: `apps/mobile/src/navigation/linking.ts` (add `services`/`services/:serviceId`)
- Modify: `apps/mobile/src/navigation/routes/HomeRoute.tsx` (add a second "Lihat Layanan" link)
- Create: `apps/mobile/src/navigation/routes/ServiceListRoute.tsx`
- Create: `apps/mobile/src/navigation/routes/ServiceDetailRoute.tsx`

**Interfaces:**
- Consumes: `ScreenLayout` (WP-02a), `ServiceRepository`/`FixtureServiceRepository` (Task 1), `ServiceListScreen` (Task 3), `RootStackParamList`/`RootNavigator` (WP-02a, extended here).
- Produces: working Services navigation — nothing further in this plan consumes it.

- [ ] **Step 1: Write the failing tests for `ServiceDetailScreen`**

```tsx
// apps/mobile/src/features/services/screens/__tests__/ServiceDetailScreen.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { ServiceDetailScreen } from '../ServiceDetailScreen';
import { FixtureServiceRepository } from '../../data/fixtureServiceRepository';
import type { ServiceRepository } from '../../data/serviceRepository';
import type { Service } from '../../domain/types';

const activeService: Service = {
  id: 's1', code: 'SKA', title: 'Surat Keterangan Asal', description: 'Deskripsi lengkap layanan SKA.',
  status: 'active', organizationId: 'org-1', ownerId: 'user-1',
  eligibilitySummary: 'Anggota aktif KADIN.',
};

const inactiveService: Service = { ...activeService, id: 's5', title: 'Certificate of Origin', status: 'inactive' };

function makeRepository(overrides: Partial<ServiceRepository> = {}): ServiceRepository {
  return {
    list: jest.fn().mockResolvedValue({ data: [], page: { nextCursor: null, limit: 10 } }),
    getById: jest.fn().mockResolvedValue(activeService),
    ...overrides,
  };
}

describe('ServiceDetailScreen', () => {
  it('shows a loading state before data arrives', async () => {
    render(<ServiceDetailScreen serviceId="s1" repository={makeRepository()} />);
    expect(screen.getByLabelText('Memuat data')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
  });

  it('renders the service title, description, and eligibility once loaded', async () => {
    render(<ServiceDetailScreen serviceId="s1" repository={makeRepository()} />);
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
    expect(screen.getByText('Deskripsi lengkap layanan SKA.')).toBeTruthy();
    expect(screen.getByText('Syarat: Anggota aktif KADIN.')).toBeTruthy();
  });

  it('does not show an unavailable badge for an active service', async () => {
    render(<ServiceDetailScreen serviceId="s1" repository={makeRepository()} />);
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
    expect(screen.queryByText('Tidak tersedia')).toBeNull();
  });

  it('shows an unavailable badge for an inactive service rather than hiding it', async () => {
    const repository = makeRepository({ getById: jest.fn().mockResolvedValue(inactiveService) });
    render(<ServiceDetailScreen serviceId="s5" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Certificate of Origin')).toBeTruthy());
    expect(screen.getByText('Tidak tersedia')).toBeTruthy();
  });

  it('shows a not-found state for a nonexistent service id (distinct from the inactive case above)', async () => {
    const repository = makeRepository({ getById: jest.fn().mockResolvedValue(null) });
    render(<ServiceDetailScreen serviceId="does-not-exist" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Layanan tidak ditemukan.')).toBeTruthy());
  });

  it('shows an error state when the repository rejects', async () => {
    const repository = makeRepository({ getById: jest.fn().mockRejectedValue(new Error('network down')) });
    render(<ServiceDetailScreen serviceId="s1" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat layanan. Silakan coba lagi.')).toBeTruthy());
  });

  it('retries fetching when the error state retry button is pressed', async () => {
    const getById = jest
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(activeService);
    const repository = makeRepository({ getById });
    render(<ServiceDetailScreen serviceId="s1" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat layanan. Silakan coba lagi.')).toBeTruthy());
    fireEvent.press(screen.getByText('Coba Lagi'));
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
    expect(getById).toHaveBeenCalledTimes(2);
  });

  it('does not loop when no repository prop is given (uses a stable default instance)', async () => {
    const spy = jest.spyOn(FixtureServiceRepository.prototype, 'getById');
    render(<ServiceDetailScreen serviceId="s1" />);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/features/services/screens/__tests__/ServiceDetailScreen.test.tsx
```

Expected: FAIL — `Cannot find module '../ServiceDetailScreen'`.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// apps/mobile/src/features/services/screens/ServiceDetailScreen.tsx
import { useEffect, useState, type ReactElement } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { ScreenLayout, type ScreenState } from '../../../shared/ui/ScreenLayout';
import { FixtureServiceRepository } from '../data/fixtureServiceRepository';
import type { Service } from '../domain/types';
import type { ServiceRepository } from '../data/serviceRepository';
import { colors } from '../../../shared/ui/colors';

const defaultServiceRepository = new FixtureServiceRepository();

export interface ServiceDetailScreenProps {
  serviceId: string;
  repository?: ServiceRepository;
}

export function ServiceDetailScreen({
  serviceId,
  repository = defaultServiceRepository,
}: ServiceDetailScreenProps): ReactElement {
  const [service, setService] = useState<Service | null>(null);
  const [state, setState] = useState<ScreenState>('loading');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    repository
      .getById(serviceId)
      .then((result) => {
        if (cancelled) return;
        setService(result);
        setState(result ? 'ready' : 'empty');
      })
      .catch(() => {
        if (cancelled) return;
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, repository, reloadToken]);

  const isActive = service?.status === 'active';

  return (
    <ScreenLayout
      state={state}
      errorMessage="Gagal memuat layanan. Silakan coba lagi."
      emptyMessage="Layanan tidak ditemukan."
      onRetry={() => setReloadToken((t) => t + 1)}
    >
      {service && (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title} accessibilityRole="header">
            {service.title}
          </Text>
          {!isActive && <Text style={styles.unavailableBadge}>Tidak tersedia</Text>}
          <Text style={styles.description}>{service.description}</Text>
          <Text style={styles.eligibility}>Syarat: {service.eligibilitySummary}</Text>
        </ScrollView>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  unavailableBadge: { fontSize: 13, color: colors.dangerText, fontWeight: '600', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  eligibility: { fontSize: 13, color: colors.mutedText },
});
```

- [ ] **Step 4: Run it and confirm it passes**

```bash
npx jest src/features/services/screens/__tests__/ServiceDetailScreen.test.tsx
```

Expected: `8 passed, 8 total`.

- [ ] **Step 5: Add the route wrapper components**

```tsx
// apps/mobile/src/navigation/routes/ServiceListRoute.tsx
import type { ReactElement } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { ServiceListScreen } from '../../features/services/screens/ServiceListScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceList'>;

export function ServiceListRoute({ navigation }: Props): ReactElement {
  return (
    <ServiceListScreen
      onSelectService={(serviceId) => navigation.navigate('ServiceDetail', { serviceId })}
    />
  );
}
```

```tsx
// apps/mobile/src/navigation/routes/ServiceDetailRoute.tsx
import type { ReactElement } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { ServiceDetailScreen } from '../../features/services/screens/ServiceDetailScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceDetail'>;

export function ServiceDetailRoute({ route }: Props): ReactElement {
  return <ServiceDetailScreen serviceId={route.params.serviceId} />;
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
import { ServiceListRoute } from './routes/ServiceListRoute';
import { ServiceDetailRoute } from './routes/ServiceDetailRoute';

export type RootStackParamList = {
  Home: undefined;
  NewsList: undefined;
  NewsDetail: { articleId: string };
  ServiceList: undefined;
  ServiceDetail: { serviceId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerTitle: 'KADIN Indonesia' }}>
      <Stack.Screen name="Home" component={HomeRoute} options={{ headerTitle: 'KADIN Indonesia' }} />
      <Stack.Screen name="NewsList" component={NewsListRoute} options={{ headerTitle: 'Berita' }} />
      <Stack.Screen name="NewsDetail" component={NewsDetailRoute} options={{ headerTitle: 'Detail Berita' }} />
      <Stack.Screen name="ServiceList" component={ServiceListRoute} options={{ headerTitle: 'Layanan' }} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailRoute} options={{ headerTitle: 'Detail Layanan' }} />
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
      ServiceList: 'services',
      ServiceDetail: 'services/:serviceId',
    },
  },
};
```

- [ ] **Step 7: Add the second home-screen link**

```tsx
// apps/mobile/src/navigation/routes/HomeRoute.tsx
import type { ReactElement } from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { WelcomeScreen } from '../../features/shell/screens/WelcomeScreen';
import { colors } from '../../shared/ui/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeRoute({ navigation }: Props): ReactElement {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <WelcomeScreen />
      <Pressable onPress={() => navigation.navigate('NewsList')} style={styles.link} accessibilityRole="button">
        <Text style={styles.linkText}>Lihat Berita</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('ServiceList')} style={styles.link} accessibilityRole="button">
        <Text style={styles.linkText}>Lihat Layanan</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  link: { padding: 16, alignItems: 'center' },
  linkText: { fontSize: 16, color: colors.linkText, fontWeight: '600' },
});
```

Route wrapper files stay intentionally thin and untested directly, same policy as WP-02a — their logic is already covered by `ServiceListScreen`'s and `ServiceDetailScreen`'s own tests.

- [ ] **Step 8: Run the full suite and typecheck**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest
npx tsc --noEmit
```

Expected: every WP-02a suite still passes, plus all new Services suites (colors 4, repository 5, ServiceCard 4, ServiceListScreen 7, ServiceDetailScreen 8); `tsc --noEmit` exits 0. If the exact total differs, read why before treating it as a pass — the important check is 0 failed, not the precise number.

- [ ] **Step 9: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/features/services/screens/ServiceDetailScreen.tsx apps/mobile/src/features/services/screens/__tests__/ServiceDetailScreen.test.tsx apps/mobile/src/navigation/
git commit -m "feat(mobile): add ServiceDetailScreen and wire Services navigation"
```

---

### Task 5: Visual verification and milestone tag

**Files:** none (verification-only task; no source changes expected).

**Interfaces:**
- Consumes: the fully wired app from Task 4.
- Produces: visual confirmation recorded in the final report.

- [ ] **Step 1: Start the Expo web dev server in the background**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx expo start --web --port 19006 > /tmp/expo-web-wp02b.log 2>&1 &
echo "started with PID $!"
```

- [ ] **Step 2: Poll until ready, then check the log**

```bash
i=0; until grep -qiE "web bundled|localhost:19006|error" /tmp/expo-web-wp02b.log || [ $i -ge 30 ]; do sleep 2; i=$((i+1)); done
tail -60 /tmp/expo-web-wp02b.log
```

Expected: the server listening on `localhost:19006`. If an error appears instead, fix it before proceeding.

- [ ] **Step 3: Verify every route — old and new — actually renders (regression sweep)**

Using whatever visual-verification path is available in the session, visit and confirm:
- `http://localhost:19006/` — shows the WelcomeScreen heading plus **both** "Lihat Berita" and "Lihat Layanan" links.
- `http://localhost:19006/news` — still renders (regression check that adding Services didn't break News).
- `http://localhost:19006/services` — shows all 5 service cards, with "Certificate of Origin" showing a "Tidak tersedia" badge and "Lihat status layanan" (not "Lihat detail layanan").
- `http://localhost:19006/services/s1` — shows "Surat Keterangan Asal (SKA)" with no unavailable badge.
- `http://localhost:19006/services/s5` — shows "Certificate of Origin" **with** the "Tidak tersedia" badge (full detail, not a not-found page).
- `http://localhost:19006/services/does-not-exist` — shows "Layanan tidak ditemukan." (distinct from the `s5` case above).

If direct URL navigation to a route doesn't resolve, fall back to interaction-based verification (click through from Home) as WP-02a's Task 8 did.

- [ ] **Step 4: Stop the dev server**

```bash
pkill -f "expo start --web" 2>/dev/null
```

- [ ] **Step 5: Tag the milestone**

```bash
cd /Users/henrisetiawan/kadin_verse
git log --oneline
git tag wp02b-services-catalogue
```

---

## Known gaps intentionally left for later work

- Service enquiry/application submission is `SDD.md` WP-07, not WP-02 — this plan is read-only browsing, same restriction as WP-02a's News.
- No admin CMS to manage services (status, fixtures are hardcoded) — WP-03.
- `FixtureServiceRepository` is in-memory only; a real HTTP-backed implementation is blocked on ADR-007 (backend framework/hosting).
- No native deep-link scheme — web `linking` only, same known gap WP-02a already recorded.
- No search/filter/category on the service catalogue — PRD EPIC-05 doesn't require it for MVP; the repository's cursor-pagination contract exists and is tested regardless.
- EPIC-05's "each published service has an owner and valid contact/action" is not surfaced on `ServiceCard` or `ServiceDetailScreen`. `Service.ownerId`/`organizationId` are opaque ids with no name-lookup repository in this plan's scope, so rendering them would show raw ids rather than a usable owner/contact — a real owner/contact display needs an org/user lookup, which is blocked on ADR-007 (backend framework) like the rest of this feature's live data. Deferred to the same backend work as the rest of WP-02's "fixture-only" gap, not a new one.
