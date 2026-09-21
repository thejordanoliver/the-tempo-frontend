import { BaseballGame } from "@/types/baseball/baseball";
import { isGameLive } from "@/utils/games";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
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


export function useTeamLatestGame(
  league: BaseballLeague,
  teamId: number | string | null | undefined,
) {
  const [game, setGame] = useState<BaseballGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchLastGame = useCallback(
    async ({
      isRefresh = false,
      silent = false,
    }: FetchLastGameOptions = {}) => {
      const requestId = ++requestIdRef.current;
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

        if (requestId === requestIdRef.current) setGame(resolvedGame);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("LAST BASEBALL TEAM GAME ERROR:", err);

        const message =
          err instanceof Error ? err.message : "Failed to load last game";

        setError(message);

        // Do not clear the current game during background live updates.
        if (!silent) {
          setGame(null);
        }
      } finally {
        if (isRefresh && requestId === requestIdRef.current) {
          setRefreshing(false);
        }

        if (!silent && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [league, teamId],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchLastGame();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [fetchLastGame]);

  const hasLiveGame = useMemo(() => {
    return isGameLive(game);
  }, [game]);

  useLiveSportsSubscription<LastBaseballTeamGameResponse>({
    enabled: Boolean(teamId && hasLiveGame),
    kind: "scoreboard",
    payload: {
      sport: "baseball",
      league,
      feed: "teamLatest",
      teamId: teamId || "",
    },
    onUpdate: (payload, envelope) => {
      const isCurrentTeam =
        envelope.sport === "baseball" &&
        envelope.league === league &&
        envelope.feed === "teamLatest" &&
        envelope.params?.teamId === String(teamId);

      if (!isCurrentTeam) return;

      requestIdRef.current += 1;
      setError(null);
      setGame(payload.game ?? payload.games?.[0] ?? null);
      setLoading(false);
      setRefreshing(false);
    },
  });

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
