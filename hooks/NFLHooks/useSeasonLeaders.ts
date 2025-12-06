import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export interface Leader {
  value: number;
  displayValue: string;
  athleteId: string | number;
  name: string;
  position?: string;
  headshot?: string;

  teamId?: string | number;
  teamName?: string;
  teamAbbrev?: string;
  teamLogo?: string;

  stats?: any;
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

/**
 * UNIVERSAL SEASON LEADERS HOOK
 * Supports: NFL, CFB, MLB, CBB
 *
 * @param season e.g. 2025
 * @param league "NFL" | "CFB" | "MLB" | "CBB"
 */
export function useSeasonLeaders(
  season: number,
  league: "NFL" | "CFB" | "MLB" | "CBB" = "NFL"
): SeasonLeaderResult {
  const [categories, setCategories] = useState<LeaderCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert league to backend route
      const leaguePath = league.toLowerCase();

      const res = await axios.get(
        `${API_BASE}/api/${leaguePath}/leaders?season=${season}`
      );

      setCategories(res.data.categories || []);
    } catch (err: any) {
      console.error(`${league} Leader Error:`, err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [season, league]);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  return {
    categories,
    loading,
    error,
    refresh: fetchLeaders,
  };
}
