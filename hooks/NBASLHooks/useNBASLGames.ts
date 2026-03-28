import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SummerGame } from "types/types";

import { BASE_URL } from "utils/apiClient";

// Cache expiry (6 hours)
const CACHE_DURATION = 1000 * 60 * 60 * 6;

const LIVE_STATUSES = ["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT"];

type UseNBASLGamesOptions = {
  season?: string;
};

export function useNBASLGames({ season = "2025" }: UseNBASLGamesOptions = {}) {
  const CACHE_KEY = `summer_league_games_cache_${season}`;

  const [games, setGames] = useState<SummerGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------
  // Load cached games
  // ------------------------------
  const loadCachedGames = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data as SummerGame[];
      }

      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    } catch (err) {
      console.warn("Failed to load cached Summer League games:", err);
      return null;
    }
  }, [CACHE_KEY]);

  // ------------------------------
  // Save cache
  // ------------------------------
  const saveCache = useCallback(
    async (data: SummerGame[]) => {
      try {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() }),
        );
      } catch (err) {
        console.warn("Failed to cache Summer League games:", err);
      }
    },
    [CACHE_KEY],
  );

  // ------------------------------
  // Fetch season games
  // ------------------------------
  const fetchSeasonGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cached = await loadCachedGames();
      if (cached?.length) {
        setGames(cached);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/games/nba-summer`, {
        params: { season },
      });

      const response: SummerGame[] = res.data.response || [];

      setGames(response);
      saveCache(response);
    } catch (err: any) {
      console.error("Error fetching Summer League season games:", err.message);
      setError("Failed to load Summer League season games");
    } finally {
      setLoading(false);
    }
  }, [season, loadCachedGames, saveCache]);

  // ------------------------------
  // Initial fetch
  // ------------------------------
  useEffect(() => {
    fetchSeasonGames();
  }, [fetchSeasonGames]);

  // ------------------------------
  // Manual refresh
  // ------------------------------
  const refreshSummerGames = useCallback(() => {
    AsyncStorage.removeItem(CACHE_KEY);
    fetchSeasonGames();
  }, [CACHE_KEY, fetchSeasonGames]);

  // ------------------------------
  // Live detection
  // ------------------------------
  const isLiveGame = useCallback(
    (game: SummerGame) =>
      !!game.status?.short && LIVE_STATUSES.includes(game.status.short),
    [],
  );

  // ------------------------------
  // Sort: live first, then time
  // ------------------------------
  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => {
      const aLive = Number(isLiveGame(a));
      const bLive = Number(isLiveGame(b));

      if (aLive !== bLive) return bLive - aLive;

      const aTime = a.timestamp ? Number(a.timestamp) : 0;
      const bTime = b.timestamp ? Number(b.timestamp) : 0;
      return aTime - bTime;
    });
  }, [games, isLiveGame]);

  return {
    games: sortedGames,
    loading,
    error,
    refreshSummerGames,
  };
}
