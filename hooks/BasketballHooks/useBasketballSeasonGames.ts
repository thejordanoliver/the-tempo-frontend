import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { BasketballGame } from "types/basketball";
import { getCBBSeason, getWNBASeason } from "utils/dateUtils";

import { apiClient } from "utils/apiClient";

// Leagues
const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";
const WNBA_LEAGUE = "13";

// Cache expiry
const CACHE_DURATION = 1000 * 60 * 60 * 6;

type useBasketballGameOptions = {
  isWNBA?: boolean;
  isWomen?: boolean;
};

export function useBasketballSeasonGames({
  isWNBA = false,
  isWomen = false,
}: useBasketballGameOptions = {}) {
  const season = isWNBA ? getWNBASeason() : getCBBSeason();
  const league = isWNBA
    ? WNBA_LEAGUE
    : isWomen
      ? WOMEN_CBB_LEAGUE
      : MEN_CBB_LEAGUE;
  const CACHE_KEY = `basketball_season_games_cache_${league}_${season}`;

  const [games, setGames] = useState<BasketballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCachedGames = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);

      if (Date.now() - timestamp < CACHE_DURATION) {
        return data as BasketballGame[];
      }

      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    } catch (err) {
      console.warn("Failed to load cached basketball games:", err);
      return null;
    }
  }, [CACHE_KEY]);

  const saveCache = useCallback(
    async (data: BasketballGame[]) => {
      try {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() }),
        );
      } catch (err) {
        console.warn("Failed to cache basketball games:", err);
      }
    },
    [CACHE_KEY],
  );

  const fetchSeasonGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cached = await loadCachedGames();
      if (cached && cached.length > 0) {
        setGames(cached);
        setLoading(false);
        return;
      }

      const res = await apiClient.get(`api/games/basketball`, {
        params: { season, league },
      });

      const response = res.data.response || [];

      setGames(response);
      saveCache(response);
    } catch (err: any) {
      console.error("Error fetching CBB season games:", err.message);
      setError("Failed to load CBB season games");
    } finally {
      setLoading(false);
    }
  }, [season, league, loadCachedGames, saveCache]);

  useEffect(() => {
    fetchSeasonGames();
  }, [fetchSeasonGames]);

  const refreshBasketballGames = useCallback(() => {
    AsyncStorage.removeItem(CACHE_KEY);
    fetchSeasonGames();
  }, [CACHE_KEY, fetchSeasonGames]);

  // ✅ NO sorting — backend handles it
  return { games, loading, error, refreshBasketballGames };
}
