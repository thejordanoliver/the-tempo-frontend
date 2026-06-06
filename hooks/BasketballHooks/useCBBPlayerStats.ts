// hooks/CBBHooks/useCBBPlayerStats.ts
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

/* ----------------------------------
   TYPES
---------------------------------- */

export interface CBBSeasonTotals {
  season: string;
  team: string;
  min: number;
  fg?: string | null;
  gp: number | null;
  gs: number | null;
  fgPct?: number | null;
  three?: string | null;
  threePct?: number | null;
  ft?: string | null;
  ftPct?: number | null;
  reb?: number | null;
  ast?: number | null;
  blk?: number | null;
  stl?: number | null;
  pf?: number | null;
  to?: number | null;
  pts?: number | null;
}

export interface CBBPlayerStatsResponse {
  playerId: string;
  league: "CBB" | "WCBB";
  name: string | null;
  team: string | null;
  teamId: string | null;
  seasonTotals: CBBSeasonTotals[];
}

/**
 * @param playerId ESPN player ID
 * @param league "CBB" | "WCBB" (default: "CBB")
 */
export function useCBBPlayerStats(
  playerId: string | number,
  league: "CBB" | "WCBB" = "CBB",
) {
  const [data, setData] = useState<CBBPlayerStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const leagueParam = league === "WCBB" ? "wcbb" : "cbb";

      const url = `api/cbb-stats/player/${playerId}?league=${leagueParam}`;

      const res = await apiClient.get<CBBPlayerStatsResponse>(url);

      // 🔒 Defensive cleanup (filters empty rows)
      const cleaned = {
        ...res.data,
        seasonTotals: (res.data.seasonTotals || []).filter(
          (row) => row && row.season,
        ),
      };

      setData(cleaned);
    } catch (err: any) {
      console.error("❌ CBB/WCBB Player Stats Error:", err);
      setError(err?.message ?? "Failed to load player stats");
    } finally {
      setLoading(false);
    }
  }, [playerId, league]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
}
