import { BaseballGame } from "@/types/baseball";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export type BaseballLeague = "mlb" | "cb" | "sb";

export interface LastBaseballTeamGameResponse {
  success: boolean;
  league: string;
  count: number;
  game: BaseballGame | null;
  games?: BaseballGame[];
}

type FetchLastGameOptions = {
  isRefresh?: boolean;
  silent?: boolean;
};

const LIVE_STATES = new Set(["in", "half"]);

function isLiveBaseballGame(game: any) {
  const state = String(game?.status?.state || "").toLowerCase();
  const description = String(game?.status?.description || "").toLowerCase();
  const detail = String(game?.status?.detail || "").toLowerCase();
  const shortDetail = String(game?.status?.shortDetail || "").toLowerCase();

  return (
    LIVE_STATES.has(state) ||
    description.includes("in progress") ||
    detail.includes("in progress") ||
    shortDetail.includes("in progress") ||
    description.includes("live") ||
    detail.includes("live") ||
    shortDetail.includes("live")
  );
}

export function useTeamLatestGame(
  league: BaseballLeague,
  teamId: number | string | null | undefined,
) {
  const [game, setGame] = useState<BaseballGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLastGame = useCallback(
    async ({
      isRefresh = false,
      silent = false,
    }: FetchLastGameOptions = {}) => {
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
        } else if (!silent) {
          setLoading(true);
        }

        setError(null);

        const { data } = await apiClient.get<LastBaseballTeamGameResponse>(
          `api/games/baseball/team/last/${league}/${teamId}`,
        );

        if (!data.success) {
          throw new Error("Failed to load last game");
        }

        const resolvedGame = data.game ?? data.games?.[0] ?? null;

        setGame(resolvedGame);
      } catch (err) {
        console.error("LAST BASEBALL TEAM GAME ERROR:", err);

        const message =
          err instanceof Error ? err.message : "Failed to load last game";

        setError(message);

        // Do not clear the current game during silent polling.
        if (!silent) {
          setGame(null);
        }
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        }

        if (!silent) {
          setLoading(false);
        }
      }
    },
    [league, teamId],
  );

  useEffect(() => {
    fetchLastGame();
  }, [fetchLastGame]);

  const hasLiveGame = useMemo(() => {
    return isLiveBaseballGame(game);
  }, [game]);

  useEffect(() => {
    if (!hasLiveGame) return;

    const interval = setInterval(() => {
      fetchLastGame({ silent: true });
    }, 60000);

    return () => clearInterval(interval);
  }, [hasLiveGame, fetchLastGame]);

  const refresh = useCallback(async () => {
    await fetchLastGame({ isRefresh: true });
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