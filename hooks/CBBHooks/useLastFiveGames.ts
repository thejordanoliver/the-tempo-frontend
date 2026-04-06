import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";
import { getCBBSeason } from "utils/dateUtils";
type GameResult = {
  id: number;
  date: string;
  isHome: boolean;
  won: boolean;
  home: {
    id: number;
    name: string;
  };
  homeScore: number;
  away: {
    id: number;
    name: string;
  };
  awayScore: number;
  opponent: {
    id: number;
    name: string;
  };
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useLastFiveGames = (teamId: number, isWomens = false) => {
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLastGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const league = isWomens ? 423 : 116;

        const res = await apiClient.get(`/api/games/cbb/last-five/${teamId}`, {
          params: {
            league,
            season: getCBBSeason(),
          },
        });

        setGames(res.data.games || []);
      } catch (err) {
        console.error("Error fetching last five games", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) fetchLastGames();
  }, [teamId, isWomens]);

  return { games, loading, error };
};
