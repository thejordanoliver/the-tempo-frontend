import type { Href } from "expo-router";
import { resolveSoccerTeamLeague } from "./soccerTeamLeague";
const TEAM_ROUTE_LEAGUES = new Set([
  "nba", "wnba", "gleague", "mcbb", "wcbb", "nfl", "cfb", "ufl",
  "mlb", "cb", "sb", "nhl",
]);

// Recover fixed leagues from paths and retain soccer competition metadata.
export function withTeamLeague(href: Href): Href {
  const pathname = typeof href === "string" ? href : href.pathname;
  if (
    typeof pathname !== "string" ||
    !/^\/(?:\(tabs\)\/\((?:home|league|explore|profile)\)\/)?team\//.test(pathname)
  ) {
    return href;
  }
  const match = pathname.split(/[?#]/, 1)[0].match(/\/team\/([^/]+)(?:\/([^/]+))?$/);
  if (!match) return href;

  const params = typeof href === "string" ? undefined : href.params;
  const teamType = !match[2]
    ? "nba"
    : match[1] === "[teamType]"
      ? String(params?.teamType ?? "")
      : match[1];
  if (teamType !== "soccer" && !TEAM_ROUTE_LEAGUES.has(teamType)) return href;
  const teamId = params?.teamId ?? match[2];
  const getLeague = (value: unknown) =>
    teamType === "soccer"
      ? resolveSoccerTeamLeague(
          String(teamId ?? ""),
          typeof value === "string" || Array.isArray(value) ? value : undefined,
        )
      : value || teamType;

  if (typeof href !== "string") {
    return { ...href, params: { ...params, league: getLeague(params?.league) } } as Href;
  }
  const [pathAndQuery, fragment] = href.split("#", 2);
  const [path, query] = pathAndQuery.split("?", 2);
  const search = new URLSearchParams(query);
  search.set("league", String(getLeague(search.get("league"))));
  return `${path}?${search}${fragment === undefined ? "" : `#${fragment}`}` as Href;
}
