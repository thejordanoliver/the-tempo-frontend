# Render optimization: Phase 0 and Phase 1A

Implemented against the existing uncommitted frontend/backend working trees. Existing changes were preserved using pre-edit source snapshots for comparison. No database migration, deployment, service-plan change, worker, dependency, polling-interval change, notification-timing change, or stats-sync change was made.

## Home eligibility

Home continues to invoke every hook in a stable order. Network work and live subscriptions are eligible only for the selected Scores experience:

- General Home, including loaded empty favorites: all 26 existing league feeds.
- Personalized Home: the union of supported favorite-team and favorite-sport leagues, deduplicated.
- For You: no Home scoreboard requests or subscriptions; the separate feed remains unchanged.
- Unresolved account preferences: wait before choosing general versus personalized coverage. A completed preference error uses retained preferences, or general coverage if none exist.
- Legacy `socc:<id>` favorites do not identify a competition. They conservatively retain the 12 existing soccer competition feeds rather than guessing a single competition and losing coverage. Unsupported Home leagues do not cause unrelated requests or a permanent loader.

The positional sports hooks accept an optional fourth `{ enabled, scopeKey }` argument. Football and MMA retain their options objects, adding optional `scopeKey`. Existing screens default to enabled behavior.

A small shared request-scope hook handles cancellation and identity checks for seven scoreboards. Volleyball extends its existing request-generation mechanism. Retained same-identity data remains available while paused and during revalidation. Data from another account/date/league is masked immediately. Obsolete responses, callbacks, and HTTP responses superseded by live updates cannot overwrite current results. Cancellation is passed to the canonical API client, preserving its authentication behavior.

Pull-to-refresh refreshes preferences alongside eligible feeds. Disabled refresh functions perform no HTTP work. Resetting the selected date uses each eligible hook's automatic date request instead of issuing a second manual refresh. Refresh snapshots are account/league scoped. General Home's existing upcoming-date search remains intact.

## Operational metrics

`GET /api/health/performance` is disabled unless the backend has a separately provisioned, randomly generated `PERFORMANCE_METRICS_TOKEN` of at least 32 characters. Requests must supply that credential as a Bearer token. Missing, malformed, incorrect, and disabled credentials receive 404. Normal user access tokens do not grant access. The response is `Cache-Control: no-store` and performs no database query. No operational credential was provisioned by this implementation.

The existing public health response remains unchanged. New metrics are not attached to it.

Metrics contain fixed aggregate counters only, with saturating numeric totals. They retain no URL, query string, header, user/game ID, raw payload, request history, or per-key cache series. There are no new production logs or timers.

- ESPN: Axios attempts started/completed/failed, cumulative/mean/maximum duration, current and peak concurrency. Includes existing default Axios calls and the shared HTTP client. Failures include cancellations; durations span the Axios request/response lifecycle. Counts are logical Axios attempts, not individual redirect hops. Requests to other providers are excluded.
- Live pollers: current and peak manager-owned poller counts. Identical subscriptions still share a poller and existing cleanup/completion behavior is preserved.
- Sports Socket.IO: broadcast count and local subscriber-delivery count, separated into game and scoreboard aggregates. UTF-8 JSON envelope sizes are sampled on the first and every sixteenth subsequent broadcast. Sample totals/maxima are not a complete wire-byte measurement; they exclude framing, TLS, compression, and remote Redis-adapter recipients. Other Socket.IO namespaces are not sampled.
- Existing caches: hit/miss counters for shared memory, Redis HTTP middleware, calendar, team news, game/fight logs, widgets, season leaders, player rankings, search, venues, current-season metadata, social, and draft caches. Bypasses/errors/stale fallbacks are recorded where those branches exist. Cache policies and responses are unchanged. These are lookup counters; a miss can subsequently join an existing in-flight request.
- Memory: current RSS, used/total V8 heap, external memory and ArrayBuffer bytes, read only when the authenticated snapshot is requested.

Counters are per process and reset on restart. Compare snapshots with the same `startedAt` to derive rates. Memory snapshots are observations, not retained peak-memory measurements. Any future new Axios instance must opt into `instrumentEspnRequests`; the current serving source has only default Axios and the shared client. This instrumentation does not add fetch sharing or caching.

## Measurements

The preserved pre-edit Home source and the updated source were run through an isolated hook harness, with HTTP adapters mocked and the same loaded preferences:

| Scenario                           |           Before | After |
| ---------------------------------- | ---------------: | ----: |
| General Home Scores                |               26 |    26 |
| Personalized Scores: NBA, NFL, ATP |               26 |     3 |
| For You: Home scoreboard hooks     |               26 |     0 |
| One NBA favorite team              | 26-hook baseline |     1 |

The three-league scenario removes 23 of 26 initial Home league requests (88.5%). These are measured frontend-to-backend request counts in a controlled harness, **not measured production ESPN calls**. One backend request can make multiple ESPN calls or use a cache. No deployed ESPN reduction, transferred-byte saving, RSS saving, or 512 MB capacity claim is established. Client cancellation also does not guarantee cancellation of ESPN work already running on the backend. The new authenticated metrics allow those measurements after a separately reviewed deployment.

## Verification

- Frontend: 141 focused/regression tests passed. Coverage includes all eight sports hooks, general/personalized/loading/error/empty preferences, tab changes, retained results, account/date isolation, duplicate-rerender avoidance, refresh, cancellation, obsolete callbacks, live updates, existing calendar behavior, focus cleanup, and sports-socket background/foreground reconnection.
- The optional baseline harness also verified the original 26-request behavior using the preserved pre-edit source.
- Backend instrumentation/health/realtime tests: 37 passed, including disabled/unauthorized diagnostics, unchanged public health and socket envelopes, real Axios interceptors with in-memory adapters, concurrent/error/cancellation accounting, fixed metric shape, cache expiry, sampling, and poller cleanup.
- Broader backend regression run: 941 passed, 22 failed across six suites. The pre-edit snapshot under the same isolated environment has the identical 22 failures (933 passed). A pre-existing draft-cache interval requires `--forceExit` for this broad selection; it was not changed in this phase.
- Backend lint and TypeScript pass. The optional architecture check reports the pre-existing `src/infrastructure/buildInfo.ts` import of `../../package.json`; the pre-edit snapshot produces the same failure. Both repositories pass `git diff --check`.
- Frontend lint: no errors; two pre-existing unused-variable warnings in `components/Sports/Volleyball/VolleyballGamesList.tsx`.
- Frontend TypeScript: two pre-existing generated-route compatibility errors in `components/Favorites/ProfileFavoritesSection.tsx:293` and `hooks/UserHooks/useFavoriteTeams.ts:522` involving volleyball team routes. A compiler run using pre-edit source contents confirms the same two diagnostics.
- No device/simulator runtime test or deployed Render load test was performed.

The six existing backend failure suites are `standingsRoute`, `soccer/teamScheduleScoreFallbacks`, `stats/seasonLeaders`, `news/teamNewsRoute`, `teams/rosterPresentation`, and `teams/rosterRoutes`. They concern existing response/fixture differences; this phase leaves them unchanged.

Useful commands:

```sh
node --test tests/homeRequestEligibility.test.mjs tests/sportsRequestEligibility.test.mjs tests/homeRefresh.test.mjs tests/homeGames.test.mjs tests/liveSportsSubscription.test.mjs tests/liveSportsLifecycle.test.mjs tests/volleyballHooks.test.mjs tests/collegeBasketballGames.test.mjs tests/collegeFootballWeek.test.mjs tests/scoreboardCalendar.test.mjs
npm run lint
npx tsc --noEmit
```

Backend:

```sh
npm test -- --runInBand tests/infrastructure/performanceMetrics.test.ts tests/infrastructure/healthRoute.test.ts tests/realtime/liveSportsManager.test.ts
npm run typecheck
npm run lint
```

For broad unit/route regression tests, isolate database/Redis configuration from production. Some existing suites import the database module without mocking it, even when their exercised paths use fixtures. The comparison used an intentionally unreachable local database and disabled Redis. HTTP route tests require temporary local listeners.

## Modified files

Frontend implementation:

- `hooks/useHomeData.ts`
- `utils/games/homeGames.ts`
- `hooks/Sports/useSportsRequestScope.ts` (new)
- `hooks/BaseballHooks/useBaseballGames.ts`
- `hooks/BasketballHooks/useBasketballGames.ts`
- `hooks/FootballHooks/useFootballGames.ts`
- `hooks/HockeyHooks/useHockeyGames.ts`
- `hooks/MMAHooks/useMMAEvents.ts`
- `hooks/SoccerHooks/useSoccerGames.ts`
- `hooks/TennisHooks/useTennisMatches.ts`
- `hooks/VolleyballHooks/useVolleyball.ts`

Frontend verification/documentation:

- `tests/collegeBasketballGames.test.mjs`
- `tests/homeRefresh.test.mjs`
- `tests/helpers/sportsHookHarness.mjs` (new)
- `tests/homeRequestEligibility.test.mjs` (new)
- `tests/sportsRequestEligibility.test.mjs` (new)
- `tests/liveSportsLifecycle.test.mjs` (new)
- `docs/render-optimization-phase01.md` (this report)

Backend implementation:

- `.env.example`
- `src/app.ts`
- `src/infrastructure/performanceMetrics.ts` (new)
- `src/infrastructure/httpClient.ts`
- `src/infrastructure/cache.ts`
- `src/infrastructure/http/cache.ts`
- `src/infrastructure/http/health.routes.ts`
- `src/realtime/liveSportsManager.ts`
- `src/modules/explore/explore.routes.ts`
- `src/modules/explore/exploreWidgetsService.ts`
- `src/modules/news/teamNewsService.ts`
- `src/modules/social/social.routes.ts`
- `src/modules/sports/calendar/calendarCacheService.ts`
- `src/modules/sports/helpers/currentSeason.ts`
- `src/modules/sports/leagueDrafts.routes.ts`
- `src/modules/sports/mma/fightLog/mmaFightLog.service.ts`
- `src/modules/sports/stats/gameLog/playerGameLog.service.ts`
- `src/modules/sports/stats/playerSeasonRankings.ts`
- `src/modules/sports/stats/seasonLeaders.routes.ts`
- `src/modules/venues/venues.repository.ts`

Backend verification:

- `tests/infrastructure/healthRoute.test.ts`
- `tests/infrastructure/performanceMetrics.test.ts` (new)
- `tests/realtime/liveSportsManager.test.ts`

## Phase 1B readiness

Shared ESPN fetch caching remains unimplemented and requires review. The call counters, concurrency measurements, existing-cache outcomes, and payload samples provide a baseline for it. It can proceed as a separately approved, resource-by-resource change with freshness and notification regression tests. Production memory/bandwidth and endpoint access still need deployment-time verification before changing instance sizing.
