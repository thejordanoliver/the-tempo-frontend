import type { HomeLeagueId, MY_TEAMS_SECTION_ID } from "constants/leagues";
import type { MMAFight } from "hooks/MMAHooks/useMMAEvents";

import type { BaseballGame } from "./baseball/baseball";
import type { BasketballGame } from "./basketball/basketball";
import type { FootballGame } from "./football/football";
import type { HockeyGame } from "./hockey/hockey";
import type { SoccerGame } from "./soccer/soccer";
import type { TennisMatch } from "./tennis/tennis";

import type { VolleyballGame } from "./volleyball/volleyball";

/** Backend sort key: compare values descending in order, after game status. */
export type MatchupPriority = readonly [number, number, number, number];

export type LeagueGame = (
  | VolleyballGame
  | BasketballGame
  | FootballGame
  | BaseballGame
  | HockeyGame
  | SoccerGame
  | TennisMatch
  | MMAFight
) & { matchupPriority?: MatchupPriority | null };

export type HomeLeagueSource = {
  id: HomeLeagueId;
  games: readonly LeagueGame[];
};

export type HomeGameItem = {
  key: string;
  league: HomeLeagueId;
  game: LeagueGame;
};

export type HomeGameSection = {
  id:
    | HomeLeagueId
    | typeof MY_TEAMS_SECTION_ID
    | "general-live"
    | "general-upcoming"
    | "general-final";
  title: string;
  data: HomeGameItem[];
};
