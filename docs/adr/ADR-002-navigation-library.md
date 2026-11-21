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
