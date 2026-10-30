import { teams } from "constants/teams";
import { nflTeams } from "constants/teamsNFL";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { mcbbTeams } from "constants/teamsMCBB";
import { wnbaTeams } from "constants/teamsWNBA";
import { wcbbTeams } from "constants/teamsWCBB";
import type { Team } from "types/team";
import type { SupportedTickerLeague } from "types/ticker";

export const TICKER_TEAMS: Record<SupportedTickerLeague, Team[]> = {
  nba: teams,
  nfl: nflTeams,
  cfb: cfbTeams,
  mlb: mlbTeams,
  mcbb: mcbbTeams,
  wnba: wnbaTeams,
  wcbb: wcbbTeams,
};
