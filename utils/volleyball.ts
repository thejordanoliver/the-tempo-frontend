import type { Team } from "../types/team";
import type {
  VolleyballDirectoryTeam,
  VolleyballGame,
  VolleyballLeagueKey,
  VolleyballStandingsGroup,
} from "../types/volleyball/volleyball";

export function isVolleyballLeague(
  value: unknown,
): value is VolleyballLeagueKey {
  return value === "mcvb" || value === "wcvb";
}

export function volleyballDirectoryTeam(
  team: VolleyballDirectoryTeam,
  league: VolleyballLeagueKey,
): Team {
  return {
    id: team.id,
    league,
    name: team.shortName || team.name || "Unknown team",
    fullName: team.name ?? team.shortName,
    shortName: team.shortName,
    code: team.code ?? "",
    city: null,
    location: null,
    established: 0,
    primaryColor: team.primaryColor,
    secondaryColor: team.secondaryColor,
    logo: team.logo ? { uri: team.logo } : null,
    logoLight: team.logoDark
      ? { uri: team.logoDark }
      : team.logo
        ? { uri: team.logo }
        : null,
    isActive: team.isActive,
    isAllStar: team.isAllStar,
    isNational: team.isNational,
  };
}

export function volleyballStatus(game: VolleyballGame): string {
  if (game.status.completed) return "Final";
  if (game.status.state === "in")
    return `Live · Set ${game.status.period || 1}`;
  return game.status.shortDetail || game.status.description || "Scheduled";
}

export function volleyballStandingGroups(
  groups: VolleyballStandingsGroup[],
): VolleyballStandingsGroup[] {
  return groups.flatMap((group) => [
    ...(group.standings.length ? [group] : []),
    ...volleyballStandingGroups(group.children),
  ]);
}
