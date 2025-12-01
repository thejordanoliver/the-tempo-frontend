import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";


export type CBBTeamPlayer = {
  rawName: string;
  firstName: string;
  lastName: string;
  position: string;
  espnId: string | null;
  stats: Record<string, number | null>;
};

export type CBBTeamStatsResponse = {
  teamId: string;
  teamName: string | null;
  headers: string[];
  players: CBBTeamPlayer[];
};

export function useCBBRosterStats(teamId?: string | number) {
  const [data, setData] = useState<CBBTeamStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);

      const url = `${BASE_URL}/api/cbb-stats/team/${teamId}`;
      // console.log("Fetching:", url);

      const res = await axios.get(url);
      setData(res.data);
    } catch (err: any) {
      console.error("CBB Team Stats Fetch Error:", err);
      setError("Failed to load team stats.");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}
