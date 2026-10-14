# Player screens audit

Reviewed October 14, 2026. This is an audit of the current working tree; no application code was changed by this audit.

## Coverage

Reviewed all seven player screen implementations, the shared routes for Explore/Leagues/Profile, player headers, career tables, season summaries, awards, game/fight logs, relevant fetching hooks, and navigation entry points. Read local backend routes and response types to verify API contracts.

| Screen | Leagues reviewed | Findings |
| --- | --- | --- |
| Basketball | NBA, WNBA, men's/women's college basketball | F02, F04, F11, F13, F15 |
| Football | NFL, college football | F02, F04, F11, F13 |
| Baseball | MLB | F02, F04, F05, F06, F11 |
| Hockey | NHL, including goalies | F02, F03, F04, F07, F09, F14 |
| Soccer | Shared soccer profile and team/competition filters | F08, F10; shared route imports also encounter F02 |
| MMA | MMA/UFC profile, career stats, fight log, latest fight | F02, F12 |
| Racing | Driver entry point and profile route | F01; shared route imports also encounter F02 |

There are **15 actionable findings: two P1 and thirteen P2**. P1 indicates an unusable route/platform flow; P2 indicates incorrect data or degraded recovery/loading behavior. Calculations were checked with synthetic inputs, not production athlete data.

## Findings

### F01 — P1: Racing profiles request football data

Location: [racing screen](/Users/jordanoliver/Projects/the-tempo-frontend/app/(tabs)/(home)/player/racing/[id].tsx:26), [driver navigation](/Users/jordanoliver/Projects/the-tempo-frontend/components/Sports/Racing/GameDetails/DriverRow.tsx:22).

Driver navigation sends only `id`. The racing screen passes its missing `league` to `usePlayerById`, whose default is `nfl`, so tapping a driver requests `/api/roster/nfl/player/<driverId>`. This can display an unrelated football player if IDs overlap, or an error otherwise. Supplying a racing league alone would still fail: the local roster router has no racing player endpoint, and the screen uses the soccer profile header.

Repair: pass the actual racing league and implement a backend-normalized driver profile contract and corresponding UI, or remove the enabled profile link until that contract exists. Keep provider fetching in the backend.

### F02 — P1: The player pager has no web implementation

Location: [PlayerDetailsPager](/Users/jordanoliver/Projects/the-tempo-frontend/components/Player/PlayerDetailsPager.tsx:7).

The shared pager imports `react-native-pager-view` as a runtime dependency on every platform. The installed package imports native `codegenNativeCommands` and has no web entry point. Basketball, football, baseball, hockey, and MMA use this pager. `PlayerRouteScreen` also eagerly imports those screens when resolving other sports in the shared tab routes.

Repair: introduce a platform-specific pager wrapper and a web tab implementation, following the existing `TeamPager`/`TeamDetailScreen` pattern. The full web export currently stops at a separate native pager import in `app/edit-favorites.tsx`; that global blocker must also be repaired before end-to-end web verification is possible.

### F03 — P2: NHL career tables discard goalie statistics

Location: [NHL row mapping](/Users/jordanoliver/Projects/the-tempo-frontend/components/Sports/Hockey/Player/PlayerStatTable.tsx:547).

The table always uses skater columns and maps goals, assists, points, and related skater fields. It never maps goalie wins, saves, save percentage, goals against average, or shutouts. The backend importer stores goalie categories in the season `totals` object, so this data can arrive successfully and still disappear from the screen.

Reproduction: a season with 50 games, 32 wins, 1,400 saves, `.915` save percentage, and `2.40` GAA retains games but drops every supplied goalie metric.

Repair: select the career table schema from player position or available stat categories and preserve goalie-specific fields.

### F04 — P2: Game-log loading is rendered as unavailable data

Location: [empty-data branch](/Users/jordanoliver/Projects/the-tempo-frontend/components/Player/PlayerGameLog.tsx:117), [loading branch](/Users/jordanoliver/Projects/the-tempo-frontend/components/Player/PlayerGameLog.tsx:188).

`usePlayerGameLog` returns `data: null` while fetching and clears data on retry. The component checks `!data` before `loading`, so normal initial loads, season/category changes, and retries show “Game log not available.” The skeleton branch is unreachable during those requests, and the filters disappear even when `filterData` is available.

Repair: handle loading before empty results and keep season/category controls populated from `filterData` while requests are pending.

### F05 — P2: Catchers receive an empty MLB season card

Location: [batting position list](/Users/jordanoliver/Projects/the-tempo-frontend/components/Sports/Baseball/Player/SeasonStatCard.tsx:31).

`BATTING_POSITIONS` omits `C`. An active catcher with valid season data reaches `SeasonStatCardLayout` with an empty `stats` array, producing a season heading and card without any metrics. The same helper produces four metrics for an otherwise identical first baseman.

Repair: include catchers and provide a sensible batting fallback for other valid non-pitching position abbreviations.

### F06 — P2: MLB summary formatting destroys rate precision

Location: [value formatter](/Users/jordanoliver/Projects/the-tempo-frontend/components/Sports/Baseball/Player/SeasonStatCard.tsx:98).

The shared formatter rounds every non-integer value to one decimal place, including values already formatted by the backend. Verified examples: batting average `.287` becomes `0.3`, and ERA `3.25` becomes `3.3`. This makes the summary inaccurate and inconsistent with the career table.

Repair: preserve display strings or format by metric, including three decimal places for batting average and two for ERA.

### F07 — P2: Late NHL season responses can overwrite the current player

Location: [NHL seasons hook](/Users/jordanoliver/Projects/the-tempo-frontend/hooks/HockeyHooks/usePlayerSeasons.ts:118).

The hook has no request cancellation, effect cleanup, request identity, or result identity. When a mounted screen receives a different player ID, an older request can resolve later and replace the new player's seasons and loading/error state. The profile hook protects its own identity, so the resulting screen can pair the current player's header with another player's career table.

Verified with a simulated hook lifecycle: request player 1, update to player 2, resolve player 2, then resolve player 1. The returned seasons change back to player 1 while the hook input remains player 2.

Repair: abort superseded requests and expose results only for the current league/player key, following `usePlayerById` or the basketball seasons hook.

### F08 — P2: Soccer filters and previous results are not scoped to player identity

Location: [soccer screen filter state](/Users/jordanoliver/Projects/the-tempo-frontend/app/(tabs)/(home)/player/soccer/[id].tsx:45), [soccer hook return values](/Users/jordanoliver/Projects/the-tempo-frontend/hooks/SoccerHooks/usePlayerSeasons.ts:408).

When the existing route instance changes player ID, its selected team and competition remain unchanged and are sent for the new player. The hook also returns the previous response until the new request finishes. A new profile can therefore retain another player's filter selection or briefly show their table; invalid carried filters can leave the new player with an empty result.

Repair: scope/reset filters by player ID and gate returned data and filter metadata by the complete request identity. Cancellation already protects response completion, but does not prevent exposing previously stored results.

### F09 — P2: NHL combined shooting percentage uses games as the denominator

Location: [percentage aggregation](/Users/jordanoliver/Projects/the-tempo-frontend/components/Sports/Hockey/Player/PlayerStatTable.tsx:642).

Combined-season and career shooting percentages are weighted by games played. Shooting percentage must be calculated from total goals divided by total shots. Verified example: 1 goal on 10 shots and 9 goals on 30 shots, across equal numbers of games, yields `20%` here instead of `25%`.

Repair: retain shot totals and calculate the combined rate from its numerator and denominator; use unavailable data when the necessary totals are missing.

### F10 — P2: Soccer career totals sum numeric rate fields

Location: [career aggregation](/Users/jordanoliver/Projects/the-tempo-frontend/components/Sports/Soccer/Player/PlayerStatTable.tsx:304).

Every numeric column is summed without distinguishing counting metrics from percentages, averages, or ratios. The response contract accepts arbitrary numeric stats. For a numeric save-percentage field, `.8` and `.9` become a career value of `1.7`. This reproduction uses a contract-valid synthetic rate field; a production soccer response was not fetched.

Repair: sum only counting metrics and compute rates from their totals, or leave the career rate unavailable when sufficient information is absent.

### F11 — P2: Season summaries choose an arbitrary team stint

Location: [basketball summary selection](/Users/jordanoliver/Projects/the-tempo-frontend/components/Sports/Basketball/Player/SeasonStatCard.tsx:47), [baseball selection](/Users/jordanoliver/Projects/the-tempo-frontend/app/(tabs)/(home)/player/baseball/[id].tsx:54), [football selection](/Users/jordanoliver/Projects/the-tempo-frontend/app/(tabs)/(home)/player/football/[id].tsx:60).

After sorting by season, these selectors break ties with lexicographic team ID and choose one row. They do not identify a full-season aggregate or combine individual stints. Traded players can therefore have a card labeled as their season summary that represents only one team. Verified basketball example: 20 PPG across 10 games and 30 PPG across 30 games displays `20`, although the full-season average is `27.5`.

Repair: prefer an explicit combined row or aggregate disjoint stints with the correct weighting and season type. Basketball's career table already handles split seasons separately.

### F12 — P2: MMA profile errors remove the visible Back action

Location: [MMA header effect](/Users/jordanoliver/Projects/the-tempo-frontend/app/(tabs)/(home)/player/mma/[id].tsx:35).

The header becomes `null` whenever loading is true or `player` is absent. On a failed profile request, `player` remains absent, so the screen permanently displays an error without its visible Back button. There is also no profile retry action. Native hardware back or navigation gestures may still work, but the visible recovery controls are gone.

Repair: render the header with fallback branding during loading/errors and provide a retry for the profile request.

### F13 — P2: Pro basketball/football stats failures hide otherwise usable profiles

Location: [basketball top-level error branch](/Users/jordanoliver/Projects/the-tempo-frontend/app/(tabs)/(home)/player/basketball/[id].tsx:206), [football error branch](/Users/jordanoliver/Projects/the-tempo-frontend/app/(tabs)/(home)/player/football/[id].tsx:338).

For direct NBA/WNBA/NFL requests, the player ID and league are already known and the roster profile can load independently. Nevertheless, a seasons error replaces the entire screen, hiding the loaded profile, awards, game log, and team game. Waiting for seasons also delays all of those features. The stat components' own error and skeleton states cannot be reached through these top-level branches.

Repair: retain canonical-resolution gating where needed for college requests, but contain stat loading/errors within the affected section once profile identity is known. Offer stat retry without requiring users to leave and reopen the screen.

### F14 — P2: NHL shots can be displayed as shootout goals

Location: [NHL fallback mapping](/Users/jordanoliver/Projects/the-tempo-frontend/components/Sports/Hockey/Player/PlayerStatTable.tsx:553).

The `shootoutGoals` field falls back to `shotsOnGoal` and `shotsTotal`. These are distinct metrics. If shootout goals are absent, regular shots appear in a column whose glossary describes “Shootout Goals”; if shootout goals are present as zero, actual shot totals are ignored instead.

Repair: model shots and shootout goals separately and give each its own column/glossary definition.

### F15 — P2: Basketball's FG ranking measures a different stat from its value

Location: [FG summary item](/Users/jordanoliver/Projects/the-tempo-frontend/components/Sports/Basketball/Player/SeasonStatCard.tsx:172), [backend ranking definition](/Users/jordanoliver/Projects/the-tempo-backend/src/modules/sports/stats/playerSeasonRankings.ts:53).

The summary attaches `rankings.FG` to made/attempted field goals per game. The backend defines that ranking from `fieldGoalPct`. The displayed rank therefore describes shooting efficiency while the displayed value describes field-goal volume, without identifying the distinction.

Repair: display FG% with the percentage ranking, or request a separate ranking for the made/attempted metric.

## Verification and limits

- `npm run lint`: passes.
- `node --import tsx --test tests/playerGameLog.test.ts tests/playerGameLogFilters.test.ts tests/playerClosestGame.test.ts tests/mmaFightLog.test.ts tests/tabStackRouteCoverage.test.ts`: 23/23 pass. These cover utility behavior and route coverage, not rendering or request lifecycle regressions.
- `npx tsc --noEmit`: fails with 21 errors in other files, including preview components used by player screens. There are no diagnostics in the player route files or player component directory. The full compiler output is saved in `/tmp/tempo-player-audit-tsc-final.txt`.
- `npx expo export --platform web --output-dir /tmp/tempo-player-audit-web`: fails on the native-only pager import in `app/edit-favorites.tsx`. Output is saved in `/tmp/tempo-player-audit-web.txt`.
- Source helper checks reproduced MLB formatting/catcher behavior, NHL goalie mapping and percentage aggregation, soccer numeric-rate aggregation, and basketball split-season selection. A simulated hook lifecycle reproduced the NHL stale-response overwrite.
- Active player fetching uses the canonical `apiClient`; no direct provider fetch was found in the reviewed player screen flows.
- No simulator/device visual QA or production API sampling was completed. Pager height, horizontal scrolling gestures, text scaling, and real-device Back behavior still need runtime verification.
- Basketball and football source files changed externally during this audit. The earlier football canonical-league mismatch was fixed in the latest source and is excluded from the outstanding findings. The audit did not make that fix.
