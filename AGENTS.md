# AGENTS.md

## Project Scope

This repository is the Tempo frontend: a React Native + Expo sports app for scores, game details, player/team pages, news, favorites, forums, messages, and profile flows.

The backend is separate. Frontend code must consume the backend API and must not fetch or normalize ESPN data directly.

## Stack

- React Native with TypeScript
- Expo and Expo Router
- Functional components and hooks
- Axios through the shared frontend API client
- AsyncStorage for persisted auth/session data
- Socket.IO for realtime messaging/chat where already used

## Important Paths

- `app/`: Expo Router screens and route layouts
- `components/`: reusable presentational UI
- `hooks/`: feature hooks for fetching, state, polling, and mutations
- `services/`: API wrappers for larger service areas such as messages and users
- `utils/apiClient.ts`: canonical API client, auth headers, refresh handling, and `BASE_URL`
- `contexts/`: app-level providers such as preferences, notifications, and favorite teams
- `constants/`: static team data, style tokens, and app constants
- `types/`: shared TypeScript model definitions
- `assets/`: local images, logos, fonts, animations, and media

## Architecture Rules

- Keep screens in `app/` focused on composition, navigation, and connecting hooks to UI.
- Keep reusable UI in `components/`. Components may manage local UI state, but should not own backend request logic.
- Put data fetching, polling, request cancellation, mutations, loading/error state, and response shaping in hooks or service modules.
- Put cross-feature API wrappers in `services/` when multiple hooks/screens need the same backend operations.
- Prefer shared types from `types/`; if a type is feature-local, define it near the hook/service that owns it.
- Do not introduce a second API client. The legacy `api.ts` exists, but new work should use `utils/apiClient.ts`.

## API Rules

- Use `apiClient` from `utils/apiClient.ts` for backend HTTP calls.
- Use `BASE_URL` from `utils/apiClient.ts` only when an API requires an absolute URL, such as media, sockets, or APIs that cannot use the Axios instance directly.
- Do not call ESPN or other sports data providers from the frontend. If new sports data is needed, call a backend endpoint or add the backend work separately.
- Do not normalize raw ESPN responses in this repo. The frontend should receive backend-normalized responses and may only do view-specific mapping.
- Preserve `apiClient` auth behavior: it attaches access tokens, refreshes tokens, clears session state, and redirects to login on failed refresh.
- Avoid hardcoded localhost URLs in new code. Use `EXPO_PUBLIC_API_URL` through `apiClient`/`BASE_URL`.
- Some existing hooks still use raw `axios` or `fetch`; do not copy that pattern for new backend calls. When touching those files for related work, prefer migrating the touched call to `apiClient`.

## Styling and UX Rules

- Use `constants/styles.ts` for shared colors, fonts, and global styles.
- Respect the app's light/dark preference flow from `contexts/PreferencesContext`.
- Keep sports views dense, scannable, and optimized for repeat use.
- Reuse existing skeleton components from `components/Skeletons/` for loading states.
- Reuse existing tab bars, headers, modals, cards, and game components before creating new variants.
- Keep platform constraints in mind: this is a mobile-first React Native app that may also run through Expo web.

## Routing and Navigation

- Follow Expo Router file-based routing under `app/`.
- Dynamic routes use bracket files such as `app/game/[game].tsx` and `app/team/[teamId].tsx`.
- Global providers and auth redirection live in `app/_layout.tsx`; avoid duplicating app-wide provider setup in screens.
- Keep route-specific header behavior near the route/layout that owns it.

## State and Persistence

- Use hooks for feature state and server interaction.
- Use contexts only for app-wide state that multiple feature areas need.
- Use AsyncStorage deliberately and keep auth/session key handling aligned with `utils/apiClient.ts`.
- Do not store derived server data globally unless multiple screens need the same cached state.

## Imports

- Existing code uses root-style imports such as `components/...`, `hooks/...`, `utils/...`, `constants/...`, and `contexts/...`.
- `tsconfig.json` also defines `@/*` for `src/*`, but this repo currently keeps most code at the root. Match nearby file conventions when adding imports.

## Verification

Run the smallest useful checks for the change:

- `npm run lint` for linting.
- `npx tsc --noEmit` for TypeScript checking when touching types, hooks, API responses, or route params.
- `npm run start`, `npm run ios`, `npm run android`, or `npm run web` when a visual/runtime check is needed.

If a command cannot be run in the current environment, mention that in the final response.

## Working Guidelines

- Keep changes scoped to the requested frontend behavior.
- Preserve user-facing behavior unless the task explicitly asks to change it.
- Do not remove existing assets, route files, or generated Expo files unless the task requires it.
- Do not commit secrets. Environment-specific API configuration belongs in `.env` using Expo public env variables such as `EXPO_PUBLIC_API_URL`.
- Prefer incremental cleanup in files you already touch over broad unrelated refactors.
