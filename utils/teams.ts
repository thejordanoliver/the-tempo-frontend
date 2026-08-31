import { wcbbTeams } from "@/constants/teamsWCBB";
import { teams } from "constants/teams";
import { cbTeams } from "constants/teamsCB";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { sbTeams } from "constants/teamsSB";
import { wnbaTeams } from "constants/teamsWNBA";
import { Team, LeagueType } from "types/types";

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
}: Config<T>): Team[] {
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
    case "nba":
      return "/team/[teamId]";
    case "wnba":
      return "/team/wnba/[teamId]";
    case "nfl":
      return "/team/nfl/[teamId]";
    case "cfb":
      return "/team/cfb/[teamId]";
    case "cbb":
      return "/team/cbb/[teamId]";
    case "wcbb":
      return "/team/wcbb/[teamId]";
    case "mlb":
      return "/team/mlb/[teamId]";
    case "cb":
      return "/team/cb/[teamId]";
    case "sb":
      return "/team/sb/[teamId]";
    case "nhl":
      return "/team/nhl/[teamId]";
    case "ufc":
      return "/player/mma/[id]";
    default:
      throw new Error(`Invalid league: ${league}`);
  }
}

const staticFavoriteTeamsList = [
  ...buildLeagueTeams({
    teams,
    league: "nba",
    sportTerms: "NBA basketball",
  }),

  ...buildLeagueTeams({
    teams: wnbaTeams,
    league: "wnba",
    sportTerms: "WNBA women's basketball",
  }),

  ...buildLeagueTeams({
    teams: nflTeams,
    league: "nfl",
    sportTerms: "NFL football",
  }),

  ...buildLeagueTeams({
    teams: mlbTeams,
    league: "mlb",
    sportTerms: "MLB baseball",
  }),

  ...buildLeagueTeams({
    teams: cbTeams,
    league: "cb",
    sportTerms: "college baseball NCAA",
  }),

  ...buildLeagueTeams({
    teams: sbTeams,
    league: "sb",
    sportTerms: "college softball NCAA",
  }),

  ...buildLeagueTeams({
    teams: nhlTeams,
    league: "nhl",
    sportTerms: "NHL hockey",
  }),

  ...buildLeagueTeams({
    teams: cfbTeams,
    league: "cfb",
    sportTerms: "CFB college football NCAA",
  }),

  ...buildLeagueTeams({
    teams: cbbTeams,
    league: "cbb",
    sportTerms: "CBB college basketball NCAA",
  }),
  ...buildLeagueTeams({
    teams: wcbbTeams,
    league: "wcbb",
    sportTerms: "WCBB college basketball NCAA",
  }),
];

export function getFavoriteTeamsList(): Team[] {
  return [...staticFavoriteTeamsList].sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.fullName ?? b.name ?? "")),
  );
}

export const favoriteTeamsList = getFavoriteTeamsList();
