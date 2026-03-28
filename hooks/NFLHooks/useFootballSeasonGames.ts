// hooks/NFLHooks/useFootballSeasonGames.ts
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Game } from "types/nfl";

import { BASE_URL } from "utils/apiClient";

export function useFootballSeasonGames(season: number, league: number) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeasonGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${BASE_URL}/api/games/football/season/${season}/${league}`,
        {
          params: { league, season },
        },
      );

      // ✅ RAW response only
      setGames(res.data?.games || []);
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

  return { games, loading, error, refetch: fetchSeasonGames };
}
