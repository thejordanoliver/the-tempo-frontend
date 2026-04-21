import { useEffect, useRef, useState } from "react";
import { Game } from "types/nba";
import { apiClient } from "utils/apiClient";

export function useLastTeamGame(
  teamId: string | number,
  season: string | number,
) {
  const [lastGame, setLastGame] = useState<Game | null>(null); // raw response
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, any | null>>(new Map());

  const fetchLastGame = async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    const cacheKey = `${teamId}-${season}`;

    // Return cached result if available
    if (cacheRef.current.has(cacheKey)) {
      setLastGame(cacheRef.current.get(cacheKey));
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get(`api/games/nba/last/${teamId}/${season}`);
      const raw = res.data?.game ?? null;

      cacheRef.current.set(cacheKey, raw);
      setLastGame(raw);
    } catch (err: any) {
      console.error("Error fetching last team game:", err);
      setError(err.message || "Failed to fetch last game");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teamId) return;
    fetchLastGame();
  }, [teamId, season]);

  return { lastGame, loading, error, refresh: fetchLastGame };
}
