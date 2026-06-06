import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

// ---------- Shared stat types ----------

export type NhlStatValue = string | number | null | undefined;

export type NhlStatMap = Record<string, NhlStatValue>;

export interface NhlStatMeta {
  label?: string | null;
  displayName?: string | null;
  description?: string | null;
}

export interface NhlStatCategory {
  name?: string | null;
  key?: string | null;
  displayName?: string | null;
  sortKey?: string | null;
  statCategory?: string | null;
  stats?: NhlStatMap;
  meta?: Record<string, NhlStatMeta>;
}

export type NhlPositionBucket =
  | "center"
  | "leftWing"
  | "rightWing"
  | "defense"
  | "defenseman"
  | "goalie"
  | "goaltending"
  | "skater"
  | "forward";

export interface NhlSeasonStatsRow {
  season: number;
  displaySeason?: string | null;
  seasonType?: number | null;
  seasonTypeName?: string | null;

  teamId?: string | number | null;
  espnTeamId?: string | number | null;
  teamSlug?: string | null;
  position?: string | null;

  totals?: NhlStatMap;
  averages?: NhlStatMap;

  center?: NhlStatMap;
  leftWing?: NhlStatMap;
  rightWing?: NhlStatMap;
  defense?: NhlStatMap;
  defenseman?: NhlStatMap;
  goalie?: NhlStatMap;
  goaltending?: NhlStatMap;
  skater?: NhlStatMap;
  forward?: NhlStatMap;

  categories?: Record<string, NhlStatCategory>;
  miscellaneous?: Record<string, unknown>;
}

export interface NhlPlayerResponse {
  id: string | number;
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

  season_stats?: NhlSeasonStatsRow[];
  seasonStats?: NhlSeasonStatsRow[];
  careerStats?: NhlSeasonStatsRow[];
  seasons?: NhlSeasonStatsRow[];
}

export interface NhlCareerTotals {
  games: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  penaltyMinutes: number;

  powerPlayGoals: number;
  powerPlayAssists: number;
  shortHandedGoals: number;
  shortHandedAssists: number;
  gameWinningGoals: number;
  shootoutGoals: number;

  shots: number;
  shootingPctTotal: number;
  shootingPctCount: number;

  timeOnIceSeconds: number;
  timeOnIceGames: number;
}

// Backward-compatible name if your NHL table imports CareerTotals.
export type CareerTotals = NhlCareerTotals;

// ---------- Helpers ----------

function isValidSeasonRow(row: unknown): row is NhlSeasonStatsRow {
  if (!row || typeof row !== "object") return false;

  const candidate = row as NhlSeasonStatsRow;

  return Number.isFinite(Number(candidate.season));
}

function normalizeSeasonRows(
  data: NhlPlayerResponse | null,
): NhlSeasonStatsRow[] {
  if (!data) return [];

  /**
   * Your NHL response currently has:
   * - season_stats: []
   * - seasonStats: []
   * - careerStats: real season rows
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

export function getNhlPositionBucket(
  position?: string | null,
): NhlPositionBucket {
  const normalized = String(position ?? "")
    .trim()
    .toUpperCase();

  switch (normalized) {
    case "C":
      return "center";
    case "LW":
      return "leftWing";
    case "RW":
      return "rightWing";
    case "D":
    case "DEF":
      return "defense";
    case "G":
    case "GK":
      return "goalie";
    default:
      return "skater";
  }
}

function isStatMap(value: unknown): value is NhlStatMap {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function getNhlSeasonStats(row: NhlSeasonStatsRow): NhlStatMap {
  const positionBucket = getNhlPositionBucket(row.position);

  const positionStats = row[positionBucket];

  if (isStatMap(positionStats)) {
    return positionStats;
  }

  if (isStatMap(row.totals)) {
    return row.totals;
  }

  const fallbackBuckets: NhlPositionBucket[] = [
    "center",
    "leftWing",
    "rightWing",
    "defense",
    "defenseman",
    "goalie",
    "goaltending",
    "skater",
    "forward",
  ];

  for (const bucket of fallbackBuckets) {
    const stats = row[bucket];

    if (isStatMap(stats)) {
      return stats;
    }
  }

  return {};
}

export function toNhlNumber(value: NhlStatValue) {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "--" ||
    value === "-"
  ) {
    return 0;
  }

  const parsed = Number(String(value).replace(/,/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseTimeToSeconds(value: NhlStatValue) {
  if (!value) return 0;

  const raw = String(value).trim();

  if (!raw.includes(":")) return 0;

  const [minutesRaw, secondsRaw] = raw.split(":");
  const minutes = Number(minutesRaw);
  const seconds = Number(secondsRaw);

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return 0;
  }

  return minutes * 60 + seconds;
}

export function formatSecondsToTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0:00";
  }

  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getNhlCareerTotals(
  seasons: NhlSeasonStatsRow[],
): NhlCareerTotals {
  return seasons.reduce<NhlCareerTotals>(
    (acc, season) => {
      const stats = getNhlSeasonStats(season);
      const games = toNhlNumber(stats.games);

      acc.games += games;
      acc.goals += toNhlNumber(stats.goals);
      acc.assists += toNhlNumber(stats.assists);
      acc.points += toNhlNumber(stats.points);
      acc.plusMinus += toNhlNumber(stats.plusMinus);
      acc.penaltyMinutes += toNhlNumber(stats.penaltyMinutes);

      acc.powerPlayGoals += toNhlNumber(stats.powerPlayGoals);
      acc.powerPlayAssists += toNhlNumber(stats.powerPlayAssists);
      acc.shortHandedGoals += toNhlNumber(stats.shortHandedGoals);
      acc.shortHandedAssists += toNhlNumber(stats.shortHandedAssists);
      acc.gameWinningGoals += toNhlNumber(stats.gameWinningGoals);
      acc.shootoutGoals += toNhlNumber(stats.shootoutGoals);

      acc.shots += toNhlNumber(stats.shots);

      const shootingPct = toNhlNumber(stats.shootingPct);

      if (shootingPct > 0) {
        acc.shootingPctTotal += shootingPct;
        acc.shootingPctCount += 1;
      }

      const toiSeconds = parseTimeToSeconds(stats.timeOnIcePerGame);

      if (toiSeconds > 0 && games > 0) {
        acc.timeOnIceSeconds += toiSeconds * games;
        acc.timeOnIceGames += games;
      }

      return acc;
    },
    {
      games: 0,
      goals: 0,
      assists: 0,
      points: 0,
      plusMinus: 0,
      penaltyMinutes: 0,

      powerPlayGoals: 0,
      powerPlayAssists: 0,
      shortHandedGoals: 0,
      shortHandedAssists: 0,
      gameWinningGoals: 0,
      shootoutGoals: 0,

      shots: 0,
      shootingPctTotal: 0,
      shootingPctCount: 0,

      timeOnIceSeconds: 0,
      timeOnIceGames: 0,
    },
  );
}

// ---------- Hook ----------

export function usePlayerSeasons(playerId: number | string | null) {
  const [data, setData] = useState<NhlPlayerResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerSeasons = useCallback(async () => {
    if (!playerId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<NhlPlayerResponse>(
        `api/player/stats/nhl/${playerId}`,
      );

      setData(response.data);
    } catch (err) {
      console.error("❌ NHL hook error:", err);

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

  const careerTotals = useMemo(() => getNhlCareerTotals(seasons), [seasons]);

  return {
    data,
    seasons,
    careerTotals,

    seasonStatsFlattened: seasons,
    careerStatsFlattened: seasons,

    loading,
    error,
    refetch: fetchPlayerSeasons,
  };
}
