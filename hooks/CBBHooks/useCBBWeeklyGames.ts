import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BasketballGame } from "types/basketball";
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
  const [basketballGames, setGames] = useState<BasketballGame[]>([]);
  const [cbbLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  // Prevent double-fetch in React 18 Strict Mode (dev only)
  const hasFetchedRef = useRef(false);

  const refreshBasketballGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`/api/games/cbb/weekly`, {
        params: { league },
      });

      const data: BasketballGame[] = res.data?.response || [];
      setGames(data);
      setLastFetched(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error fetching CBB weekly games:", err.message);
      } else {
        console.error("Error fetching CBB weekly games:", err);
      }
      setError("Failed to load weekly CBB games");
    } finally {
      setLoading(false);
    }
  }, [league]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    refreshBasketballGames();
  }, [refreshBasketballGames]);

  const sortedGames = useMemo(() => {
    const isLive = (g: BasketballGame) =>
      !!g.status?.short && LIVE_STATUSES.includes(g.status.short);

    return [...basketballGames].sort((a, b) => {
      const aLive = isLive(a);
      const bLive = isLive(b);

      // Live games first
      if (aLive !== bLive) return Number(bLive) - Number(aLive);

      // Secondary sort: by game date (earliest first)
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();

      return aTime - bTime;
    });
  }, [basketballGames]);

  return {
    basketballGames: sortedGames,
    cbbLoading,
    error,
    lastFetched,
    refresh: refreshBasketballGames,
  };
}