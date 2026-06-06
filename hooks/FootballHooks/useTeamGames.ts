import { useCallback, useEffect, useState } from "react";
import { FootballGame } from "types/football";
import { apiClient } from "utils/apiClient";

interface useTeamGamesReturn {
  games: FootballGame[];
  loading: boolean;
  error: string | null;
  refreshGames: () => Promise<void>;
}

export function useTeamGames(
  teamId: string | number | null,
  league?: string,
): useTeamGamesReturn {
  const [games, setGames] = useState<FootballGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get(
        `api/games/football/team/${league}/${teamId}`,
      );

      // ✅ RAW RESPONSE ONLY
      const rawGames: FootballGame[] = res.data?.games || [];


      setGames(rawGames);
    } catch (err: any) {
      console.error("Error fetching football team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, league]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refreshGames = useCallback(async () => {
    await fetchGames();
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    refreshGames,
  };
}
