import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { MLBGame } from "types/mlb";

import { BASE_URL } from "utils/apiClient";

export function useMLBTeamGames(teamId: string | number, season = "2026") {
  const [games, setGames] = useState<MLBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/games/mlb/team/${teamId}`, {
        params: { season },
      });

      const data = res.data;

      const normalizedGames = data.games || data.response || [];

      setGames(normalizedGames);
    } catch (err: any) {
      console.error("Error fetching MLB team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, season]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refreshGames: fetchGames };
}
