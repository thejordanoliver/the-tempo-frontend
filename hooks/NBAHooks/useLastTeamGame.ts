import { useCallback, useEffect, useRef, useState } from "react";
import { Game } from "types/nba";
import { apiClient } from "utils/apiClient";
import { getNBASeason } from "utils/dateUtils";

export function useLastTeamGame(
  teamId: string | number | null | undefined,
  isActive: boolean = true,
) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const season = getNBASeason();
  const cacheRef = useRef<Map<string, Game | null>>(new Map());

  const fetchLastGame = useCallback(async () => {
    if (!isActive || !teamId) {
      setLoading(false);
      return;
    }

    const cacheKey = `${teamId}-${season}`;

    if (cacheRef.current.has(cacheKey)) {
      setGame(cacheRef.current.get(cacheKey) ?? null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<{ game?: Game | null }>(
        `api/games/nba/last/${teamId}/${season}`,
      );

      const raw = res.data?.game ?? null;

      cacheRef.current.set(cacheKey, raw);
      setGame(raw);
    } catch (err: any) {
      console.error("Error fetching last team game:", err);
      setError(err?.message || "Failed to fetch last game");
      setGame(null);
    } finally {
      setLoading(false);
    }
  }, [teamId, season, isActive]);

  useEffect(() => {
    if (!isActive || !teamId) {
      setLoading(false);
      return;
    }

    fetchLastGame();
  }, [teamId, season, isActive, fetchLastGame]);

  return {
    game,
    loading,
    error,
    refresh: fetchLastGame,
  };
}