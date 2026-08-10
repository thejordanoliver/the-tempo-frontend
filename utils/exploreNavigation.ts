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
  pathname: string;
  league: string;
};

const TEAM_LEAGUE_ROUTES: TeamLeagueRoute[] = [
  { flag: "isNFL", routePrefix: "/team/nfl" },
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
    pathname: "/player/football/[id]",
    league: "NFL",
  },
  {
    flag: "isCFB",
    pathname: "/player/football/[id]",
    league: "CFB",
  },
  {
    flag: "isMMA",
    pathname: "/player/mma/[id]",
    league: "MMA",
  },
  {
    flag: "isMLB",
    pathname: "/player/baseball/[id]",
    league: "MLB",
  },
  {
    flag: "isNHL",
    pathname: "/player/nhl/[id]",
    league: "NHL",
  },
  {
    flag: "isNBA",
    pathname: "/player/basketball/[id]",
    league: "NBA",
  },
  {
    flag: "isCBB",
    pathname: "/player/basketball/[id]",
    league: "CBB",
  },
  {
    flag: "isWCBB",
    pathname: "/player/basketball/[id]",
    league: "WCBB",
  },
  {
    flag: "isWNBA",
    pathname: "/player/basketball/[id]",
    league: "WNBA",
  },
  {
    flag: "isSOCC",
    pathname: "/player/soccer/[id]",
    league: "SOCC",
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
          league: String(item.league ?? "SOCC"),
        },
      };
    }

    return `${teamRoute.routePrefix}/${routeId}`;
  }

  if (item.isCBB || item.isWCBB) {
    return {
      pathname: "/player/basketball/[id]",
      params: {
        id: String(item.id),
        teamId: String(item.team_id ?? ""),
        league: item.isWCBB ? "WCBB" : "CBB",
      },
    };
  }

  const playerRoute = PLAYER_LEAGUE_ROUTES.find((route) =>
    Boolean(item[route.flag]),
  );

  if (playerRoute) {
    return {
      pathname: playerRoute.pathname,
      params: {
        id: String(item.id),
        teamId: String(item.team_id ?? ""),
        league: playerRoute.league,
      },
    };
  }

  return {
    pathname: "/player/[id]",
    params: {
      id: String(item.id),
      teamId: String(item.team_id ?? ""),
      league: "NBA",
    },
  };
}
