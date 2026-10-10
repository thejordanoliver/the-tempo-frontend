# Frontend structure audit — 2026-10-09

## Recommendation

Restructure incrementally. The current separation of routes, UI, hooks, services,
and shared types is useful; a wholesale folder migration would create import and
routing churn without resolving the largest maintenance problems.

This audit inspected repository structure, representative routes/providers,
API call placement, aliases, and the lint/TypeScript results from this session.
It is not a full security, runtime, or performance audit.

## Findings, in priority order

### 1. Restore a clean TypeScript baseline before moving files

`npx tsc --noEmit` reported six errors outside the changed useTeams hook:

- `app/user/[id].tsx:283`: unsupported `isCurrentUser` prop.
- Baseball and basketball `Team/RosterStats.tsx`: `GameTeamStats` is absent from their props types.
- `utils/footballRosterStats.ts`: missing football `GameTeamStats` export.
- `utils/stats.ts`: missing basketball `BasketballGameTeamStats` and `GameTeamStats` exports.

Check the intended data contracts and consumers before repairing these. Moving
files while checks already fail makes migration regressions harder to identify.

### 2. Split large screens by responsibility

`app/league/basketball.tsx` has 1,887 lines and multiple league screen
implementations, with repeated date/calendar/refresh orchestration.
Football and baseball league screens have 1,034 and 822 lines respectively.

Extract individual league screens outside `app/`, then extract common calendar
and refresh behavior where semantics match. Preserve sport-specific behavior.
Keep route files as small adapters for params, navigation, and screen composition.

The existing `hooks/TeamHooks/useTeamDetailScreen.ts` and shared team detail
component already demonstrate an appropriate pattern for reuse.

### 3. Reduce provider responsibilities before relocating them

`contexts/MessagesContext.tsx` has 1,412 lines, combining message state,
pagination, reconciliation, API mutations, and socket integration.
`contexts/NotificationContext.tsx` has 1,382 lines and also renders notification
UI, including a settings modal.

Keep the public context API and app-wide provider lifetime stable. Extract
cohesive state/lifecycle hooks and pure helpers first; separate notification UI
composition where useful. File length signals a review target, not proof of a
render-performance problem. Profile consumers before changing subscriptions.

### 4. Feature ownership is scattered

The scan counted 402 component files, 135 hooks, 71 utilities, 18 services,
and 40 type files. Messaging, forums, and explore each span several roots.
Hooks mix folders such as `BasketballHooks`, `NBAHooks`, `LeagueHooks`, and
root-level feature hooks. `useTeams.ts` exports `useTeamDetails` and contains
a stale comment referring to a different path.

Group one feature at a time when touching it. Use lowercase feature names and
file names that match their exports. Avoid moving shared utilities into a
feature merely because that feature currently uses them.

### 5. Preserve the existing route reuse

Several tab routes are already one-line adapters, such as the shared messages
route exporting `app/messages/index`, and team routes exporting
`components/Navigation/TeamRouteScreen`.

Retain route paths and tab-stack grouping. Move implementation modules outside
`app/` only after checking navigation callers and re-exporting from the original
routes. Run `npm run test:navigation` for those migrations and exercise tab/back
navigation in the app.

### 6. Align aliases and written guidance

`tsconfig.json` actually maps `@/*` to the repository root, not `src/*` as
AGENTS.md currently states. Imports mix `@/`, named root aliases, and relative
paths. Babel and TypeScript duplicate alias configuration; `schemas/*` appears
in TypeScript but has no corresponding named Babel alias.

Prefer `@/` for new feature paths and keep resolver configuration aligned.
Correct the documentation before any optional migration to `src/`.

### 7. Keep the current API boundary

The inspected sports hooks use the shared client. The targeted scan found no
direct ESPN sports-data requests in hooks, services, screens, or contexts.
Axios error helpers and ESPN article-link validation are not provider fetching.

Raw Axios is still used for logout in `hooks/UserHooks/useAuth.ts` and token
refresh in `utils/apiClient.ts`. Refresh needs separate treatment to avoid
interceptor recursion; inspect logout/session semantics before changing it.
Do not mechanically replace every Axios reference.

## Suggested destination for one pilot feature

```text
app/                       # existing Expo routes and layouts
features/
  news/
    screens/
    components/
    hooks/
    api.ts                 # only if shared operations justify it
    types.ts
components/                # UI shared across features
contexts/                  # app-wide providers
services/                  # shared infrastructure and cross-feature APIs
utils/                     # genuinely shared helpers, including apiClient
constants/
types/                     # cross-feature contracts
assets/
tests/
```

News is a smaller candidate for a pilot than messaging. Preserve old exports
temporarily if needed, update consumers, and remove compatibility exports only
when nothing imports them. Add feature boundaries to AGENTS.md when adopting
this structure. A `src/` move is optional and should be a separate decision.

## Migration order and verification

1. Repair TypeScript errors and the unused `runRefresh` lint warnings in CFB/UFL routes.
2. Extract the basketball league implementations with unchanged route adapters.
3. Pilot feature ownership with news; evaluate whether navigation and maintenance improve.
4. Extract messaging/notification internals while preserving provider APIs and session cleanup.
5. Continue feature migrations only alongside related work.

Lint passed with two warnings during this session. TypeScript failed with the
six errors listed above. No device/web runtime check, full test-suite run,
dependency audit, or backend audit was performed. This report changes no runtime
code; check results predate this documentation-only addition.
