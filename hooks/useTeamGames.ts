import { useEffect, useRef, useState } from "react";
import { Game, Venue } from "types/types";
import axios from "axios";
import rateLimit from "axios-rate-limit";
import { teams } from "../constants/teams";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_APISPORTS_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "";

// Rate-limited axios instance
const http = rateLimit(axios.create({}), { maxRequests: 2, perMilliseconds: 1000 });

// Map API status to readable string
function mapStatus(apiStatus: { short: number | string; long?: string }): string {
  const long = apiStatus.long?.toLowerCase();
  if (long === "in play") return "In Play";
  if (long === "finished") return "Final";
  if (long === "scheduled") return "Scheduled";
  if (long === "canceled") return "Canceled";
  if (long === "delayed") return "Delayed";
  if (long === "postponed") return "Postponed";

  const short = Number(apiStatus.short);
  switch (short) {
    case 1: return "Scheduled";
    case 2:
    case 3: return "Final";
    case 4: return "Postponed";
    case 5: return "Delayed";
    case 6: return "Canceled";
    default: return "Scheduled";
  }
}

// Extended type for our hook
export type GameWithStatusText = Game & {
  statusText: string;
  arena?: Venue;
  year: number;
  month: number;
};

export function useTeamGames(teamId?: string) {
  const [games, setGames] = useState<GameWithStatusText[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, GameWithStatusText[]>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Normalize a single game from API
  const normalizeGame = (game: any): GameWithStatusText => {
    const homeLocal = teams.find((t) => String(t.id) === String(game.teams.home.id));
    const awayLocal = teams.find((t) => String(t.id) === String(game.teams.visitors.id));
    const gameDate = new Date(game.date.start);
    const statusText = mapStatus(game.status);

    const arena: Venue | undefined = game.arena
      ? {
          name: game.arena.name,
          city: game.arena.city,
          state: game.arena.state,
     
        }
      : undefined;

    return {
      id: parseInt(game.id, 10),
      date: game.date.start,
      time: gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: game.status,
      statusText,
      periods: game.periods ?? [],
      home: {
        id: String(game.teams.home.id),
        espnID: homeLocal?.espnID ?? "",
        name: homeLocal?.name ?? game.teams.home.name ?? "",
        logo: homeLocal?.logo ?? game.teams.home.logo ?? "",
      },
      away: {
        id: String(game.teams.visitors.id),
        espnID: awayLocal?.espnID ?? "",
        name: awayLocal?.name ?? game.teams.visitors.name ?? "",
        logo: awayLocal?.logo ?? game.teams.visitors.logo ?? "",
      },
      scores: {
        home: { points: typeof game.scores?.home?.points === "number" ? game.scores.home.points : 0 },
        visitors: { points: typeof game.scores?.visitors?.points === "number" ? game.scores.visitors.points : 0 },
      },
      arena,
      year: gameDate.getFullYear(),
      month: gameDate.getMonth(),
    };
  };

  // Fetch a single game by ID
  const fetchGameById = async (gameId: number) => {
    try {
      const res = await http.get<{ response: any[] }>(`https://${RAPIDAPI_HOST}/games`, {
        params: { id: gameId },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
      });
      const game = res.data.response?.[0];
      if (!game) return null;
      return normalizeGame(game);
    } catch (err: any) {
      console.error("[Team Games] Error fetching game by ID:", err);
      return null;
    }
  };

  // Fetch all games for a team
  const fetchGames = async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      setError(null);

      const res = await http.get<{ response: any[] }>(`https://${RAPIDAPI_HOST}/games`, {
        params: { team: teamId, season: "2025", league: "standard" },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
      });

      const rawGames = res.data.response || [];
      const normalizedGames = rawGames.map(normalizeGame);

      cacheRef.current.set(teamId, normalizedGames);
      setGames(normalizedGames);
    } catch (err: any) {
      console.error("[Team Games] Error fetching:", err);
      setError(err.message || "Failed to fetch team games");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh only live games
  const refreshLiveGames = async () => {
    if (!teamId) return;
    const cachedGames = cacheRef.current.get(teamId) ?? [];
    const liveGames = cachedGames.filter((g) => g.statusText === "In Play");
    if (liveGames.length === 0) return;

    const updatedGames = await Promise.all(liveGames.map((g) => fetchGameById(g.id)));

    const mergedGames = cachedGames.map((g) => {
      const updated = updatedGames.find((ug) => ug?.id === g.id);
      return updated ?? g;
    });

    cacheRef.current.set(teamId, mergedGames as GameWithStatusText[]);
    setGames(mergedGames as GameWithStatusText[]);
  };

  useEffect(() => {
    fetchGames();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(refreshLiveGames, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [teamId]);

  return { games, loading, error, refreshGames: fetchGames };
}
