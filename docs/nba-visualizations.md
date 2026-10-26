# NBA visualizations

Implemented October 25, 2026. Existing uncommitted frontend and backend changes were retained.

## Initial audit and decisions

The NBA route, `app/(tabs)/(home)/game/basketball/[game].tsx`, already composed the score header, compact play-by-play court, line score, pregame matchup predictor, shot chart, box score, and game summary. `useBasketballGameDetails.ts` fetched the shared backend snapshot and listened through `useLiveSportsSubscription`. There was no historical probability or scoring-margin chart.

The backend's `basketballGameDetailsService.ts` already requested one summary, enriched participants, and used `basketballPlays.mapper.ts` to provide normalized 94-by-50-foot positions. Some shot and rebound locations are available; player tracking and actual ball flight are not. The NBA shot chart still used a static court and separately mapped provider coordinates on the frontend.

`basketballLiveAdapter.ts` shares the same snapshot service. Its existing five-second game interval, shared subscriptions, cache, and delta revisions remain unchanged. The frontend delta handler rejects stale revisions and requests a snapshot if a revision is missing. Reanimated 4 and react-native-svg 15 were installed already; no dependency was added. `constants/styles.ts` supplies colors/fonts, with existing preference and activity hooks reused.

The implementation extends existing components. Court geometry is independent of events, charts transform backend-normalized data, and the pregame predictor remains separate from historical probability. All new provider normalization lives in the backend.

The user subsequently chose to preserve the simplified latest-play card. Previous/next and court-view controls are intentionally absent from that card. The tested reusable playback hook supports historical selection for future consumers; the shot chart exposes full/half-court views and period filters now.

## Behavior

- Full and half courts share SVG markings, team colors, compact hoop supports, responsive geometry, and light/dark surfaces.
- The card selects the latest relevant event, rather than replacing it with a substitution, timeout, or end-game record. Stable IDs deduplicate events; ordering uses quarter, sequence, and clock. Missing IDs use a deterministic fallback.
- Made twos, made threes, misses, free throws, rebounds, assists, steals, turnovers, blocks, and fouls have event-driven representations. Recorded assists receive labels without invented pass paths. Possession changes crossfade team highlights rather than simulating player movement.
- Valid normalized positions receive exact location markers and pulsing rings. Shot arcs illustrate flight; they are not tracking measurements. Missing positions use a highlighted generic zone with a visible **Illustrative · Location unavailable** caption. Captions remain readable at phone width instead of shrinking with SVG geometry. Rebound positions inherited from a preceding shot are not treated as tracked player movement.
- A latest-event policy keeps one animation, without a backlog. Motion runs on Reanimated shared values. Blur/background cancels animation, duplicate events do not restart it, and system reduced-motion changes are observed and cleaned up. SVG scenes are replaced only when the event ID changes, preventing old native SVG overlays from surviving a new event.
- The game-detail hook cancels obsolete requests, masks data when changing games, ignores older snapshots, and prevents an older HTTP refresh from overwriting a newer socket snapshot.
- Win probability displays actual recorded observations for both teams, current percentages, quarter/OT markers, touch selection, accessible adjustment, and a selected-observation readout. Step paths avoid manufacturing intermediate probability samples. Incoming data fades into the existing graph; missing history shows an explicit empty state.
- Game Flow shows actual scoring margins above/below zero in the leading team's color, quarter/OT boundaries, and selectable score/margin/description details. Neither chart creates a new request or subscription.
- The NBA shot chart uses only backend-normalized positions, skips shots without valid locations, and supports period/overtime filters plus both half courts. Other leagues keep their existing shot chart.

## API addition

The existing NBA REST/live snapshot now optionally includes `score.winProbability`:

```ts
type BasketballWinProbability = {
  playId: string;
  period: number;
  clock: string;
  homeProbability: number; // 0..1
  awayProbability: number; // 0..1
};
```

The mapper joins each observation to an existing play and validates its probability and clock. Unknown plays, malformed values, nonzero tie probabilities, and invalid clocks are skipped. NBA away probability is the complement of the reported home probability when tie probability is zero. Duplicate corrections replace the earlier observation. No artificial opening, closing, or intermediate history is inserted.

The shape was checked against the existing [ESPN summary API for a recorded NBA game](https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=401810829). This is API data inspection, not scraping of website graphics or animation assets. The sample/raw response remains outside the repositories. The frontend continues working against a backend that has not yet shipped this optional field, showing the empty state.

## File inventory

New frontend files:

| Area            | Files                                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Court           | `components/Sports/Basketball/GameDetails/PlayByPlay/BasketballCourt.tsx`                                                                                                           |
| Charts          | `components/Sports/Basketball/GameDetails/Charts/BasketballTimelineChart.tsx`, `BasketballGameCharts.tsx`, `NBAShotChart.tsx`                                                       |
| Hooks           | `hooks/BasketballHooks/useBasketballPlayback.ts`, `useBasketballAnimation.ts`                                                                                                       |
| Geometry/models | `utils/sports/basketball/basketballCourtGeometry.ts`, `basketballEvents.ts`, `basketballCharts.ts`, `basketballAnimationScene.ts`                                                   |
| Types/styles    | `types/basketball/visualizations.ts`, `styles/GameDetailStyles/BasketballVisualizationStyles.ts`                                                                                    |
| Verification    | `tests/basketballVisualizations.test.ts`, `basketballVisualizationLifecycle.test.mjs`, `basketballVisualizationRendering.test.mjs`, `scripts/profile-basketball-visualizations.mjs` |
| Report          | `docs/nba-visualizations.md`                                                                                                                                                        |

Modified frontend files: the NBA game route; `hooks/BasketballHooks/useBasketballGameDetails.ts`; the existing `BasketballPlayCourt.tsx` and `BasketballPlayByPlay.tsx`; `utils/sports/basketball/basketballPlayByPlay.ts`; `components/Sports/Basketball/GameDetails/ShotChart.tsx` and `index.ts`; and `tests/helpers/sportsHookHarness.mjs` (JSX support for component tests). Some of these files were already uncommitted or untracked when work began.

Backend: new `src/modules/sports/basketball/basketballProbability.mapper.ts` and `tests/sports/basketball/basketballProbability.test.ts`; modified `basketballGameDetailsService.ts` and its existing `basketballGameDetails.test.ts`. No database, authentication, or infrastructure changes.

## Performance measurements

On this Mac, a recorded 535-play NBA game produced 127 scoring points and 535 probability observations. After 25 warmups, 200 samples measured ordering/deduplication, both chart transformations, and SVG step-path generation:

| Scenario              |   Median |      P95 |
| --------------------- | -------: | -------: |
| Full game             | 0.570 ms | 1.713 ms |
| Duplicate delivery    | 0.427 ms | 1.089 ms |
| Out-of-order delivery | 0.388 ms | 0.554 ms |

All scenarios retained exactly 535 unique events. Measurements are desktop transformation costs, not native frame-rate or memory guarantees. Run again with a saved **backend-normalized** response:

```sh
node --import tsx scripts/profile-basketball-visualizations.mjs /absolute/path/to/normalized-game.json
```

The sample probability array adds 56,937 JSON bytes before compression. Existing field deltas transmit the field when it changes, rather than introducing another stream. Transformations and paths are memoized by input references, the court surface is memoized, chart touch state is local, and animation progress never sets React screen state. Native event SVG scenes remount once per new ID for correct cleanup; clock-only updates keep their identity.

## Verification and limits

- Frontend regression run: **73 tests passed**, including coordinate transforms, all supported event classifications, missing/incomplete events, clocks, ordering/deduplication, historical selection in the reusable hook, latest-only card behavior, cancellation, reduced-motion changes, stale HTTP/socket updates, chart touch/accessibility interaction, resizing, themes, game-summary regressions, and existing subscription/delta lifecycle tests.
- Backend regression run: **59 tests passed** across basketball snapshot/probability/play mapping and shared realtime/delta behavior. The REST/live contract test confirms that observations are joined and the provider response is cached rather than requested twice.
- Frontend ESLint and backend touched-file ESLint were run. Backend TypeScript passes. Frontend TypeScript still reports the two existing `/team/mcvb/[teamId]` route errors in `ProfileFavoritesSection.tsx` and `useFavoriteTeams.ts`; unrelated code was not changed to silence them.
- Real recorded data was rendered in both themes and at phone width in an isolated component preview. Unit/component tests exercise actual chart interaction handlers.
- The running iPhone 18 Pro Max / iOS 27 simulator was inspected with live updates. It showed the simplified card, correct changes between shot/turnover/rebound scenes, and the probability-history empty state against the currently connected API. A stale native SVG overlay found during this check was addressed with event-scoped scene identity. The backend probability addition has not been deployed by this task.
- Full Expo web preview remains affected by the existing `react-native-pager-view` native-only import error. No Android device runtime or instrumented 60-FPS native profile was completed; those remain explicit device-validation steps.

## Expansion

Before enabling WNBA or college animation/charts, parameterize period lengths and court rules, add backend-normalized positions/probability mappings for those leagues, and test their fixtures. Keep provider-specific orientation on the backend. Connect the reusable playback selection hook to a future replay surface only if wanted; the current card intentionally remains latest-only. For release, ship the backend field with the frontend and profile fast live-event bursts, reduced-motion toggles, and chart drags on representative iOS/Android devices.

## Local runtime follow-up

The connected local backend was still running an older `tsx src/server.ts` process without source watching. Its response contained `coordinate` but omitted `courtPosition` entirely, so the new court correctly treated the normalized location as missing. Restarting that local process with the saved backend source restored the contract without adding provider-specific normalization to the frontend. The recorded sample then returned normalized positions for all 189 field-goal attempts; its other 48 shooting events were free throws without source positions. The iOS app subsequently displayed a real last-shot marker and live probability percentages. This local restart does not deploy a hosted backend.
