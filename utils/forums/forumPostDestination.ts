import { FORUM_LEAGUES } from "constants/leagues";
import type { ForumLeague, ForumPostDestination } from "types/forum";

type RouteParam = string | string[] | undefined;

const selectableLeagueSet = new Set<string>(FORUM_LEAGUES);

const firstRouteParam = (value: RouteParam) =>
  Array.isArray(value) ? value[0] : value;

export function normalizeForumPostLeague(
  value: RouteParam,
): ForumLeague | null {
  const normalized = firstRouteParam(value)?.trim().toLowerCase();

  return normalized && selectableLeagueSet.has(normalized)
    ? (normalized as ForumLeague)
    : null;
}

export function parseForumPostDestinationParams({
  league,
  teamId,
}: {
  league?: RouteParam;
  teamId?: RouteParam;
}): ForumPostDestination | null {
  const normalizedLeague = normalizeForumPostLeague(league);

  if (!normalizedLeague) return null;

  const normalizedTeamId = firstRouteParam(teamId)?.trim();

  if (!normalizedTeamId) {
    return { kind: "league", league: normalizedLeague };
  }

  if (/^[1-9]\d*$/.test(normalizedTeamId)) {
    return {
      kind: "team",
      league: normalizedLeague,
      teamId: normalizedTeamId,
    };
  }

  return null;
}

export function getForumPostCreateEndpoint(destination: ForumPostDestination) {
  return destination.kind === "team"
    ? `/api/forum/team/${encodeURIComponent(destination.teamId)}`
    : `/api/forum/league/${encodeURIComponent(destination.league)}`;
}
