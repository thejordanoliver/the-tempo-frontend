import type { LeagueType } from "types/types";

export const BROWSEABLE_LEAGUES = [
  "atp",
  "bundesliga",
  "ligue1",
  "ligue2",
  "laliga",
  "cb",
  "cbb",
  "cfb",
  "champions",
  "epl",
  "europa",
  "f1",
  "fifa",
  "fifaw",
  "gleague",
  "leaguescup",
  "mlb",
  "mls",
  "nascarpremier",
  "nba",
  "nfl",
  "nhl",
  "sb",
  "ufc",
  "ufl",
  "wcbb",
  "wnba",
  "wta",
] as const satisfies readonly LeagueType[];

export type BrowseableLeague = (typeof BROWSEABLE_LEAGUES)[number];
