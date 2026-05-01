import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NBATeam } from "types/nba";
import { apiClient } from "utils/apiClient";
import { getWNBASeason } from "utils/dateUtils";

export type BasketballGame = {
  id: number;
  date: string;
  teams: {
    home: NBATeam;
    away: NBATeam;
  };
  scores?: {
    home: { total: number };
    away: { total: number };
  };
  league?: {
    id: number;
    name: string;
  };
  status?: {
    long: string;
    short: string;
  };
};

const LIVE_STATUSES = ["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT"];

type UseWeeklyWNBAGamesOptions = {
  season?: string;
  timezone?: string;
  league?: string;
};

export function useWeeklyWNBAGames({
  season = getWNBASeason(),
  timezone,
  league,
}: UseWeeklyWNBAGamesOptions = {}) {
  const [games, setGames] = useState<BasketballGame[]>([]);
  const [wnbaLoading, setWNBALoading] = useState(false);
  const [wnbaError, setWNBAError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  // ---------------------------------------
  // Fetch
  // ---------------------------------------
  const refreshWNBAGames = useCallback(async () => {
    setWNBALoading(true);
    setWNBAError(null);

    try {
      const res = await apiClient.get(`api/games/wnba/weekly`, {
        params: { season, timezone, league },
      });

      const data: BasketballGame[] = res.data?.response ?? [];

      setGames(data);
      setLastFetched(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    } catch (err: any) {
      console.error("Error fetching WNBA weekly games:", err?.message);
      setWNBAError("Failed to load weekly WNBA games");
    } finally {
      setWNBALoading(false);
    }
  }, [season, timezone, league]);

  useEffect(() => {
    refreshWNBAGames();
  }, [refreshWNBAGames]);

  // ---------------------------------------
  // Helpers
  // ---------------------------------------
  const isLiveGame = useCallback(
    (game: BasketballGame) =>
      !!game.status?.short && LIVE_STATUSES.includes(game.status.short),
    []
  );

  // ---------------------------------------
  // Sort (live games first)
  // ---------------------------------------
  const sortedGames = useMemo(() => {
    if (!games?.length) return [];

    return [...games].sort(
      (a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a))
    );
  }, [games, isLiveGame]);

  // ---------------------------------------
  // Return
  // ---------------------------------------
  return {
    wnbaGames: sortedGames,
    wnbaLoading,
    wnbaError,
    lastFetched,
    refresh: refreshWNBAGames,
  };
}