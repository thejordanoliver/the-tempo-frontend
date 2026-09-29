import type { ResultItem } from "types/explore";

export type ExploreRoute =
  | string
  | {
      pathname: string;
      params: Record<string, string | number>;
    };

type TeamLeagueRoute = {
  flag: keyof Extract<ResultItem, { type: "team" }>;
  routePrefix: string;
  includeLeagueParam?: boolean;
};

type PlayerLeagueRoute = {
  flag: keyof Extract<ResultItem, { type: "player" }>;
  sport: string;
  league: string;
};

const TEAM_LEAGUE_ROUTES: TeamLeagueRoute[] = [
  { flag: "isNFL", routePrefix: "/team/nfl" },
  { flag: "isGLEAGUE", routePrefix: "/team/gleague" },
  { flag: "isMLB", routePrefix: "/team/mlb" },
  { flag: "isWNBA", routePrefix: "/team/wnba" },
  { flag: "isNHL", routePrefix: "/team/nhl" },
  { flag: "isCFB", routePrefix: "/team/cfb" },
  { flag: "isCBB", routePrefix: "/team/cbb" },
  {
    flag: "isSOCC",
    routePrefix: "/team/soccer",
    includeLeagueParam: true,
  },
  {
    flag: "isWCBB",
    routePrefix: "/team/wcbb",
  },
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

export function getExploreRouteForResult(
  item: ResultItem,
): ExploreRoute {
  if (item.type === "user") {
    return `/user/${item.id}`;
  }

  if (item.type === "team") {
    const teamRoute = TEAM_LEAGUE_ROUTES.find((route) =>
      Boolean(item[route.flag]),
    );

    if (!teamRoute) {
      return `/team/${item.id}`;
    }

    const routeId = item.id;

    if (teamRoute.includeLeagueParam) {
      return {
        pathname: `${teamRoute.routePrefix}/[id]`,
        params: {
          id: String(routeId),
          league: String(item.league ?? "socc"),
        },
      };
    }

    return `${teamRoute.routePrefix}/${routeId}`;
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
    pathname: "/player/[id]",
    params: {
      id: String(item.id),
      teamId: String(item.team_id ?? ""),
      league: item.affiliation,
    },
  };
}
