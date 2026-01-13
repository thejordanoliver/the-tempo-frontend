import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Game } from "types/types";

export type GameWithStatusText = Game & {
  statusText: string;
  arena?: {
    name: string;
    city: string;
    state: string;
  } | null;
  year: number;
  month: number;
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export function useTeamGames(teamId?: string, season = "2025") {
  const [games, setGames] = useState<GameWithStatusText[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchGames = async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${API_BASE}/api/games/team/${teamId}/${season}`
      );

      setGames(res.data.games ?? []);
    } catch (err: any) {
      console.error("[useTeamGames] error:", err);
      setError("Failed to load team games");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshLiveGames = () => {
    setGames((prev) =>
      prev.map((g) => ({ ...g })) // backend handles freshness
    );
  };

  useEffect(() => {
    fetchGames();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(refreshLiveGames, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [teamId, season]);

  return {
    games,
    loading,
    error,
    refreshGames: fetchGames,
  };
}
