import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NHLGame } from "types/nhl";

import { BASE_URL } from "utils/apiClient";

export function useNHLTeamGames(
  teamId: string | number,

  fetchAll = false,
) {
  const [games, setGames] = useState<NHLGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/games/nhl/team/${teamId}`);

      const data = res.data;

      const normalizedGames = data;

      setGames(normalizedGames);
    } catch (err: any) {
      console.error("Error fetching NHL team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, fetchAll]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refreshGames: fetchGames };
}
