// hooks/NFLHooks/useNFLGamesByWeek.ts
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Game } from "types/nfl";

type WeekObject = {
  stage: string;       // "Pre Season", "Regular Season", "Playoffs", "Super Bowl"
  weekNumber: number;  // numeric week for preseason/regular season, 1-4 for playoffs
  label?: string;      // e.g., "Wild Card", "Divisional" (needed for playoffs)
};

type UseNFLGamesByWeekParams = {
  week: WeekObject;
  date?: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL; // your backend base URL, e.g. https://192.168.1.35:4000

export const useNFLGamesByWeek = ({ week }: UseNFLGamesByWeekParams) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Now calling your backend route instead of RapidAPI
      const response = await axios.get(`${API_URL}/api/gamesNFL`, {
        params: {
          season: 2025,
          league: 1,
          timezone: "America/New_York",
        },
      });

      const allGames = response.data?.response || [];

      // 🧩 Filter by week and stage
      const filtered = allGames.filter((g: any) => {
        const apiStage = g.game.stage; // e.g., "Regular Season" or "Post Season"
        const apiWeek = g.game.week;   // e.g., "1", "2", "Wild Card", etc.

        if (week.stage === "Pre Season" || week.stage === "Regular Season") {
          const apiWeekNumber = parseInt(apiWeek.replace(/[^\d]/g, ""), 10);
          return apiStage === week.stage && apiWeekNumber === week.weekNumber;
        }

        // Playoffs / Super Bowl
        if (week.stage === "Playoffs" || week.stage === "Super Bowl") {
          return (
            apiStage === "Post Season" &&
            week.label &&
            apiWeek.toLowerCase() === week.label.toLowerCase()
          );
        }

        return false;
      });

      setGames(filtered);
    } catch (err: any) {
      console.error("Error fetching NFL games:", err.message);
      setError("Failed to fetch games");
    } finally {
      setLoading(false);
    }
  }, [week]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refresh: fetchGames };
};
