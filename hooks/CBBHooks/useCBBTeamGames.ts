import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { BasketballGame } from "types/types";
import { apiClient } from "utils/apiClient";
import { getCBBSeason } from "utils/dateUtils";

type UseTeamGamesOptions = {
  season?: string;
};

export function useCBBTeamGames(
  teamId: string | number,
  league: string,
  { season = getCBBSeason() }: UseTeamGamesOptions = {},
) {
  const [games, setGames] = useState<BasketballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(
        `/api/games/cbb/team/${teamId}`,
        {
          params: {
            season,
            league,
          },
        },
      );

      const rawGames: BasketballGame[] = res.data.response || [];

      setGames(rawGames);
    } catch (err: any) {
      console.error("Error fetching CBB team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, season, league]);
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refreshGames = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refreshGames };
}
