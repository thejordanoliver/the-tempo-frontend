import type { Href } from "expo-router";
import { resolveSoccerTeamLeague } from "../teams/soccerTeamLeague";
import type { TabGroup } from "./tabStackNavigation";

const teamSports = {
  nba: "basketball",
  wnba: "basketball",
  gleague: "basketball",
  mcbb: "basketball",
  wcbb: "basketball",
  nfl: "football",
  cfb: "football",
  ufl: "football",
  nhl: "hockey",
  mch: "hockey",
  wch: "hockey",
  mlb: "baseball",
  cb: "baseball",
  sb: "baseball",
  socc: "soccer",
  msoc: "soccer",
  wsoc: "soccer",
} as const;

type ListedLeague = keyof typeof teamSports;
export type TeamSport = (typeof teamSports)[ListedLeague];
export type TeamLeague<S extends TeamSport> = {
  [L in ListedLeague]: (typeof teamSports)[L] extends S ? L : never;
}[ListedLeague];
type TeamRoute = {
  [S in TeamSport]: {
    sport: S;
    league: S extends "soccer" ? string : TeamLeague<S>;
  };
}[TeamSport];

export function getTeamSport(league: string): TeamSport | undefined {
  const key = league.trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(teamSports, key)) {
    return teamSports[key as ListedLeague];
  }
}

export function resolveTeamRoute(
  sportOrLeague: string | undefined,
  teamId: string | number | undefined,
  leagueParam?: string | string[],
): TeamRoute | undefined {
  const segment = sportOrLeague?.trim().toLowerCase() ?? "nba";
  const league = (Array.isArray(leagueParam) ? leagueParam[0] : leagueParam)
    ?.trim()
    .toLowerCase();
  const legacySport = getTeamSport(segment);
  if (segment === "soccer" || legacySport === "soccer") {
    return {
      sport: "soccer",
      league: resolveSoccerTeamLeague(teamId, legacySport ? segment : league),
    };
  }
  if (legacySport) return { sport: legacySport, league: segment } as TeamRoute;

  // Team IDs overlap across leagues. A sport URL needs its league to identify a team.
  if (league && getTeamSport(league) === segment) {
    return { sport: segment, league } as TeamRoute;
  }
}

export function getTeamHref(
  sport: string,
  teamId: string | number,
  league: string,
  tabGroup?: TabGroup,
) {
  const pathname = tabGroup
    ? (`/(tabs)/${tabGroup}/team/[sport]/[teamId]` as const)
    : ("/team/[sport]/[teamId]" as const);
  return {
    pathname,
    params: {
      sport,
      teamId: String(teamId),
      league:
        sport === "soccer" ? resolveSoccerTeamLeague(teamId, league) : league,
    },
  };
}

// Legacy links still match the router. Normalize them when navigating in the app.
export function withTeamLeague(href: Href): Href {
  const pathname = typeof href === "string" ? href : href.pathname;
  const [pathAndQuery, fragment] = pathname.split("#", 2);
  const [path, query] = pathAndQuery.split("?", 2);
  const match = path.match(
    /^(\/(?:\(tabs\)\/\((?:home|league|explore|profile)\)\/)?team)\/([^/]+)(?:\/([^/]+))?\/?$/,
  );
  if (!match) return href;

  const [, prefix, first, second] = match;
  const params = typeof href === "string" ? undefined : href.params;
  const search = new URLSearchParams(query);
  const segment = second
    ? first === "[sport]"
      ? String(params?.sport ?? "")
      : first
    : undefined;
  const teamId = String(params?.teamId ?? second ?? first);
  const leagueParam = params?.league;
  const league =
    (Array.isArray(leagueParam) ? leagueParam[0] : leagueParam) ??
    search.get("league");
  const route = resolveTeamRoute(
    segment,
    teamId,
    typeof league === "string" ? league : undefined,
  );
  if (!route) return href;

  if (typeof href === "string") {
    search.set("league", route.league);
    return `${prefix}/${route.sport}/${teamId}?${search}${fragment === undefined ? "" : `#${fragment}`}` as Href;
  }

  return {
    pathname: `${prefix}/[sport]/[teamId]`,
    params: { ...params, sport: route.sport, teamId, league: route.league },
  } as Href;
}
