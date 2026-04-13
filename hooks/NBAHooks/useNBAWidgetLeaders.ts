// hooks/NBAHooks/useNBAWidgetLeaders.ts
import { useGameLeaders } from "hooks/NBAHooks/useGameLeaders";
import { useMemo } from "react";
import { PlayerLeader } from "types/playerLeader";
const STAT_CATEGORIES = ["points", "totReb", "assists", "steals"] as const;
type StatField = (typeof STAT_CATEGORIES)[number];

const STAT_LABEL_MAP: Record<StatField, string> = {
  points: "PTS",
  totReb: "REB",
  assists: "AST",
  steals: "STL",
};

export function useNBAWidgetLeaders(
  gameId: string,
  homeTeamId: number,
  awayTeamId: number,
): { leaders: PlayerLeader[]; isLoading: boolean } {
  const { data, isLoading } = useGameLeaders(gameId, homeTeamId, awayTeamId);

  const leaders = useMemo<PlayerLeader[]>(() => {
    if (!data?.length) return [];

    const result: PlayerLeader[] = [];

    for (const field of STAT_CATEGORIES) {
      const validPlayers = data.filter(
        (p) => p.localPlayer && typeof p[field] === "number",
      );

      // Top player per team for this stat
      const teamIds = [...new Set(validPlayers.map((p) => p.team.id))];

      for (const teamId of teamIds) {
        const best = validPlayers
          .filter((p) => p.team.id === teamId)
          .sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))[0];

        if (!best) continue;

        const p = best.localPlayer;

        result.push({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          headshot_url: p.headshot_url,
          jersey_number: p.jersey_number,
          team: {
            id: best.team.id,
            code: best.team.code,
            logo: best.team.logo,
            logoLight: best.team.logoLight,
          },
          leaderStat: {
            name: STAT_LABEL_MAP[field],
            value: best[field] ?? 0,
          },
        });
      }
    }

    return result;
  }, [data]);

  return { leaders, isLoading };
}
