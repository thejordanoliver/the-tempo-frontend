import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Game } from "types/types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export function useSeasonGames(season: string) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheRef = useRef<Map<string, Game[]>>(new Map());

  const refreshGames = async () => {
    try {
      setLoading(true);
      setError(null);

      if (cacheRef.current.has(season)) {
        setGames(cacheRef.current.get(season)!);
        return;
      }

      const res = await axios.get(`${API_BASE}/api/games/season/${season}`);

      const seasonGames = res.data?.games ?? [];

      cacheRef.current.set(season, seasonGames);
      setGames(seasonGames);
    } catch (err: any) {
      console.error("[useSeasonGames] error:", err);
      const message = err?.message || "Failed to load season games";
      setError(new Error(message));
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGames();
  }, [season]);

  return { games, loading, error, refreshGames };
}
