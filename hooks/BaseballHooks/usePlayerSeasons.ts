import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

// ---------- Shared stat types ----------

export type MlbStatValue = string | number | null | undefined;

export type MlbStatMap = Record<string, MlbStatValue>;

export interface MlbStatMeta {
  label?: string | null;
  displayName?: string | null;
  description?: string | null;
}

export interface MlbStatCategory {
  name?: string | null;
  key?: string | null;
  displayName?: string | null;
  sortKey?: string | null;
  statCategory?: string | null;
  stats?: MlbStatMap;
  meta?: Record<string, MlbStatMeta>;
}

export interface MlbSeasonStatsRow {
  season: number;
  displaySeason?: string | null;
  seasonType?: number | null;
  seasonTypeName?: string | null;

  teamId?: string | number | null;
  espnTeamId?: string | number | null;
  teamSlug?: string | null;
  position?: string | null;

  totals?: MlbStatMap;
  averages?: MlbStatMap;

  categories?: Record<string, MlbStatCategory>;

  careerBatting?: MlbStatMap;
  expandedBatting?: MlbStatMap;
  advancedBatting?: MlbStatMap;
  fielding?: MlbStatMap;
  pitching?: MlbStatMap;

  miscellaneous?: {
    statMeta?: Record<string, Record<string, MlbStatMeta>>;
    categoryMeta?: Record<string, Partial<MlbStatCategory>>;
  };
}

export interface MlbPlayerResponse {
  id: number;
  team_id: number | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  short_name?: string | null;
  height?: string | null;
  weight?: number | null;
  birth_date?: string | null;
  debut_year?: number | null;
  experience?: number | null;
  birth_city?: string | null;
  birth_country?: string | null;
  birth_display?: string | null;
  position: string | null;
  jersey_number: string | null;
  headshot_url?: string | null;
  active?: boolean | null;

  season_stats?: MlbSeasonStatsRow[];
  seasonStats?: MlbSeasonStatsRow[];
  careerStats?: MlbSeasonStatsRow[];
  seasons?: MlbSeasonStatsRow[];
}

export interface CareerTotals {
  g: number;
  gs: number;

  // Batting
  ab: number;
  h: number;
  doubles: number;
  triples: number;
  hr: number;
  rbi: number;
  bb: number;
  so: number;
  hbp: number;
  sf: number;
  totalBases: number;

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

// ---------- Helpers ----------

function isValidSeasonRow(row: unknown): row is MlbSeasonStatsRow {
  if (!row || typeof row !== "object") return false;

  const candidate = row as MlbSeasonStatsRow;

  return Number.isFinite(Number(candidate.season));
}

function normalizeSeasonRows(data: MlbPlayerResponse | null): MlbSeasonStatsRow[] {
  if (!data) return [];

  /**
   * Your response currently has:
   * - season_stats: []
   * - seasonStats: []
   * - careerStats: actual stat rows + empty objects
   *
   * So this picks the first array that actually contains valid season rows.
   */
  const possibleSources = [
    data.seasonStats,
    data.season_stats,
    data.careerStats,
    data.seasons,
  ];

  const source =
    possibleSources.find(
      (rows) => Array.isArray(rows) && rows.some(isValidSeasonRow),
    ) ?? [];

  return source
    .filter(isValidSeasonRow)
    .sort((a, b) => Number(b.season) - Number(a.season));
}

// ---------- Hook ----------

export function usePlayerSeasons(playerId: number | string | null) {
  const [data, setData] = useState<MlbPlayerResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerSeasons = useCallback(async () => {
    if (!playerId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<MlbPlayerResponse>(
        `api/player/stats/mlb/${playerId}`,
      );

      setData(response.data);
    } catch (err) {
      console.error("❌ MLB hook error:", err);

      const axiosError = err as AxiosError;

      if (axiosError.response) {
        setError(`Server Error: ${axiosError.response.status}`);
      } else if (axiosError.request) {
        setError("Network error. Check your connection.");
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayerSeasons();
  }, [fetchPlayerSeasons]);

  const seasons = useMemo(() => normalizeSeasonRows(data), [data]);

  return {
    data,
    seasons,
    seasonStatsFlattened: seasons,
    careerStatsFlattened: seasons,
    loading,
    error,
    refetch: fetchPlayerSeasons,
  };
}