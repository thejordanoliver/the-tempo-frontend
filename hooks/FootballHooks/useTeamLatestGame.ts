import { FootballGame } from "@/types/football";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type FootballLeague = "nfl" | "cfb";

export interface LastFootballTeamGameResponse {
  success: boolean;
  league: string;
  count: number;
  game: FootballGame | null;
  games?: FootballGame[];
}

export function useTeamLatestGame(
  league: FootballLeague,
  teamId: number | string | null | undefined,
) {
  const [game, setGame] = useState<FootballGame | null>(null);
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

        const { data } = await apiClient.get<LastFootballTeamGameResponse>(
          `api/games/football/team/last/${league}/${teamId}`,
        );

        if (!data.success) {
          throw new Error("Failed to load last game");
        }

        const resolvedGame = data.game ?? data.games?.[0] ?? null;

        setGame(resolvedGame);
      } catch (err) {
        console.error("LAST FOOTBALL TEAM GAME ERROR:", err);
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
