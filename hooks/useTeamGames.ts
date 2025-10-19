import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { teams } from "../constants/teams";
import { Game } from "types/types";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "";

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
  scores?: {
    home?: number;
    visitors?: number;
  };
  [key: string]: any;
}

// --- Helper function to map API status to our Game status ---
function mapStatus(apiStatus: { short: number; long?: string }): Game["status"] {
  switch (apiStatus.short) {
    case 1:
      return "Scheduled";
    case 2:
    case 3: // Some APIs use 3 for finished games
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

export function useTeamGames(teamId?: string) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      };

      const gamesRes = await axios.get<ApiResponse<GameResponse[]>>(
        `https://${RAPIDAPI_HOST}/games`,
        { params: { team: teamId, season: "2025" }, headers }
      );

      const gamesData = gamesRes.data.response;

      const now = new Date();
      const playoffStart = new Date("2026-04-20");
      const playoffEnd = new Date("2026-06-30");

      const filteredGames = gamesData.filter((game) => {
        const gameDate = new Date(game.date.start);
        const status = mapStatus(game.status);

        const shouldHide =
          gameDate < now && ["Scheduled", "Postponed", "Delayed"].includes(status);

        return !shouldHide;
      });

      const enrichedGames: Game[] = filteredGames.map((game) => {
        const homeTeamLocal = teams.find(
          (t) => String(t.id) === String(game.teams.home.id)
        );
        const visitorTeamLocal = teams.find(
          (t) => String(t.id) === String(game.teams.visitors.id)
        );

        const gameDate = new Date(game.date.start);
        const isPlayoff = gameDate >= playoffStart && gameDate <= playoffEnd;

        const status = mapStatus(game.status);

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
            espnID: visitorTeamLocal?.espnID ?? "",
            name: visitorTeamLocal?.name ?? game.teams.visitors.name ?? "",
            logo: visitorTeamLocal?.logo ?? game.teams.visitors.logo ?? "",
            score: game.scores?.visitors ?? 0,
          },
          year: gameDate.getFullYear(),
          month: gameDate.getMonth(),
        };
      });

      setGames(enrichedGames);
    } catch (err) {
      console.error("Failed to fetch team games:", err);
      setError("Failed to fetch data.");
      setGames([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refresh = useCallback(() => {
    if (!teamId) return;
    setRefreshing(true);
    fetchGames();
  }, [teamId, fetchGames]);

  return { games, loading, error, refresh, refreshing };
}
