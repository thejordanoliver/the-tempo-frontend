import { useCallback, useEffect, useState } from "react";
import { BasketballGame } from "types/basketball";
import { apiClient } from "utils/apiClient";
import { getWNBASeason } from "utils/dateUtils";

type useWNBATeamGamesOptions = {
  season?: string;
};

export function useWNBATeamGames(
  teamId: string | number,
  { season = getWNBASeason() }: useWNBATeamGamesOptions = {},
) {
  const [games, setGames] = useState<BasketballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`api/games/wnba/team/${teamId}`, {
        params: {
          season,
        },
      });

      const rawGames: BasketballGame[] = res.data.response || [];

      // ✅ Just return raw API response
      setGames(rawGames);
    } catch (err: any) {
      console.error("Error fetching WNBA team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, season]);
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refreshGames = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refreshGames };
}
