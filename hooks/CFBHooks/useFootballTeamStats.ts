import axios from "axios";
import { useEffect, useState } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useFootballTeamStats(gameId: string | number) {
  const [stats, setStats] = useState<any[]>([]); // always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = typeof gameId === "string" ? parseInt(gameId, 10) : gameId;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${BASE_URL}/api/football/details/team/statistics`, {
          params: { gameId: id },
        });
        setStats(data.games || []); // now always an array
      } catch (err: any) {
        setError(err.message || "Failed to fetch team stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [gameId]);

  return { stats, loading, error };
}