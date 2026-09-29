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
  includeLeagueParam?: boolean;
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
  { flag: "isWNBA", teamType: "wnba" },
  { flag: "isNHL", teamType: "nhl" },
  { flag: "isCFB", teamType: "cfb" },
  { flag: "isCBB", teamType: "cbb" },
  {
    flag: "isSOCC",
    teamType: "soccer",
    includeLeagueParam: true,
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
    flag: "isCBB",
    sport: "basketball",
    league: "cbb",
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
  cbb: "basketball",
  wcbb: "basketball",
  mlb: "baseball",
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
    return `/(tabs)/(explore)/user/${item.id}`;
  }

  if (item.type === "team") {
    const teamRoute = TEAM_LEAGUE_ROUTES.find((route) =>
      Boolean(item[route.flag]),
    );

    if (!teamRoute) {
      return `/(tabs)/(explore)/team/${item.id}`;
    }

    const routeId = item.id;

    if (teamRoute.includeLeagueParam) {
      return {
        pathname: "/(tabs)/(explore)/team/[teamType]/[teamId]",
        params: {
          teamType: teamRoute.teamType,
          teamId: String(routeId),
          league: String(item.league ?? "socc"),
        },
      };
    }

    return `/(tabs)/(explore)/team/${teamRoute.teamType}/${routeId}`;
  }

  if (item.isCBB || item.isWCBB) {
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
