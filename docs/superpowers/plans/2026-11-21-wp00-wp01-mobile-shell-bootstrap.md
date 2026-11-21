# WP-00/WP-01 Mobile Shell Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the `kadin-next` repository layout decided in ADR-012, scaffold a TypeScript-strict Expo mobile app inside it, and get a minimal accessible Welcome shell screen actually rendering in a browser (via Expo web) on this Mac — the explicit "first safe task" (WP-00 + WP-01) that `AGENTS.md`/`SDD.md` authorize without waiting on any blocked ADR.

**Architecture:** Git-init the existing `kadin_verse` directory as the `kadin-next` repo root, apply the canonical folder tree from ADR-012 (move `PRD.md`/`SAD.md`/`SDD.md` under `docs/`, create skeleton `apps/`, `services/`, `packages/`, `db/`, `tests/`, `infrastructure/`), then scaffold `apps/mobile` as a standalone Expo TypeScript app (no monorepo workspace tooling yet — ADR-007 package-manager choice is still open) with a feature-first `src/` layout, an `AppShell` error boundary, and a `WelcomeScreen`, proven by Jest + React Native Testing Library tests and a live `expo start --web` render.

**Tech Stack:** Expo (latest, TypeScript template), React Native, Jest, `jest-expo`, `@testing-library/react-native`, git. No backend, no IdP, no membership registry, no QR — those remain blocked by ADR-003/004/005 per `AGENTS.md` §3.

**Spec:** `PRD.md` (EPIC-02 Home and navigation, §8 UX requirements), `SAD.md` §5 (Mobile application architecture), `SDD.md` §3–4 (repository structure, feature modules, component contracts), `AGENTS.md` §4/§6/§8 (architecture baseline, engineering rules, B-001 backlog gate), `docs/adr/ADR-012-repository-layout-canonicalization.md` (ACCEPTED canonical layout).

## Global Constraints

- TypeScript `strict: true` everywhere in `apps/mobile` (`AGENTS.md` §6).
- No live identity, membership-registry, or QR integration of any kind; everything stays mock/stub until ADR-003/004/005 are resolved (`AGENTS.md` §3, §8).
- Feature-first structure: `src/features/<feature>/{components,screens,domain,data,__tests__}` plus `src/shared/{ui,api,auth,utils}` (`SAD.md` §5, `AGENTS.md` §4).
- Accessibility: every screen needs a meaningful `accessibilityLabel`/screen-reader-visible text (`AGENTS.md` §6, `PRD.md` §8).
- RED → GREEN → REFACTOR for every behavior; never claim a test passed without actually running it (`AGENTS.md` §5, `SDD.md` §12).
- Repository layout follows `docs/adr/ADR-012-repository-layout-canonicalization.md` exactly — do not invent a different tree.
- Never log, hardcode, or commit secrets, tokens, or the original APK/decompiled assets (`AGENTS.md` §2, §6).
- This plan stops at WP-00/WP-01 only. Do not add navigation libraries, auth screens, or API clients beyond what each task below specifies — those are later work packages (`SDD.md` §14).

## Review Focus

- **Stale ADR-012 pointer links after moving docs** — `SAD.md`, `SDD.md`, and `AGENTS.md` all contain relative-path pointers to `docs/adr/ADR-012-repository-layout-canonicalization.md`; moving files around must not break them. → Task 1 verifies with `grep` after the move.
- **A stub screen that reads as "done"** — a bare "Welcome to KADIN" heading could look production-ready to a future contributor skimming the app, encouraging them to wire real auth/membership on top of it prematurely. → Task 4's test asserts the visible "belum aktif" (not yet active) disclaimer text stays on screen, not just the heading.
- **TypeScript strict mode silently turned off** by a template default or a later edit. → Task 2 asserts `"strict": true` is present in `apps/mobile/tsconfig.json` with an automated grep check, not a one-time eyeball.
- **`node_modules`/`.expo` committed to git**, bloating the repo or leaking local absolute paths from this machine. → Task 2 creates `.gitignore` before the first commit that includes `apps/mobile`, and Task 2's commit step verifies `git status` shows neither directory staged.
- **Error boundary that silently stops catching errors** after a future refactor, because only the happy path was ever tested. → Task 5 includes a second test that makes a child component throw and asserts the fallback UI appears.

---

### Task 1: Git init + ADR-012 canonical repository skeleton

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Move: `PRD.md` → `docs/PRD.md`
- Move: `SAD.md` → `docs/SAD.md`
- Move: `SDD.md` → `docs/SDD.md`
- Create: `apps/admin/.gitkeep`, `services/api/.gitkeep`, `packages/contracts/.gitkeep`, `packages/types/.gitkeep`, `packages/design-tokens/.gitkeep`, `packages/shared-utils/.gitkeep`, `packages/config/.gitkeep`, `db/migrations/.gitkeep`, `db/seeds/.gitkeep`, `tests/contract/.gitkeep`, `tests/e2e/.gitkeep`, `tests/security/.gitkeep`, `infrastructure/.gitkeep`, `.github/workflows/.gitkeep`

**Interfaces:**
- Produces: a git repository at `/Users/henrisetiawan/kadin_verse` with the ADR-012 canonical tree, used as the working directory for every later task.

- [ ] **Step 1: Initialize git**

```bash
cd /Users/henrisetiawan/kadin_verse
git init
git config user.name "KADIN Next Bootstrap" --local
```

(Use whatever `user.email`/`user.name` the repo's actual owner wants later — this is a local-only placeholder config, not something to push anywhere.)

- [ ] **Step 2: Create the ADR-012 skeleton folders**

```bash
mkdir -p apps/mobile apps/admin services/api \
  packages/contracts packages/types packages/design-tokens packages/shared-utils packages/config \
  db/migrations db/seeds \
  tests/contract tests/e2e tests/security \
  infrastructure \
  .github/workflows \
  docs

touch apps/admin/.gitkeep services/api/.gitkeep \
  packages/contracts/.gitkeep packages/types/.gitkeep packages/design-tokens/.gitkeep \
  packages/shared-utils/.gitkeep packages/config/.gitkeep \
  db/migrations/.gitkeep db/seeds/.gitkeep \
  tests/contract/.gitkeep tests/e2e/.gitkeep tests/security/.gitkeep \
  infrastructure/.gitkeep .github/workflows/.gitkeep
```

- [ ] **Step 3: Move the three top-level docs under `docs/` per ADR-012**

```bash
git mv PRD.md docs/PRD.md 2>/dev/null || mv PRD.md docs/PRD.md
git mv SAD.md docs/SAD.md 2>/dev/null || mv SAD.md docs/SAD.md
git mv SDD.md docs/SDD.md 2>/dev/null || mv SDD.md docs/SDD.md
```

(`git mv` will fail with "not under version control" since nothing is committed yet — the `|| mv` fallback is expected to run. This is fine; the files still end up in the right place and get added in Step 6.)

- [ ] **Step 4: Verify the ADR-012 pointer links still resolve from their new locations**

```bash
grep -rn "docs/adr/ADR-012-repository-layout-canonicalization.md" docs/SAD.md docs/SDD.md AGENTS.md
```

Expected: three matches (one per file), each still pointing at a path that exists relative to the repo root. Confirm the target file is actually there:

```bash
test -f docs/adr/ADR-012-repository-layout-canonicalization.md && echo "ADR-012 present"
```

Expected output: `ADR-012 present`.

- [ ] **Step 5: Write root `.gitignore` and `README.md`**

`.gitignore`:
```
node_modules/
.expo/
.expo-shared/
dist/
web-build/
*.log
.DS_Store
.env
.env.local
```

`README.md`:
```markdown
# kadin-next

Successor KADIN Indonesia mobile platform — proposed, not production.

Read `AGENTS.md` first. Product scope and evidence boundaries are in `docs/PRD.md`,
architecture in `docs/SAD.md`, implementation design in `docs/SDD.md`, and accepted
architecture decisions in `docs/adr/`.

**Status:** pre-alpha bootstrap (WP-00/WP-01 only). No live identity, membership
registry, or QR integration exists yet — see `AGENTS.md` §3 for the backlog gates.
```

- [ ] **Step 6: Stage and commit**

```bash
git add -A
git status
```

Expected in `git status` output: `apps/mobile` NOT listed yet (it doesn't exist until Task 2), and no `node_modules` or `.expo` entries anywhere.

```bash
git commit -m "chore: initialize kadin-next repo skeleton per ADR-012"
git log --oneline
```

Expected: one commit, message as above.

---

### Task 2: Scaffold the Expo TypeScript app in `apps/mobile`

**Files:**
- Create: `apps/mobile/` (generated by `create-expo-app`)
- Modify: `apps/mobile/tsconfig.json` (verify, patch if needed)
- Modify: `.gitignore` (confirm it already covers `apps/mobile/node_modules`, `apps/mobile/.expo` via the top-level patterns from Task 1 — no edit needed since the patterns are unanchored)

**Interfaces:**
- Consumes: the git repo and folder skeleton from Task 1.
- Produces: a runnable Expo app at `apps/mobile` with `strict: true` TypeScript, used by every later task.

- [ ] **Step 1: Generate the app**

```bash
cd /Users/henrisetiawan/kadin_verse
npx create-expo-app@latest apps/mobile --template blank-typescript
```

Expected: command exits 0 and `apps/mobile/package.json`, `apps/mobile/App.tsx`, `apps/mobile/tsconfig.json` exist. If this specific template id has been renamed or removed by the time this runs, run `npx create-expo-app@latest apps/mobile` with no `--template` flag, pick the "Blank (TypeScript)" option from the interactive prompt it shows, and record in the Task 2 commit message which template name was actually used — do not silently substitute a different stack (e.g. a JavaScript template) without flagging it.

- [ ] **Step 2: Verify TypeScript strict mode is on**

```bash
cat apps/mobile/tsconfig.json
```

Expected: it extends `expo/tsconfig.base`, which sets `"strict": true`. Confirm directly instead of trusting the extend chain by eye:

```bash
node -e "const ts=require('typescript'); const cfg=ts.getParsedCommandLineOfConfigFile('apps/mobile/tsconfig.json', {}, {useCaseSensitiveFileNames:true, readDirectory: ts.sys.readDirectory, fileExists: ts.sys.fileExists, readFile: ts.sys.readFile, getCurrentDirectory: ts.sys.getCurrentDirectory}); console.log('strict:', cfg.options.strict);"
```

If this prints anything other than `strict: true`, add `"strict": true` directly under `"compilerOptions"` in `apps/mobile/tsconfig.json` and rerun the check until it does.

- [ ] **Step 3: Confirm the generated app type-checks and installs cleanly**

```bash
cd apps/mobile
npx tsc --noEmit
```

Expected: exits 0, no errors. If it fails, fix whatever the generated template's own code triggers before moving on — do not proceed to Task 3 with a red `tsc`.

- [ ] **Step 4: Confirm git ignores `node_modules`/`.expo` from this app**

```bash
cd /Users/henrisetiawan/kadin_verse
git status --porcelain apps/mobile | grep -i "node_modules\|\.expo/" ; echo "exit:$?"
```

Expected: no matching lines, so `grep` exits 1 and the printed `exit:` is `1` — confirming neither directory shows up as untracked/staged content.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): scaffold Expo TypeScript app (blank-typescript template)"
```

---

### Task 3: Add the Jest + React Native Testing Library test harness

**Files:**
- Modify: `apps/mobile/package.json` (add devDependencies + `test` script + `jest` config)
- Create: `apps/mobile/src/shared/ui/__tests__/sanity.test.tsx`

**Interfaces:**
- Consumes: the Expo app scaffold from Task 2.
- Produces: a working `npm test` command in `apps/mobile`, used by Tasks 4 and 5.

- [ ] **Step 1: Install test dependencies**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx expo install jest-expo jest@~29 react-test-renderer --save-dev
npm install --save-dev @testing-library/react-native @types/jest
```

(Using `npx expo install` for the Expo-aware packages ensures version compatibility with the installed Expo SDK; plain `npm install` is fine for the two packages with no Expo-specific version matrix.)

- [ ] **Step 2: Configure Jest in `package.json`**

Add this top-level key to `apps/mobile/package.json` (merge into the existing JSON, don't replace the whole file):

```json
{
  "jest": {
    "preset": "jest-expo"
  },
  "scripts": {
    "test": "jest"
  }
}
```

- [ ] **Step 3: Write a throwaway sanity test**

```tsx
// apps/mobile/src/shared/ui/__tests__/sanity.test.tsx
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('test harness sanity check', () => {
  it('can render and query React Native components', () => {
    render(<Text>harness ok</Text>);
    expect(screen.getByText('harness ok')).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run it and confirm it passes**

```bash
npx jest src/shared/ui/__tests__/sanity.test.tsx
```

Expected: `1 passed, 1 total`. If Jest fails to resolve the `jest-expo` preset or RN internals, fix the harness here — do not move to Task 4 with a broken runner.

- [ ] **Step 5: Delete the throwaway test and commit the harness itself**

```bash
rm src/shared/ui/__tests__/sanity.test.tsx
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/package.json apps/mobile/package-lock.json
git commit -m "test(mobile): add jest-expo + React Native Testing Library harness"
```

---

### Task 4: TDD the `WelcomeScreen`

**Files:**
- Create: `apps/mobile/src/features/shell/screens/WelcomeScreen.tsx`
- Create: `apps/mobile/src/features/shell/screens/__tests__/WelcomeScreen.test.tsx`

**Interfaces:**
- Produces: `export function WelcomeScreen(): JSX.Element` — a presentational component with no props, consumed by Task 5's `App.tsx` wiring.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/mobile/src/features/shell/screens/__tests__/WelcomeScreen.test.tsx
import { render, screen } from '@testing-library/react-native';
import { WelcomeScreen } from '../WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders the KADIN welcome heading', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('Selamat datang di KADIN Indonesia')).toBeTruthy();
  });

  it('discloses that this is a pre-alpha stub, not a finished product', () => {
    render(<WelcomeScreen />);
    expect(
      screen.getByText(/tahap pengembangan awal.*belum aktif/i)
    ).toBeTruthy();
  });

  it('exposes an accessibility label for screen readers', () => {
    render(<WelcomeScreen />);
    expect(
      screen.getByLabelText('Halaman selamat datang KADIN Indonesia')
    ).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/features/shell/screens/__tests__/WelcomeScreen.test.tsx
```

Expected: FAIL — `Cannot find module '../WelcomeScreen'` (the file doesn't exist yet).

- [ ] **Step 3: Write the minimal implementation**

```tsx
// apps/mobile/src/features/shell/screens/WelcomeScreen.tsx
import { View, Text, StyleSheet } from 'react-native';

export function WelcomeScreen(): JSX.Element {
  return (
    <View
      style={styles.container}
      accessibilityLabel="Halaman selamat datang KADIN Indonesia"
    >
      <Text style={styles.heading}>Selamat datang di KADIN Indonesia</Text>
      <Text style={styles.status}>
        Status: tahap pengembangan awal (WP-01 shell) — fitur identitas, membership,
        dan QR belum aktif.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginTop: 12,
  },
});
```

- [ ] **Step 4: Run it and confirm it passes**

```bash
npx jest src/features/shell/screens/__tests__/WelcomeScreen.test.tsx
```

Expected: `3 passed, 3 total`.

- [ ] **Step 5: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/features/shell/screens/WelcomeScreen.tsx apps/mobile/src/features/shell/screens/__tests__/WelcomeScreen.test.tsx
git commit -m "feat(mobile): add WelcomeScreen shell with accessibility label and stub disclosure"
```

---

### Task 5: TDD the `AppShell` error boundary and wire it into `App.tsx`

**Files:**
- Create: `apps/mobile/src/shared/ui/AppShell.tsx`
- Create: `apps/mobile/src/shared/ui/__tests__/AppShell.test.tsx`
- Modify: `apps/mobile/App.tsx`

**Interfaces:**
- Consumes: `WelcomeScreen` from Task 4.
- Produces: `export class AppShell extends Component<{ children: ReactNode }>` — wraps the whole app and renders a fallback instead of crashing when a child throws.

- [ ] **Step 1: Write the failing tests**

```tsx
// apps/mobile/src/shared/ui/__tests__/AppShell.test.tsx
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppShell } from '../AppShell';

function ThrowingChild(): JSX.Element {
  throw new Error('boom');
}

describe('AppShell', () => {
  it('renders its children when there is no error', () => {
    render(
      <AppShell>
        <Text>child content</Text>
      </AppShell>
    );
    expect(screen.getByText('child content')).toBeTruthy();
  });

  it('shows a fallback message instead of crashing when a child throws', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <AppShell>
        <ThrowingChild />
      </AppShell>
    );
    expect(
      screen.getByText('Terjadi kesalahan. Silakan muat ulang aplikasi.')
    ).toBeTruthy();
    consoleError.mockRestore();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest src/shared/ui/__tests__/AppShell.test.tsx
```

Expected: FAIL — `Cannot find module '../AppShell'`.

- [ ] **Step 3: Write the minimal implementation**

```tsx
// apps/mobile/src/shared/ui/AppShell.tsx
import { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AppShellProps {
  children: ReactNode;
}

interface AppShellState {
  hasError: boolean;
}

export class AppShell extends Component<AppShellProps, AppShellState> {
  state: AppShellState = { hasError: false };

  static getDerivedStateFromError(): AppShellState {
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View
          style={styles.errorContainer}
          accessibilityLabel="Terjadi kesalahan pada aplikasi"
        >
          <Text>Terjadi kesalahan. Silakan muat ulang aplikasi.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
```

- [ ] **Step 4: Run it and confirm it passes**

```bash
npx jest src/shared/ui/__tests__/AppShell.test.tsx
```

Expected: `2 passed, 2 total`.

- [ ] **Step 5: Wire `AppShell` + `WelcomeScreen` into `App.tsx`**

```tsx
// apps/mobile/App.tsx
import { AppShell } from './src/shared/ui/AppShell';
import { WelcomeScreen } from './src/features/shell/screens/WelcomeScreen';

export default function App(): JSX.Element {
  return (
    <AppShell>
      <WelcomeScreen />
    </AppShell>
  );
}
```

- [ ] **Step 6: Run the full test suite**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx jest
```

Expected: all suites pass (sanity test from Task 3 is already deleted; expect `WelcomeScreen` + `AppShell` suites only, 5 tests total, 0 failed).

- [ ] **Step 7: Commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git add apps/mobile/src/shared/ui/AppShell.tsx apps/mobile/src/shared/ui/__tests__/AppShell.test.tsx apps/mobile/App.tsx
git commit -m "feat(mobile): add AppShell error boundary and wire shell into App.tsx"
```

---

### Task 6: Run it for real and visually verify on this Mac

**Files:** none (verification-only task; no source changes).

**Interfaces:**
- Consumes: the wired `App.tsx` from Task 5.
- Produces: visual confirmation the app renders, recorded as evidence in the final report (per `AGENTS.md` §12's required response format) — nothing for a later task to consume.

This Mac has no Xcode Simulator and no Android SDK (`xcodebuild`/`adb` both absent — confirmed during planning). Use Expo's web target (`react-native-web`) to get a real rendered view in a browser instead.

- [ ] **Step 1: Start the Expo web dev server in the background**

```bash
cd /Users/henrisetiawan/kadin_verse/apps/mobile
npx expo start --web --port 19006 > /tmp/expo-web.log 2>&1 &
echo "started with PID $!"
```

- [ ] **Step 2: Wait for the bundler to report ready, then check the log**

```bash
sleep 15
tail -40 /tmp/expo-web.log
```

Expected: a line indicating the web bundle is ready and served on `http://localhost:19006` (exact wording varies by Expo CLI version — look for "Web Bundled" or a `localhost:19006` URL; if the log instead shows a crash/stack trace, stop and fix it rather than proceeding to Step 3).

- [ ] **Step 3: Open it in a real browser and screenshot it**

Load `mcp__claude-in-chrome__tabs_context_mcp` / `navigate` / `computer` tools (via `ToolSearch` if deferred), navigate a new tab to `http://localhost:19006`, wait for it to render, and take a screenshot.

Expected screenshot content: the text "Selamat datang di KADIN Indonesia" and the "tahap pengembangan awal ... belum aktif" status line, centered on the page.

- [ ] **Step 4: Stop the dev server**

```bash
kill %1 2>/dev/null || pkill -f "expo start --web"
```

- [ ] **Step 5: Tag the milestone commit**

```bash
cd /Users/henrisetiawan/kadin_verse
git log --oneline
git tag wp00-wp01-shell-bootstrap
```

No code changes in this task, so there is nothing new to `git add` — the tag just marks the commit from Task 5 as the verified-running milestone.

---

## Known gaps intentionally left for later work packages

- No navigation library wired yet (ADR-002 Expo Router vs React Navigation is still OPEN in `SAD.md` §15) — `App.tsx` renders exactly one screen. Adding a second route is the natural next WP-01 increment, not part of this plan.
- No CI workflow file inside `.github/workflows/` yet (only the placeholder directory from Task 1) — wiring `npx tsc --noEmit` + `npx jest` into CI is WP-00's remaining scope, deferred because it needs a CI provider decision this plan doesn't make.
- `apps/mobile` is a standalone npm project, not yet linked into a root workspace, because ADR-007 (package manager / workspace tool) is still OPEN.
