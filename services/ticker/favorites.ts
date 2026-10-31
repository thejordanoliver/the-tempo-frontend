import type {
  SupportedTickerLeague,
  TickerFavoriteTeam,
} from "../../types/ticker";

// Stable wire identifiers, shared with firmware/Leagues.h.
export const FAVORITE_LEAGUES: SupportedTickerLeague[] = [
  "nba",
  "nfl",
  "cfb",
  "mlb",
  "mcbb",
  "wnba",
  "wcbb",
];
export const MAX_TICKER_FAVORITES = 50;

export function tickerFavoriteTeams(
  keys: readonly string[],
): TickerFavoriteTeam[] {
  const teams: TickerFavoriteTeam[] = [];
  const seen = new Set<string>();
  for (const key of keys) {
    const match = /^([a-z]+):(\d+)$/.exec(key);
    if (!match || !FAVORITE_LEAGUES.includes(match[1] as SupportedTickerLeague))
      continue;
    const teamId = Number(match[2]);
    if (!Number.isInteger(teamId) || teamId < 1 || teamId > 0xffffff) continue;
    const canonical = `${match[1]}:${teamId}`;
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    teams.push({ league: match[1] as SupportedTickerLeague, teamId });
  }
  return teams;
}

export function favoriteTeamsSignature(
  teams: readonly TickerFavoriteTeam[],
): number {
  if (!teams.length || teams.length > MAX_TICKER_FAVORITES)
    throw new Error(
      "Add 1–50 supported favorite teams in Tempo before enabling Favorites.",
    );
  let hash = 2166136261;
  const add = (byte: number) => {
    hash = Math.imul(hash ^ byte, 16777619) >>> 0;
  };
  add(teams.length);
  const seen = new Set<string>();
  for (const team of teams) {
    const league = FAVORITE_LEAGUES.indexOf(team.league) + 1;
    const key = `${league}:${team.teamId}`;
    if (
      !league ||
      !Number.isInteger(team.teamId) ||
      team.teamId < 1 ||
      team.teamId > 0xffffff ||
      seen.has(key)
    )
      throw new Error(
        "Favorite teams must have unique, valid league and team IDs.",
      );
    seen.add(key);
    add(league);
    add(team.teamId & 255);
    add((team.teamId >> 8) & 255);
    add((team.teamId >> 16) & 255);
  }
  return hash & 0xffffff || 1;
}
