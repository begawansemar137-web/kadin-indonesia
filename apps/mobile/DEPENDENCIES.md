# Dependency notes

Non-obvious version pins in this package. Read this before running
`npm update` or letting any tool auto-bump these.

## `react-test-renderer` pinned exactly to `react`'s version (currently `19.3.0`)

`react-test-renderer` must match the installed `react` version exactly, not
just satisfy a semver range — a newer patch of `react-test-renderer` than
`react` declares a peer like `react@^19.3.1`, which fails `npm install`
with `ERESOLVE` against our `react@19.3.0`. If you bump `react`, bump
`react-test-renderer` to the identical version in the same change.

## `@testing-library/react-native` pinned to `13.3.3`, not the `14.x` line

`@testing-library/react-native@14.x` (as of `14.1.0`) declares a peer on a
different, newly-introduced package called `test-renderer` (not
`react-test-renderer`). Installing that package did not fix it: `render()`
from `@testing-library/react-native` silently failed to bind
(`screen.getByText` threw "render function has not been called") against
this project's Expo SDK 58 / React Native 0.88 / React 19.3 stack. `14.0.0`
shipped through 7 alpha, 6 beta, and 4 rc builds, suggesting it is not yet
stable for this combination. `13.3.3` (the last pre-`14.x` release) uses
the conventional `react-test-renderer` peer and works correctly here.
Re-evaluate `14.x` once it has matured past this project's dependency
versions, but confirm `npx jest` still passes before upgrading — don't
trust the install succeeding alone.

## `@types/jest` pinned to `^29.x`, matching the installed `jest@29.7.0`

`npm install @testing-library/react-native` with no version pin previously
resolved `@types/jest` to `^30.0.0` (a major ahead of the `jest@~29` this
project uses). Keep these two in the same major line.

## `tsconfig.json`'s `"types": ["jest"]`

Without an explicit `types` array, `tsc --noEmit` did not pick up
`@types/jest`'s ambient globals (`describe`, `it`, `expect`, `jest`) under
this project's TypeScript version (`~6.0.3`), failing with "Cannot find
name 'describe'" etc. across every test file. Adding `"types": ["jest"]`
fixed it. Side effect: this also disables TypeScript's automatic inclusion
of any *other* `@types/*` package project-wide — if a future dependency
needs ambient types (not just imported types), add it to this array too,
or the failure will look unrelated to this setting.
