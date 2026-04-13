import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BasketballGame } from "types/types";
import { apiClient } from "utils/apiClient";
import { getCBBSeason } from "utils/dateUtils";

const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";
const LIVE_STATUSES = ["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT"];

type UseCBBWeeklyGamesOptions = {
  season?: string;
  timezone?: string;
  isWomen?: boolean;
};

export function useCBBWeeklyGames({
  season = getCBBSeason(),
  timezone,
  isWomen = false,
}: UseCBBWeeklyGamesOptions = {}) {
  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;

  const [BasketballGames, setGames] = useState<BasketballGame[]>([]);
  const [cbbLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const refreshBasketballGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`/api/games/cbb/weekly`, {
        params: { season, timezone, league },
      });

      const data: BasketballGame[] = res.data?.response || [];
      setGames(data);
      setLastFetched(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    } catch (err: any) {
      console.error("Error fetching CBB weekly games:", err.message);
      setError("Failed to load weekly CBB games");
    } finally {
      setLoading(false);
    }
  }, [season, timezone, league]);

  useEffect(() => {
    refreshBasketballGames();
  }, [refreshBasketballGames]);

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
    refresh: refreshBasketballGames,
  };
}
