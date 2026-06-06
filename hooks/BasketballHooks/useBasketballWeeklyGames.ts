import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { BasketballGame } from "types/basketball";
import { apiClient } from "utils/apiClient";
import { getCBBSeason, getWNBASeason } from "utils/dateUtils";

// Leagues
const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";
const WNBA_LEAGUE = "13";

type useBasketballGameOptions = {
  isWNBA?: boolean;
  isWomen?: boolean;
};

export function useBasketballWeeklyGames({
  isWNBA = false,
  isWomen = false,
}: useBasketballGameOptions = {}) {
  const [basketballGames, setGames] = useState<BasketballGame[]>([]);
  const [cbbLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const season = isWNBA ? getWNBASeason() : getCBBSeason();
  const league = isWNBA
    ? WNBA_LEAGUE
    : isWomen
      ? WOMEN_CBB_LEAGUE
      : MEN_CBB_LEAGUE;

  const refreshBasketballGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get("api/games/basketball/weekly", {
        params: { league, season },
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
  }, [league, season]);

  useEffect(() => {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    refreshBasketballGames();
  }, [refreshBasketballGames]);

  return {
    basketballGames,
    cbbLoading,
    error,
    lastFetched,
    refresh: refreshBasketballGames,
  };
}
