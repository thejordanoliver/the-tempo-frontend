import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Colors } from "constants/Styles";
import { teamsCBBById, teamsWCBBById } from "constants/teamsCBB";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CBBGame } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Leagues
const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";

// Cache expiry
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours

const LIVE_STATUSES = ["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT"];

type UseCBBSeasonGamesOptions = {
  season?: string;
  isWomen?: boolean;
};

export function useCBBSeasonGames({
  season = "2025-2026",
  isWomen = false,
}: UseCBBSeasonGamesOptions = {}) {
  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;

  // 🔑 cache per league + season
  const CACHE_KEY = `cbb_season_games_cache_${league}_${season}`;

  const [games, setGames] = useState<CBBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Load cached games ---
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

  // --- Save cache ---
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

  // --- Fetch from API ---
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
      const normalizedGames = normalizeCBBGames(response, league);

      setGames(normalizedGames);
      saveCache(normalizedGames);
    } catch (err: any) {
      console.error("Error fetching CBB season games:", err.message);
      setError("Failed to load CBB season games");
    } finally {
      setLoading(false);
    }
  }, [season, league, loadCachedGames, saveCache]);

  // --- Initial fetch ---
  useEffect(() => {
    fetchSeasonGames();
  }, [fetchSeasonGames]);

  const refreshCBBGames = useCallback(() => {
    AsyncStorage.removeItem(CACHE_KEY);
    fetchSeasonGames();
  }, [CACHE_KEY, fetchSeasonGames]);

  // --- Live detection ---
  const isLiveGame = useCallback(
    (game: CBBGame) =>
      !!game.status?.short && LIVE_STATUSES.includes(game.status.short),
    [],
  );

  // --- Sort: live first, then chronological ---
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

  return { games: sortedGames, loading, error, refreshCBBGames };
}

function normalizeCBBGames(
  data: any[],
  league: string,
  isWomen = false,
): CBBGame[] {
  const teamsMap = isWomen ? teamsWCBBById : teamsCBBById;

  return data
    .map((g) => {
      const date = g.date ? dayjs(g.date).toISOString() : null;

      // Determine keys for team lookup
      const homeKey = isWomen
        ? Number(g.teams?.home?.wid)
        : Number(g.teams?.home?.id);
      const awayKey = isWomen
        ? Number(g.teams?.away?.wid)
        : Number(g.teams?.away?.id);

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

        league: g.league || {
          id: Number(league),
          name: "NCAA",
          type: "College Basketball",
          season: g.season || "2025-2026",
          logo: "",
          country: {
            id: 1,
            name: "USA",
            code: "US",
            flag: "",
          },
        },

        teams: {
          home: {
            ...g.teams?.home,
            id: g.teams?.home?.id,
            wid: g.teams?.home?.wid,
            name: homeTeamData.name || g.teams?.home?.name,
            fullName: homeTeamData.fullName || g.teams?.home?.fullName,
            logo: homeTeamData.logo || "",
            color: homeTeamData.color || Colors.midTone,
            secondaryColor: homeTeamData.secondaryColor || Colors.midTone,
            location: homeTeamData.location,
            venueName: homeTeamData.venueName,
          },
          away: {
            ...g.teams?.away,
            id: g.teams?.away?.id,
            wid: g.teams?.away?.wid,
            name: awayTeamData.name || g.teams?.away?.name,
            fullName: awayTeamData.fullName || g.teams?.away?.fullName,
            logo: awayTeamData.logo || "",
            color: awayTeamData.color || Colors.midTone,
            secondaryColor: awayTeamData.secondaryColor || Colors.midTone,
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
