import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Game } from "types/nfl";

import { BASE_URL } from "utils/apiClient";

interface UseFootballTeamGamesReturn {
  games: Game[];
  loading: boolean;
  error: string | null;
  refreshGames: () => Promise<void>;
}

export function useFootballTeamGames(
  teamId: string | number | null,
  season: string,
  league?: number,
): UseFootballTeamGamesReturn {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId || !season) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${BASE_URL}/api/games/football/team/${teamId}/${season}`,
        {
          params: { league, teamId },
        },
      );

      // ✅ RAW RESPONSE ONLY
      const rawGames: Game[] = res.data?.games || [];

      setGames(rawGames);
    } catch (err: any) {
      console.error("Error fetching football team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, season, league]);

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
