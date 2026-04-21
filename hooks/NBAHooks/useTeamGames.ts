import { useEffect, useState } from "react";
import { Game } from "types/nba";
import { apiClient } from "utils/apiClient";
import { getNBASeason } from "utils/dateUtils";

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

export function useTeamGames(teamId?: string, season = getNBASeason()) {
  const [games, setGames] = useState<GameWithStatusText[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGames = async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get(`api/games/nba/team/${teamId}/${season}`);

      setGames(res.data.games ?? []);
    } catch (err: any) {
      console.error("[useTeamGames] error:", err);
      const message = err?.message || "Failed to load team games";
      setError(new Error(message));
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [teamId, season]);

  return {
    games,
    loading,
    error,
    refreshGames: fetchGames, // manual refresh still works
  };
}
