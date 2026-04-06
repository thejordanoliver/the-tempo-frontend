import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";
import { getWNBASeason } from "utils/dateUtils";

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

export const useLastFiveGames = (teamId: number) => {
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLastGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get(`/api/games/wnba/last-five/${teamId}`, {
          params: {
            season: getWNBASeason(),
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
  }, [teamId]);

  return { games, loading, error };
};
