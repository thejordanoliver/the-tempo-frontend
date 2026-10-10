import { resolveSoccerTeamLeague } from "./soccerTeamLeague";
import { getUserProfileParams } from "utils/userProfileNavigation";
import type { ResultItem, SearchAffiliation } from "types/explore";

export type ExploreRoute =
  | string
  | {
      pathname: string;
      params: Record<string, string | number>;
    };

type TeamLeagueRoute = {
  flag: keyof Extract<ResultItem, { type: "team" }>;
  teamType: string;
};

type PlayerLeagueRoute = {
  flag: keyof Extract<ResultItem, { type: "player" }>;
  sport: string;
  league: string;
};

const TEAM_LEAGUE_ROUTES: TeamLeagueRoute[] = [
  { flag: "isNFL", teamType: "nfl" },
  { flag: "isGLEAGUE", teamType: "gleague" },
  { flag: "isMLB", teamType: "mlb" },
  { flag: "isCB", teamType: "cb" },
  { flag: "isSB", teamType: "sb" },
  { flag: "isWNBA", teamType: "wnba" },
  { flag: "isNHL", teamType: "nhl" },
  { flag: "isCFB", teamType: "cfb" },
  { flag: "isMCBB", teamType: "mcbb" },
  {
    flag: "isSOCC",
    teamType: "soccer",
  },
  { flag: "isWCBB", teamType: "wcbb" },
];

const PLAYER_LEAGUE_ROUTES: PlayerLeagueRoute[] = [
  {
    flag: "isNFL",
    sport: "football",
    league: "nfl",
  },
  {
    flag: "isCFB",
    sport: "football",
    league: "cfb",
  },
  {
    flag: "isMMA",
    sport: "mma",
    league: "mma",
  },
  {
    flag: "isMLB",
    sport: "baseball",
    league: "mla",
  },
  {
    flag: "isNHL",
    sport: "hockey",
    league: "nhl",
  },
  {
    flag: "isNBA",
    sport: "basketball",
    league: "nba",
  },
  {
    flag: "isGLEAGUE",
    sport: "basketball",
    league: "gleague",
  },
  {
    flag: "isMCBB",
    sport: "basketball",
    league: "mcbb",
  },
  {
    flag: "isWCBB",
    sport: "basketball",
    league: "wcbb",
  },
  {
    flag: "isWNBA",
    sport: "basketball",
    league: "wnba",
  },
  {
    flag: "isSOCC",
    sport: "soccer",
    league: "socc",
  },
];

const PLAYER_SPORT_BY_AFFILIATION: Record<SearchAffiliation, string> = {
  nba: "basketball",
  gleague: "basketball",
  wnba: "basketball",
  mcbb: "basketball",
  wcbb: "basketball",
  mlb: "baseball",
  cb: "baseball",
  sb: "baseball",
  nfl: "football",
  cfb: "football",
  nhl: "hockey",
  mma: "mma",
  soccer: "soccer",
};

export function getExploreRouteForResult(
  item: ResultItem,
): ExploreRoute {
  if (item.type === "user") {
    return {
      pathname: "/(tabs)/(explore)/user/[id]",
      params: getUserProfileParams(item.id, item),
    };
  }

  if (item.type === "team") {
    const teamRoute = TEAM_LEAGUE_ROUTES.find((route) =>
      Boolean(item[route.flag]),
    );

    const teamType = teamRoute?.teamType ?? "nba";
    const league = teamType === "soccer"
      ? resolveSoccerTeamLeague(item.id, item.leagueKey || item.league)
      : teamType;
    return {
      pathname: teamType === "nba"
        ? "/(tabs)/(explore)/team/[teamId]"
        : "/(tabs)/(explore)/team/[teamType]/[teamId]",
      params: {
        teamId: String(item.id),
        league,
        ...(teamType === "nba" ? {} : { teamType }),
      },
    };
  }

  if (item.isMCBB || item.isWCBB) {
    return {
      pathname: "/(tabs)/(explore)/player/[sport]/[id]",
      params: {
        sport: "basketball",
        id: String(item.id),
        teamId: String(item.team_id ?? ""),
        league: item.affiliation,
      },
    };
  }

  const playerRoute = PLAYER_LEAGUE_ROUTES.find((route) =>
    Boolean(item[route.flag]),
  );

  if (playerRoute) {
    return {
      pathname: "/(tabs)/(explore)/player/[sport]/[id]",
      params: {
        sport: playerRoute.sport,
        id: String(item.id),
        teamId: String(item.team_id ?? ""),
        league: item.affiliation,
      },
    };
  }

  return {
    pathname: "/(tabs)/(explore)/player/[sport]/[id]",
    params: {
      sport: PLAYER_SPORT_BY_AFFILIATION[item.affiliation],
      id: String(item.id),
      teamId: String(item.team_id ?? ""),
      league: item.affiliation,
    },
  };
}
