import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient, BASE_URL } from "utils/apiClient";

export function useLastTeamGame(
  teamId: string | number,
  season?: string | number,
) {
  const [lastGame, setLastGame] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, any | null>>(new Map());

  const fetchLastGame = useCallback(async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);

      const cacheKey = `${teamId}-${season}`;

      // ✅ cache
      if (cacheRef.current.has(cacheKey)) {
        setLastGame(cacheRef.current.get(cacheKey)!);
        setLoading(false);
        return;
      }

      const { data } = await apiClient.get(
        `api/games/football/last/${teamId}/${season}`,
      );

      const game = data?.game ?? null;

      cacheRef.current.set(cacheKey, game);
      setLastGame(game);
    } catch (err: any) {
      console.error("Error fetching last game:", err.message);
      setError(err.message || "Failed to fetch last game");
    } finally {
      setLoading(false);
    }
  }, [teamId, season]);

  useEffect(() => {
    fetchLastGame();
  }, [fetchLastGame]);

  return {
    lastGame,
    loading,
    error,
    refresh: fetchLastGame,
  };
}
