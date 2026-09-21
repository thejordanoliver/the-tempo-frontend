import { BasketballGame } from "@/types/basketball/basketball";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { apiClient } from "utils/apiClient";

export type BasketballLeague = "nba" | "cbb" | "wcbb" | "wnba";

export interface LastBasketballTeamGameResponse {
  success: boolean;
  league: string;
  count: number;
  game: BasketballGame | null;
  games?: BasketballGame[];
}

type FetchLastGameOptions = {
  isRefresh?: boolean;
  silent?: boolean;
};

const LIVE_STATES = new Set(["in", "half"]);

function isLiveBasketballGame(game: any) {
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
  league: BasketballLeague,
  teamId: number | string | null | undefined,
) {
  const [game, setGame] = useState<BasketballGame | null>(null);
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

        const { data } = await apiClient.get<LastBasketballTeamGameResponse>(
          `api/games/basketball/team/last/${league}/${teamId}`,
        );

        if (!data.success) {
          throw new Error("Failed to load last game");
        }

        const resolvedGame = data.game ?? data.games?.[0] ?? null;

        if (requestId === requestIdRef.current) setGame(resolvedGame);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("LAST BASKETBALL TEAM GAME ERROR:", err);

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
    return isLiveBasketballGame(game);
  }, [game]);

  useLiveSportsSubscription<LastBasketballTeamGameResponse>({
    enabled: Boolean(teamId && hasLiveGame),
    kind: "scoreboard",
    payload: {
      sport: "basketball",
      league,
      feed: "teamLatest",
      teamId: teamId || "",
    },
    onUpdate: (payload, envelope) => {
      const isCurrentTeam =
        envelope.sport === "basketball" &&
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
