import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Colors } from "constants/Colors";
import { teamsById } from "constants/teams";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SummerGame } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Cache expiry (6 hours)
const CACHE_DURATION = 1000 * 60 * 60 * 6;

const LIVE_STATUSES = ["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT"];

type UseNBASLGamesOptions = {
  season?: string;
};

export function useNBASLGames({ season = "2025" }: UseNBASLGamesOptions = {}) {
  // 🔑 cache per season
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
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch (err) {
        console.warn("Failed to cache Summer League games:", err);
      }
    },
    [CACHE_KEY]
  );

  // ------------------------------
  // Fetch season games (single call)
  // ------------------------------
  const fetchSeasonGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Cache first
      const cached = await loadCachedGames();
      if (cached && cached.length > 0) {
        setGames(cached);
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch combined season games
      const res = await axios.get(`${BASE_URL}/api/gamesNBASL`, {
        params: { season },
      });

      const response = res.data.response || [];

      // 3️⃣ Normalize + dedupe by game ID (safety)
const normalizedGames = Object.values(
  normalizeSummerGames(response).reduce((acc, game) => {
    const leagueId = game.league?.id ?? "unknown";
    const key = `${leagueId}-${game.id}`;

    acc[key] = game;
    return acc;
  }, {} as Record<string, SummerGame>)
);


      setGames(normalizedGames);
      saveCache(normalizedGames);
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
    []
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

// --------------------------------------------------
// Normalize API games
// --------------------------------------------------
function normalizeSummerGames(data: any[]): SummerGame[] {
  const teamsMap = teamsById;

  return data
    .map((g) => {
      const date = g.date ? dayjs(g.date).toISOString() : null;

      const homeKey = Number(g.teams?.home?.id);
      const awayKey = Number(g.teams?.away?.id);

      const homeTeamData = teamsMap[homeKey] || {};
      const awayTeamData = teamsMap[awayKey] || {};

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
        league: g.league,

        teams: {
          home: {
            ...g.teams?.home,
            id: g.teams?.home?.id,
            summerLeagueId: g.teams?.home?.summerLeagueId,
            name: homeTeamData.name || g.teams?.home?.name,
            fullName: homeTeamData.fullName || g.teams?.home?.fullName,
            logo: homeTeamData.logo || "",
            color: homeTeamData.color || Colors.midTone,
            secondaryColor:
              homeTeamData.secondaryColor || Colors.midTone,
            location: homeTeamData.location,
            venueName: homeTeamData.venueName,
          },
          away: {
            ...g.teams?.away,
            id: g.teams?.away?.id,
            summerLeagueId: g.teams?.away?.summerLeagueId,
            name: awayTeamData.name || g.teams?.away?.name,
            fullName: awayTeamData.fullName || g.teams?.away?.fullName,
            logo: awayTeamData.logo || "",
            color: awayTeamData.color || Colors.midTone,
            secondaryColor:
              awayTeamData.secondaryColor || Colors.midTone,
            location: awayTeamData.location,
            venueName: awayTeamData.venueName,
          },
        },

        scores: g.scores || { home: {}, away: {} },
        arena: g.arena ?? null,
        officials: g.officials ?? [],
        nugget: g.nugget ?? null,
        period: g.periods?.current ?? 0,
      };
    })
    .filter((g) => g.date);
}
