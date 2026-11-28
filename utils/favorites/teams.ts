import { wcbbTeams } from "@/constants/teamsWCBB";
import { teams } from "constants/teams";
import { cbTeams } from "constants/teamsCB";
import { mcbbTeams } from "constants/teamsMCBB";
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
        t.isActive === true &&
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
    teams: mcbbTeams,
    league: "mcbb",
    sportTerms: "MCBB college basketball NCAA",
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
