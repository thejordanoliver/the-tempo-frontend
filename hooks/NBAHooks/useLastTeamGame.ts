import axios from "axios";
import { useEffect, useRef, useState } from "react";
import type { Game } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useLastTeamGame(
  teamId: string | number,
  season: string | number = "2025"
) {
  const [lastGame, setLastGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple in-memory cache to avoid duplicate requests
  const cacheRef = useRef<Map<string, Game | null>>(new Map());

  const fetchLastGame = async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    const cacheKey = `${teamId}-${season}`;
    if (cacheRef.current.has(cacheKey)) {
      setLastGame(cacheRef.current.get(cacheKey)!);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get<{ success: boolean; game: Game | null }>(
        `${BASE_URL}/api/games/nba/last/${teamId}/${season}`
      );

      const game = res.data.game ?? null;

      // Cache and set state
      cacheRef.current.set(cacheKey, game);
      setLastGame(game);
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
