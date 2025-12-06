import { MLBGame } from "types/mlb";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useMLBTeamGames(
  teamId: string | number,
  season = "2023",
  league = "1",
  fetchAll = false
) {
  const [games, setGames] = useState<MLBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/gamesMLB/team/${teamId}`, {
        params: { season, league, all: fetchAll ? 1 : 0 },
      });

      // Backend returns { teamId, season, games: [] }
      const data = res.data;

      const normalizedGames =
        data.games ||
        data.response || // in case older versions
        [];


      setGames(normalizedGames);
    } catch (err: any) {
      console.error("Error fetching MLB team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, season, league, fetchAll]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refreshGames: fetchGames };
}
