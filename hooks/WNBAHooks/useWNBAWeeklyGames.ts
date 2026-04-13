import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NBATeam } from "types/types";
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

type useWeeklyWNBAGamesOptions = {
  season?: string;
  timezone?: string;
  league?: string;
};

export function useWeeklyWNBAGames({
  season = getWNBASeason(),
  timezone,
  league,
}: useWeeklyWNBAGamesOptions = {}) {
  const [BasketballGames, setGames] = useState<BasketballGame[]>([]);
  const [cbbLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const refreshWNBAGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`api/games/cbb/weekly`, {
        params: { season, timezone, league },
      });

      const data: BasketballGame[] = res.data?.response || [];
      setGames(data);
      setLastFetched(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    } catch (err: any) {
      console.error("Error fetching WNBA weekly games:", err.message);
      setError("Failed to load weekly WNBA games");
    } finally {
      setLoading(false);
    }
  }, [season, timezone, league]);

  useEffect(() => {
    refreshWNBAGames();
  }, [refreshWNBAGames]);

  const isLiveGame = useCallback(
    (game: BasketballGame) =>
      !!game.status?.short && LIVE_STATUSES.includes(game.status.short),
    [],
  );

  const sortedGames = useMemo(() => {
    return [...BasketballGames].sort(
      (a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)),
    );
  }, [BasketballGames, isLiveGame]);

  return {
    BasketballGames: sortedGames,
    cbbLoading,
    error,
    lastFetched,
    refresh: refreshWNBAGames,
  };
}
