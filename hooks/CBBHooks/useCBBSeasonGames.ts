import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { CBBGame } from "types/types";
import { getCBBSeason } from "utils/dateUtils";

import { BASE_URL } from "utils/apiClient";

// Leagues
const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";

// Cache expiry
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours

type UseCBBSeasonGamesOptions = {
  season?: string;
  isWomen?: boolean;
};

export function useCBBSeasonGames({
  season = getCBBSeason(),
  isWomen = false,
}: UseCBBSeasonGamesOptions = {}) {
  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;

  const CACHE_KEY = `cbb_season_games_cache_${league}_${season}`;

  const [games, setGames] = useState<CBBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCachedGames = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);

      if (Date.now() - timestamp < CACHE_DURATION) {
        return data as CBBGame[];
      }

      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    } catch (err) {
      console.warn("Failed to load cached CBB games:", err);
      return null;
    }
  }, [CACHE_KEY]);

  const saveCache = useCallback(
    async (data: CBBGame[]) => {
      try {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() }),
        );
      } catch (err) {
        console.warn("Failed to cache CBB games:", err);
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

      const res = await axios.get(`${BASE_URL}/api/games/cbb`, {
        params: { season, league, all: 1 },
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
  }, [season, league, isWomen, loadCachedGames, saveCache]);

  useEffect(() => {
    fetchSeasonGames();
  }, [fetchSeasonGames]);

  const refreshCBBGames = useCallback(() => {
    AsyncStorage.removeItem(CACHE_KEY);
    fetchSeasonGames();
  }, [CACHE_KEY, fetchSeasonGames]);

  // ✅ NO sorting — backend handles it
  return { games, loading, error, refreshCBBGames };
}
