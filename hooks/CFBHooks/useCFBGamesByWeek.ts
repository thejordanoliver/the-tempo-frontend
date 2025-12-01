import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import type { Game } from "types/cfb";
import type { CFBWeek } from "utils/CFBUtils/cfbWeeks";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const useCFBGamesByWeek = ({
  week,
  weeks,
}: {
  week: CFBWeek;
  weeks: CFBWeek[];
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Normalize week label for API
      let weekLabel = week.label.toLowerCase().replace(/\s+/g, "");

      const response = await axios.get(`${BASE_URL}/api/gamesCFB/week`, {
        params: {
          season: week.start.year(),
          weekLabel,
          weeks: JSON.stringify(weeks),
        },
      });

      const data: Game[] = response.data?.response || [];

      setGames(data);
    } catch (err: any) {
      console.error("Failed to fetch CFB games from backend:", err);
      setError(err.message || "Failed to fetch games");
    } finally {
      setLoading(false);
    }
  }, [week, weeks]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refresh: fetchGames };
};
