import { FootballGame } from "@/types/football/football";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

interface UseTeamGamesReturn {
  games: FootballGame[];
  loading: boolean;
  error: string | null;
  refreshGames: () => Promise<void>;
}

export function useTeamGames(
  teamId: string | number | null,
  league: string = "nfl",
  season?: number | string,
): UseTeamGamesReturn {
  const [games, setGames] = useState<FootballGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId || !league) return;

    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {};

      if (season) {
        params.season = season;
      }

      const res = await apiClient.get(
        `/api/games/football/team/${league}/${teamId}/${season}`,
      );

      const rawGames: FootballGame[] = res.data?.games || [];

      setGames(rawGames);
    } catch (err: any) {
      console.error("Error fetching football team games:", err?.message || err);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, league, season]);

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
