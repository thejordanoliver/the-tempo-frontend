# Universal playoff bracket

The NBA, WNBA, MLB, NFL, and NHL league screens include a Playoffs tab. Each lazily mounts the same `LeaguePlayoffs` container, which fetches only normalized backend data through `apiClient`.

For a ready-to-use league view:

```tsx
import LeaguePlayoffs from "components/League/Playoffs/LeaguePlayoffs";

<LeaguePlayoffs league="nhl" active={selectedTab === "playoffs"} />;
```

For a presentational bracket with data supplied by a parent:

```tsx
import PlayoffBracket from "components/League/Playoffs/PlayoffBracket";

<PlayoffBracket
  data={bracket}
  onTeamPress={openTeam}
  onMatchupPress={openMatchup}
/>;
```

Types live in `types/playoffs.ts`. `PlayoffBracket` renders ordered rounds and explicit `nextSeriesId` connections. It supports TBD team slots, unknown logos, NFL bye cards, winner highlighting, light/dark logos, and accessibility labels. NFL cards show game points; other sports show series wins. Team navigation uses Tempo IDs, never provider IDs. Callbacks are optional; the presentation component owns no network logic.

The league container adds a season picker, pull to refresh, loading skeletons and team navigation. Requests are canceled on season/league changes, unmount, or inactivity. Unfinished brackets refresh every 30 seconds only while the screen and Playoffs tab are active. Bracket swipes stay within the board rather than changing league tabs.

Season values follow the backend providers: NBA uses the starting year (2025 → 2025–26), NHL the ending year (2026 → 2025–26), NFL the football season year, MLB the calendar year. The NBA and NFL defaults select the most recent playoff season rather than an upcoming season's bracket. The picker includes the most recent 20 seasons. Empty seasons and unavailable provider responses display feedback in the view.

Verification:

```sh
node --import tsx --test tests/playoffBracketLayout.test.ts
npx playwright test tests/e2e/playoffs.spec.ts
npm run lint
npx tsc --noEmit
```

The browser tests use synthetic account/API data and the standard exported-web preview configured in `playwright.config.ts`.

## Reading the implementation

- `PlayoffBracket.tsx` composes the board, round headings, connections, and cards.
- `BracketMatchupCard.tsx` renders a matchup or bye and its footer.
- `BracketTeamRow.tsx` handles a team row, its logo fallback, and team selection.
- `BracketConnections.tsx` draws the lines between linked cards.
- `utils/playoffs/bracketLayout.ts` creates columns, connects adjacent rounds, then positions cards.
- `utils/playoffs/bracketPresentation.ts` supplies score values, code labels, accessibility descriptions, and status text.

The layout dimensions and data contracts are unchanged by this separation.

`PlayoffBracketSkeleton.tsx` uses the shared skeleton primitives to preview the four connected rounds, including NFL bye cards. Its decorative geometry lives in `bracketSkeletonLayout.ts`; it uses the same card dimensions as the loaded bracket and respects reduced-motion preferences through the skeleton primitives.

## Undecided playoffs

Empty current or upcoming seasons render permanent TBD cards with the team's placeholder logo instead of an empty-state message. `placeholderBracket.ts` defines each league's rounds, formats, conference slots, connections, and first-round byes (MLB and NFL). These are schematic placeholders, not predictions; NFL pairings remain subject to reseeding. Any real backend matchup data takes precedence. Historical empty seasons retain the empty-state message.

The season picker includes next year. If a current or upcoming year's provider request fails, a placeholder bracket still appears without an error banner. Pull to refresh to load pairings when available.

## Two-sided layout

Conference/league branches face inward: AL/AFC/East on the left, NL/NFC/West on the right, with the championship centered between them. Known advancement links identify branch membership when a reference has no conference label, including bye teams. Unknown unlinked slots split evenly between sides.

Each branch is positioned independently and vertically centered. Right-side connectors leave the left edge of their cards and enter the right edge of the next matchup. Round headings are centered over each column and repeated on both sides; the championship heading appears once. Skeletons share the league templates and layout function with the loaded bracket.

## WNBA

WNBA has a Playoffs tab using the same two-sided bracket, centered Finals, loading skeleton, and TBD templates. Its seeded format uses three rounds (four First Round series, two Semifinals, one Finals) without East/West labels. The season picker supports 2022 onward, matching the backend's supported seeded format. WNBA uses calendar-year labels, and team links use `/team/wnba/[teamId]` with canonical Tempo IDs.

WNBA team enrichment is supplied by the backend using `wnba_teams.alt_id`. The frontend consumes `alt_id`, `code`, names, and logo URLs directly from that response. The local WNBA catalog also includes the official provider IDs; guest and all-star teams have null provider IDs. Team navigation and favorites continue to use canonical Tempo `id` values.
