// hooks/CBBHooks/useCBBPlayerStats.ts
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export interface CBBSeasonStats {
  season: string;
  gp: number | null;
  min: number | null;
  fgPct: number | null;
  threePct: number | null;
  ftPct: number | null;
  reb: number | null;
  ast: number | null;
  blk: number | null;
  stl: number | null;
  pf: number | null;
  to: number | null;
  pts: number | null;
}

export interface CBBPlayerStatsResponse {
  playerId: string;
  name: string | null;
  team: string | null;
  teamId: string | null;
  seasons: CBBSeasonStats[];
  currentSeason: CBBSeasonStats | null;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export function useCBBPlayerStats(playerId: string | number) {
  const [data, setData] = useState<CBBPlayerStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const url = `${BASE_URL}/api/cbb-stats/player/${playerId}`;

      const res = await axios.get<CBBPlayerStatsResponse>(url);

      setData(res.data);
    } catch (err: any) {
      console.error("❌ CBB Player Stats Error:", err);
      setError(err?.message ?? "Failed to load player stats");
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}
