import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

/* ----------------------------- Types ----------------------------- */

export interface Leader {
  playerId: number;
  value: number;
  rank: number;
  displayValue: string;
  athleteId: string | number;
  name: string;
  position?: string;
  headshot?: string;
  shortName: string;
  teamId?: string | number;
  teamName?: string;
  teamAbbrev?: string;
  teamLogo?: string;
  espnId?: string | number;
}

export interface LeaderCategory {
  categoryName: string;
  shortName: string;
  abbreviation: string;
  leaders: Leader[];
}

interface SeasonLeaderResult {
  categories: LeaderCategory[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/* ----------------------------- Hook ------------------------------ */

export function useSeasonLeaders(
  season: number,
  league: "NFL" | "NHL" | "CFB" | "MLB" | "WCBB" | "CBB" = "NFL",
): SeasonLeaderResult {
  const [categories, setCategories] = useState<LeaderCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Partial<Record<string, LeaderCategory[]>>>({});
  const cacheKey = `${league}:${season}`;

  const fetchLeaders = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && cacheRef.current[cacheKey]) {
        setCategories(cacheRef.current[cacheKey]!);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const leaguePath = league.toLowerCase();

        const res = await apiClient.get(
          `api/season-leaders/${leaguePath}/leaders`,
          { params: { season } },
        );

        const rawCategories: LeaderCategory[] = res.data.categories ?? [];

        // ✅ No enrichment — just cache + return
        cacheRef.current[cacheKey] = rawCategories;
        setCategories(rawCategories);
      } catch (err: any) {
        console.error(`❌ [${league}] Season Leaders Error:`, err);
        setError(err.message || "Failed to fetch leaders");
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, season, league],
  );

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  return {
    categories,
    loading,
    error,
    refresh: () => fetchLeaders(true),
  };
}
