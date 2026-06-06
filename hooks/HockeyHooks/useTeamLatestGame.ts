import { HockeyGame } from "@/types/hockey";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type HockeyLeague = "nhl" | "mch";

export interface LastHockeyTeamGameResponse {
  success: boolean;
  league: string;
  count: number;
  game: HockeyGame | null;
  games?: HockeyGame[];
}

export function useTeamLatestGame(
  league: HockeyLeague,
  teamId: number | string | null | undefined,
) {
  const [game, setGame] = useState<HockeyGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLastGame = useCallback(
    async (isRefresh = false) => {
      if (!teamId) {
        setGame(null);
        setLoading(false);
        setRefreshing(false);
        setError("Missing team id");
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const { data } = await apiClient.get<LastHockeyTeamGameResponse>(
          `api/games/hockey/team/last/${league}/${teamId}`,
        );

        if (!data.success) {
          throw new Error("Failed to load last game");
        }

        const resolvedGame = data.game ?? data.games?.[0] ?? null;

        setGame(resolvedGame);
      } catch (err) {
        console.error("🔥 LAST HOCKEY TEAM GAME ERROR:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load last game",
        );
        setGame(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [league, teamId],
  );

  useEffect(() => {
    fetchLastGame(false);
  }, [fetchLastGame]);

  const refresh = useCallback(() => {
    fetchLastGame(true);
  }, [fetchLastGame]);

  return {
    game,
    loading,
    refreshing,
    error,
    refresh,
  };
}

export default useTeamLatestGame;
