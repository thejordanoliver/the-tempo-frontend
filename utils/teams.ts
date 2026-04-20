import { teams } from "constants/teams";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { wnbaTeams } from "constants/teamsWNBA";
import { LeagueTeam, LeagueType } from "types/types";

type Config<T> = {
  teams: T[];
  league: LeagueType;
  sportTerms: string;
  getId?: (t: any) => string | number;
  extraFilter?: (t: any) => boolean;
};

export function buildLeagueTeams<T>({
  teams,
  league,
  sportTerms,
  getId,
  extraFilter,
}: Config<T>): LeagueTeam[] {
  return teams
    .filter(
      (t: any) =>
        !t.isAllStar &&
        t.isActive !== false &&
        (extraFilter ? extraFilter(t) : true),
    )
    .map((t: any) => ({
      ...t,
      league,
      id: String(getId ? getId(t) : t.id),
      isAllStar: t.isAllStar ?? false,
      isActive: t.isActive ?? false,
      searchTerms: `${t.name} ${t.fullName ?? ""} ${sportTerms}`,
    }));
}

export function getTeamRoute(league: LeagueType): string {
  switch (league) {
    case "NBA":
      return "/team/[teamId]";
    case "WNBA":
      return "/team/wnba/[teamId]";
    case "NFL":
      return "/team/nfl/[teamId]";
    case "CFB":
      return "/team/cfb/[teamId]";
    case "CBB":
      return "/team/cbb/[teamId]";
    case "WCBB":
      return "/team/wcbb/[teamId]";
    case "MLB":
      return "/team/mlb/[teamId]";
    case "NHL":
      return "/team/nhl/[teamId]";
    case "MMA":
      return "/player/mma/[id]";
    default:
      throw new Error(`Invalid league: ${league}`);
  }
}

export const favoriteTeamsList = [
  ...buildLeagueTeams({
    teams,
    league: "NBA",
    sportTerms: "NBA basketball",
  }),

  ...buildLeagueTeams({
    teams: wnbaTeams,
    league: "WNBA",
    sportTerms: "WNBA women's basketball",
  }),

  ...buildLeagueTeams({
    teams: nflTeams,
    league: "NFL",
    sportTerms: "NFL football",
  }),

  ...buildLeagueTeams({
    teams: mlbTeams,
    league: "MLB",
    sportTerms: "MLB baseball",
  }),

  ...buildLeagueTeams({
    teams: nhlTeams,
    league: "NHL",
    sportTerms: "NHL hockey",
  }),

  ...buildLeagueTeams({
    teams: cfbTeams,
    league: "CFB",
    sportTerms: "CFB college football NCAA",
  }),

  ...buildLeagueTeams({
    teams: cbbTeams,
    league: "CBB",
    sportTerms: "CBB college basketball NCAA",
  }),

  // WCBB special case
  ...buildLeagueTeams({
    teams: cbbTeams,
    league: "WCBB",
    sportTerms: "WCBB women's college basketball NCAA",
    getId: (t) => t.wid,
    extraFilter: (t) => t.wid != null,
  }),
].sort((a, b) => a.name.localeCompare(b.fullName ?? ""));
