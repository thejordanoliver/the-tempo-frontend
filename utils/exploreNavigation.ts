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
  idField?: "id" | "wid";
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
  { flag: "isWCBB", routePrefix: "/team/wcbb", idField: "wid" },
];

const PLAYER_LEAGUE_ROUTES: PlayerLeagueRoute[] = [
  { flag: "isNFL", pathname: "/player/nfl/[id]", league: "NFL" },
  { flag: "isCFB", pathname: "/player/cfb/[id]", league: "CFB" },
  { flag: "isMMA", pathname: "/player/mma/[id]", league: "MMA" },
  { flag: "isMLB", pathname: "/player/mlb/[id]", league: "MLB" },
  { flag: "isNHL", pathname: "/player/nhl/[id]", league: "NHL" },
  { flag: "isWNBA", pathname: "/player/basketball/[id]", league: "WNBA" },
];

export function getExploreRouteForResult(item: ResultItem): ExploreRoute {
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

    const idField = teamRoute.idField ?? "id";
    const routeId = item[idField] ?? item.id;

    return `${teamRoute.routePrefix}/${routeId}`;
  }

  if (item.isCBB || item.isWCBB) {
    return {
      pathname: "/player/basketball/[id]",
      params: {
        id: String(item.player_id),
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
        id: String(item.player_id),
        teamId: String(item.team_id ?? ""),
        league: playerRoute.league,
      },
    };
  }

  return {
    pathname: "/player/[id]",
    params: {
      id: String(item.player_id),
      teamId: String(item.team_id ?? ""),
      league: "NBA",
    },
  };
}
