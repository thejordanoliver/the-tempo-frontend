// hooks/NFLHooks/useFootballSeasonGames.ts
import { useCallback, useEffect, useState } from "react";
import { FootballGame } from "types/football";
import { apiClient } from "utils/apiClient";

export function useFootballGamesByWeek(season: number, league: number) {
  const [weeks, setWeeks] = useState<Record<string, FootballGame[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeasonGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get(
        `api/games/football/weeks/${season}/${league}`,
      );

      // ✅ Use weeks as returned by backend
      setWeeks(res.data?.weeks || {});
    } catch (err: any) {
      console.error("Error fetching Football season games:", err.message);
      setError(err.message || "Failed to fetch Football season games");
    } finally {
      setLoading(false);
    }
  }, [season, league]);

  useEffect(() => {
    fetchSeasonGames();
  }, [fetchSeasonGames]);

  return { weeks, loading, error, refetch: fetchSeasonGames };
}
