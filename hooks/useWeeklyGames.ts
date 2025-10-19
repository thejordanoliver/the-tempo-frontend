import { Game } from "types/types";
import axios from "axios";
import rateLimit from "axios-rate-limit";
import { useEffect, useState } from "react";
import { teams } from "../constants/teams";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "";

// Rate-limited axios
const http = rateLimit(axios.create({}), { maxRequests: 2, perMilliseconds: 1000 });

interface ApiResponse<T> {
  response: T;
}

interface GameResponse {
  id: string;
  date: { start: string };
  status: { short: number; long?: string };
  teams: {
    home: { id: string; name?: string; logo?: string };
    visitors: { id: string; name?: string; logo?: string };
  };
  periods?: any;
  scores?: { home?: number; visitors?: number };
  [key: string]: any;
}

// --- Map API status to our Game["status"] ---
function mapStatus(apiStatus: { short: number; long?: string }): Game["status"] {
  switch (apiStatus.short) {
    case 1:
      return "Scheduled";
    case 2:
    case 3:
      return "Final";
    case 4:
      return "Postponed";
    case 5:
      return "Delayed";
    case 6:
      return "Canceled";
    default:
      if (apiStatus.long?.toLowerCase() === "finished") return "Final";
      return "Scheduled";
  }
}

export function useWeeklyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const dateStrings: string[] = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date.toISOString().split("T")[0];
      });

      const allGames: Game[] = [];

      const playoffStart = new Date("2026-04-20");
      const playoffEnd = new Date("2026-06-30");

      for (const date of dateStrings) {
        const res = await http.get<ApiResponse<GameResponse[]>>(
          `https://${RAPIDAPI_HOST}/games`,
          {
            params: { date },
            headers: {
              "X-RapidAPI-Key": RAPIDAPI_KEY,
              "X-RapidAPI-Host": RAPIDAPI_HOST,
            },
          }
        );

        const enrichedGames: Game[] = res.data.response.map((game) => {
          const gameDate = new Date(game.date.start);
          const status = mapStatus(game.status);
          const isPlayoff = gameDate >= playoffStart && gameDate <= playoffEnd;

          const homeTeamLocal = teams.find((t) => String(t.id) === String(game.teams.home.id));
          const awayTeamLocal = teams.find((t) => String(t.id) === String(game.teams.visitors.id));

          return {
            id: parseInt(game.id, 10),
            date: game.date.start,
            time: gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status,
            periods: game.periods ?? [],
            isPlayoff,
            home: {
              id: String(game.teams.home.id),
              espnID: homeTeamLocal?.espnID ?? "",
              name: homeTeamLocal?.name ?? game.teams.home.name ?? "",
              logo: homeTeamLocal?.logo ?? game.teams.home.logo ?? "",
              score: game.scores?.home ?? 0,
            },
            away: {
              id: String(game.teams.visitors.id),
              espnID: awayTeamLocal?.espnID ?? "",
              name: awayTeamLocal?.name ?? game.teams.visitors.name ?? "",
              logo: awayTeamLocal?.logo ?? game.teams.visitors.logo ?? "",
              score: game.scores?.visitors ?? 0,
            },
            year: gameDate.getFullYear(),
            month: gameDate.getMonth(),
          };
        });

        allGames.push(...enrichedGames);
      }

      setGames(allGames);
    } catch (err) {
      console.error("Error fetching weekly games:", err);
      setError("Failed to fetch games");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGames();
  }, []);

  return { games, loading, error, refreshGames };
}
