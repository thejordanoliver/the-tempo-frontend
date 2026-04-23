import { useCallback, useEffect, useState } from "react";
import { CollegeBaseballGame } from "types/baseball";
import { apiClient } from "utils/apiClient";

export function useCBTeamGames(teamId: string | number, league: "baseball" | "softball") {
  const [games, setGames] = useState<CollegeBaseballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(
        `/api/games/cb/team/${league}/${teamId}`,
        {
          params: {
            league,
          },
        },
      );

      const rawGames: CollegeBaseballGame[] = res.data.response || [];

      setGames(rawGames);
    } catch (err: any) {
      console.error("Error fetching CB team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, league]);
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refreshGames = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refreshGames };
}
