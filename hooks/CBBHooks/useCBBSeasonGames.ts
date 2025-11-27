import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CBBGame } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Cache keys & expiry
const CACHE_KEY = "cbb_season_games_cache";
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours

const LIVE_STATUSES = ["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT"];

export function useCBBSeasonGames(
  season = "2025-2026",
  league = "116" // NCAA Men's
) {
  const [games, setGames] = useState<CBBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Load cached games if available ---
  const loadCachedGames = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }

      // Expired cache
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    } catch (err) {
      console.warn("Failed to load cached CBB games:", err);
      return null;
    }
  }, []);

  // --- Save cache ---
  const saveCache = useCallback(async (data: CBBGame[]) => {
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (err) {
      console.warn("Failed to cache CBB games:", err);
    }
  }, []);

  // --- Fetch from API ---
  const fetchSeasonGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Attempt to load cached data first
      const cached = await loadCachedGames();
      if (cached && cached.length > 0) {
        setGames(cached);
        setLoading(false);
        return;
      }

      // Fetch from backend
      const res = await axios.get(`${BASE_URL}/api/gamesCBB`, {
        params: { season, league, all: 1 },
      });

      const response = res.data.response || [];
      const normalizedGames = normalizeCBBGames(response);
      setGames(normalizedGames);
      saveCache(normalizedGames);
    } catch (err: any) {
      console.error("Error fetching CBB season games:", err.message);
      setError("Failed to load CBB season games");
    } finally {
      setLoading(false);
    }
  }, [season, league, loadCachedGames, saveCache]);

  // --- Initial Fetch ---
  useEffect(() => {
    fetchSeasonGames();
  }, [fetchSeasonGames]);

  const refreshCBBGames = useCallback(() => {
    AsyncStorage.removeItem(CACHE_KEY);
    fetchSeasonGames();
  }, [fetchSeasonGames]);

  // --- Helper to detect live games ---
  const isLiveGame = useCallback(
    (game: CBBGame) => game.status?.short && LIVE_STATUSES.includes(game.status.short),
    []
  );

  // --- Sorted games with live games first ---
const sortedGames = useMemo(() => {
  return [...games].sort((a, b) => {
    const aLive = Number(isLiveGame(a));
    const bLive = Number(isLiveGame(b));

    if (aLive !== bLive) return bLive - aLive; // live games first

    // For non-live games, sort by timestamp descending (upcoming/latest first)
    const aTime = a.timestamp ? Number(a.timestamp) : 0;
    const bTime = b.timestamp ? Number(b.timestamp) : 0;
    return aTime - bTime; // earliest first
  });
}, [games, isLiveGame]);


  return { games: sortedGames, loading, error, refreshCBBGames };
}

function normalizeCBBGames(data: any[]): CBBGame[] {
  return data
    .map((g) => {
      const date = g.date ? dayjs(g.date).toISOString() : null;

      return {
        id: g.id,
        date: date ?? "",
        time: g.time || "",
        timestamp: g.timestamp ?? null,
        timezone: g.timezone ?? "America/New_York",

        stage: g.stage ?? null,
        week: g.week ?? null,
        venue: g.venue ?? g.arena?.name ?? null,

        status: g.status || { long: "", short: "", timer: null },

        league: g.league || {
          id: Number(g.league_id) || 116,
          name: "NCAA",
          type: "College Basketball",
          season: g.season || "2024-2025",
          logo: "",
          country: {
            id: 1,
            name: "USA",
            code: "US",
            flag: "",
          },
        },

        teams: g.teams || { home: {}, away: {} },
        scores: g.scores || {
          home: {},
          away: {},
        },

        arena: g.arena ?? null,
        officials: g.officials ?? [],
        nugget: g.nugget ?? null,
        period: g.periods?.current ?? 0,
      };
    })
    .filter((g) => g.date); // only keep games with valid dates
}
