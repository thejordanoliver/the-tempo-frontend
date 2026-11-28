import type { PlayoffLeague } from "types/playoffs";

export const PLAYOFF_ENDPOINTS: Record<PlayoffLeague, string> = {
  mlb: "/api/games/baseball/playoffs",
  nba: "/api/games/basketball/nba/playoffs",
  wnba: "/api/games/basketball/wnba/playoffs",
  nfl: "/api/games/football/nfl/playoffs",
  nhl: "/api/games/hockey/nhl/playoffs",
};

/** Most recent playoff year; NBA's provider uses the season starting year. */
export function getDefaultPlayoffSeason(
  league: PlayoffLeague,
  date = new Date(),
) {
  const year = date.getUTCFullYear();
  if (league === "nba" || league === "nfl") return year - 1;
  if (league === "wnba") return year - (date.getUTCMonth() < 3 ? 1 : 0);
  return year;
}
export function getPlayoffSeasonLabel(league: PlayoffLeague, season: number) {
  if (league === "nba") return `${season}–${String(season + 1).slice(-2)}`;
  if (league === "nhl") return `${season - 1}–${String(season).slice(-2)}`;
  return String(season);
}
