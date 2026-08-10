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
    case "CB":
      return "/team/cb/[teamId]";
    case "SB":
      return "/team/sb/[teamId]";
    case "NHL":
      return "/team/nhl/[teamId]";
    case "UFC":
      return "/player/mma/[id]";
    default:
      throw new Error(`Invalid league: ${league}`);
  }
}

const staticFavoriteTeamsList = [
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
    teams: cbTeams,
    league: "CB",
    sportTerms: "college baseball NCAA",
  }),

  ...buildLeagueTeams({
    teams: sbTeams,
    league: "SB",
    sportTerms: "college softball NCAA",
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
  ...buildLeagueTeams({
    teams: wcbbTeams,
    league: "WCBB",
    sportTerms: "WCBB college basketball NCAA",
  }),
];

export function getFavoriteTeamsList(): Team[] {
  return [...staticFavoriteTeamsList].sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.fullName ?? b.name ?? "")),
  );
}

export const favoriteTeamsList = getFavoriteTeamsList();
