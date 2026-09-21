import { SoccerGame } from "@/types/soccer/soccer";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

interface UseTeamGamesReturn {
  games: SoccerGame[];
  loading: boolean;
  error: string | null;
  refreshGames: () => Promise<void>;
}

export function useSoccerTeamGames(
  teamId: string | number | null,
  league: string,
  season?: number | string,
): UseTeamGamesReturn {
  const [games, setGames] = useState<SoccerGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchGames = useCallback(async () => {
    if (!teamId || !league) return;
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {};

      if (season) {
        params.season = season;
      }

      const res = await apiClient.get(
        `/api/games/soccer/team/${league}/${teamId}/${season}`,
      );

      const rawGames: SoccerGame[] = res.data?.games || [];

      if (requestId === requestIdRef.current) {
        setGames(rawGames);
      }
    } catch (err: any) {
      if (requestId !== requestIdRef.current) return;
      console.error("Error fetching soccer team games:", err?.message || err);
      setError("Failed to load team games");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [teamId, league, season]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchGames();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
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
