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
    league: "nfl",
  },
  {
    flag: "isCFB",
    pathname: "/player/football/[id]",
    league: "cfb",
  },
  {
    flag: "isMMA",
    pathname: "/player/mma/[id]",
    league: "mma",
  },
  {
    flag: "isMLB",
    pathname: "/player/baseball/[id]",
    league: "mla",
  },
  {
    flag: "isNHL",
    pathname: "/player/nhl/[id]",
    league: "nhl",
  },
  {
    flag: "isNBA",
    pathname: "/player/basketball/[id]",
    league: "nba",
  },
  {
    flag: "isCBB",
    pathname: "/player/basketball/[id]",
    league: "cbb",
  },
  {
    flag: "isWCBB",
    pathname: "/player/basketball/[id]",
    league: "wcbb",
  },
  {
    flag: "isWNBA",
    pathname: "/player/basketball/[id]",
    league: "wnba",
  },
  {
    flag: "isSOCC",
    pathname: "/player/soccer/[id]",
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
        league: String(item.affiliation),
      },
    };
  }

  return {
    pathname: "/player/[id]",
    params: {
      id: String(item.id),
      teamId: String(item.team_id ?? ""),
      league: String(item.affiliation),
    },
  };
}
