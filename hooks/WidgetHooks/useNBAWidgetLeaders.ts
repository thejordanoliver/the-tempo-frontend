// hooks/NBAHooks/useNBAWidgetLeaders.ts
import { getNBATeam, getTeamLogo } from "constants/teams";
import { useGameLeaders } from "hooks/NBAHooks/useGameLeaders";
import { useMemo } from "react";
import { PlayerLeader } from "types/playerLeader";
const STAT_CATEGORIES = ["points", "rebounds", "assists", "steals"] as const;
type StatField = (typeof STAT_CATEGORIES)[number];

const STAT_LABEL_MAP: Record<StatField, string> = {
  points: "PTS",
  rebounds: "REB",
  assists: "AST",
  steals: "STL",
};

const STAT_VALUE_KEY: Record<StatField, string> = {
  points: "points",
  rebounds: "totReb",
  assists: "assists",
  steals: "steals",
};

export function useNBAWidgetLeaders(
  gameId: string,
  homeTeamId: number,
  awayTeamId: number,
): { leaders: PlayerLeader[]; isLoading: boolean } {
  const { gameLeaders, gameLeadersLoading } = useGameLeaders(
    Number(gameId),
    homeTeamId,
    awayTeamId,
  );

  const leaders = useMemo<PlayerLeader[]>(() => {
    if (!gameLeaders?.length) return [];

    const result: PlayerLeader[] = [];

    for (const field of STAT_CATEGORIES) {
      for (const teamBlock of gameLeaders) {
        const leader = teamBlock?.leaders?.[field];
        const player = leader?.player;
        const stats = leader?.stats;
        const teamId = Number(teamBlock?.team?.id);
        const team = getNBATeam(teamId);

        if (!player || !stats || !teamId) continue;

        result.push({
          id: Number(player.id),
          firstName: player.first_name,
          lastName: player.last_name,
          headshot_url: player.headshot_url,
          jersey_number: player.jersey_number,
          team: {
            id: teamId,
            code: team?.code ?? teamBlock?.team?.abbreviation ?? "",
            logo: getTeamLogo(teamId, false),
          },
          leaderStat: {
            name: STAT_LABEL_MAP[field],
            value: Number(stats?.[STAT_VALUE_KEY[field]] ?? 0),
          },
        });
      }
    }

    return result;
  }, [gameLeaders]);

  return { leaders, isLoading: gameLeadersLoading };
}
