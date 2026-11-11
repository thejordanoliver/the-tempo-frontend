import type { Team } from "../types/team";
import type {
  VolleyballDirectoryTeam,
  VolleyballGame,
  VolleyballLeagueKey,
  VolleyballStandingsGroup,
  VolleyballStandings,
  VolleyballRankings,
  VolleyballTeam,
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

export type VolleyballTableGroup = {
  key: string;
  title: string;
  columns: { key: string; label: string }[];
  rows: {
    key: string;
    team: VolleyballTeam;
    rank?: number | null;
    values: Record<string, string>;
  }[];
};

/** Presentation mapping of the backend-normalized standings and polls. */
export function volleyballTableGroups(
  data: VolleyballStandings | VolleyballRankings | null,
): VolleyballTableGroup[] {
  if (!data) return [];
  if ("rankings" in data) {
    return data.rankings.all
      .filter((poll) => poll.ranks.length > 0)
      .map((poll) => ({
        key: poll.id,
        title: poll.name ?? "Rankings",
        columns: [
          { key: "previous", label: "Previous" },
          { key: "record", label: "Record" },
        ],
        rows: poll.ranks.map((row, index) => ({
          key: row.team.id ?? String(index),
          team: row.team,
          rank: row.current,
          values: {
            previous: row.previous == null ? "—" : String(row.previous),
            record: row.recordSummary ?? "—",
          },
        })),
      }));
  }
  const groups = volleyballStandingGroups(data.groups);
  const source = groups.length
    ? groups
    : [
        {
          id: "all",
          name: "Standings",
          standings: data.standings,
          children: [],
        },
      ];
  return source
    .filter((group) => group.standings.length > 0)
    .map((group, groupIndex) => {
      const columns = new Map<string, { key: string; label: string }>();
      for (const row of group.standings)
        for (const stat of row.stats) {
          const key = stat.name ?? stat.label;
          if (key && !columns.has(key))
            columns.set(key, { key, label: stat.label ?? stat.name ?? "—" });
        }
      return {
        key: group.id ?? String(groupIndex),
        title: group.name ?? "Standings",
        columns: [...columns.values()].slice(0, 4),
        rows: group.standings.map((row, index) => ({
          key: row.team.id ?? String(index),
          team: row.team,
          values: Object.fromEntries(
            row.stats.map((stat) => [
              stat.name ?? stat.label ?? "",
              stat.displayValue ??
                (stat.value == null ? "—" : String(stat.value)),
            ]),
          ),
        })),
      };
    });
}
