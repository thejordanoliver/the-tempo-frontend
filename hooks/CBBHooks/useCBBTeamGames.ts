import { useCallback, useEffect, useState } from "react";
import { CBBGame } from "types/types";
import { apiClient } from "utils/apiClient";
import { getCBBSeason } from "utils/dateUtils";

type UseTeamGamesOptions = {
  season?: string;
};

export function useCBBTeamGames(
  teamId: string | number,
  { season = getCBBSeason() }: UseTeamGamesOptions = {},
) {
  const [games, setGames] = useState<CBBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`/api/games/cbb/team/${teamId}`, {
        params: {
          season,
        },
      });

      const rawGames: CBBGame[] = res.data.response || [];

      setGames(rawGames);
    } catch (err: any) {
      console.error("Error fetching CBB team games:", err.message);
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
