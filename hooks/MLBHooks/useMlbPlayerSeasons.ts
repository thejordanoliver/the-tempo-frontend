// hooks/useMlbPlayerSeasons.ts
import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

// ---------- Types ----------

export interface MlbSeason {
  season: number;
  displaySeason: string | null;
  teamId: number | null;
  teamSlug: string | null;
  position: string | null;
  stats: Record<string, unknown>;
  lastUpdated: string;
}

export interface MlbPlayerResponse {
  id: number;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  jersey_number: string | null;
  team_id: number | null;
  seasons: MlbSeason[];
}

export interface CareerTotals {
  g: number;
  gs: number;

  // Batting
  ab: number;
  h: number;
  hr: number;
  rbi: number;
  bb: number;
  so: number;
  hbp: number;

  // Pitching
  w: number;
  l: number;
  ip: number;
  earnedRuns: number;
  hitsAllowed: number;
  runsAllowed: number;
  war: number;
  whip: number;

  // Fielding
  fullInningsPlayed: number;
  totalChances: number;
  pickoffs: number;
  assists: number;
  errors: number;
  doublePlays: number;
  fieldingPct: number;
  rangeFactor: number;
  passedBalls: number;
  catcherStolenBasesAllowed: number;
  catcherCaughtStealing: number;
  catcherCaughtStealingPct: number;
  catcherERA: number;
  defWARBR: number;
}

// ---------- Hook ----------

export function useMLBPlayerSeasons(playerId: number | string | null) {
  const [data, setData] = useState<MlbPlayerResponse | null>(null);
  const [seasons, setSeasons] = useState<MlbSeason[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch player seasons from API
  const fetchPlayerSeasons = useCallback(async () => {
    if (!playerId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<MlbPlayerResponse>(
        `api/players/mlb/${playerId}/seasons`,
      );

      setData(response.data);
      setSeasons(response.data.seasons ?? []);
    } catch (err) {
      console.error("❌ MLB hook error:", err);

      const axiosError = err as AxiosError;

      if (axiosError.response) {
        // Server responded with a status outside 2xx
        setError(`Server Error: ${axiosError.response.status}`);
      } else if (axiosError.request) {
        // Request was made but no response
        setError("Network error. Check your connection.");
      } else {
        // Something else happened
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  // Fetch on mount or when playerId changes
  useEffect(() => {
    fetchPlayerSeasons();
  }, [fetchPlayerSeasons]);

  return {
    data,
    seasons,
    loading,
    error,
    refetch: fetchPlayerSeasons,
  };
}
