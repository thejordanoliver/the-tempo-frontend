// hooks/FootballHooks/useDepthCharts.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export type DepthChartLeague = "nfl" | "nba";

export type DepthChartPositionInfo = {
  id: number | null;
  name: string | null;
  displayName: string | null;
  abbreviation: string | null;
  leaf: boolean | null;
  ref: string | null;
  parentRef: string | null;
};

export type DepthChartAthletePosition = {
  id: number | null;
  name: string | null;
  displayName: string | null;
  abbreviation: string | null;
};

export type DepthChartAthleteDraft = {
  year: number | null;
  round: number | null;
  number: number | null;
};

export type DepthChartAthleteBirthPlace = {
  city: string | null;
  state: string | null;
  country: string | null;
  display: string | null;
};

export type DepthChartAthleteSource = "players" | "nfl_players" | "espn" | string;

export type DepthChartAthlete = {
  id: number | null;
  espnId?: number | null;
  dbId?: number | null;
  playerId?: number | null;
  source?: DepthChartAthleteSource | null;

  uid: string | null;
  guid: string | null;

  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  displayName: string | null;
  shortName: string | null;

  jersey: string | null;
  position: DepthChartAthletePosition | null;

  height: string | null;
  weight: string | null;
  age: number | null;
  dateOfBirth: string | null;

  active: boolean | null;
  headshot: string | null;
  athleteRef: string | null;

  college?: string | null;
  teamId?: number | null;
  experience?: number | null;
  draft?: DepthChartAthleteDraft | null;

  nbaApiId?: number | null;

  birthPlace?: DepthChartAthleteBirthPlace | null;
  groupName?: string | null;

  error?: string;
};

export type DepthChartAthleteEntry = {
  slot: number | null;
  rank: number | null;
  athleteId: number | null;
  athleteRef: string | null;
  athlete: DepthChartAthlete | null;
};

export type DepthChartPosition = {
  key: string;
  slot: number | null;
  position: DepthChartPositionInfo | null;
  athletes: DepthChartAthleteEntry[];
};

export type DepthChartInfo = {
  id: number | null;
  name: string | null;
  positions: DepthChartPosition[];
};

export type DepthChartsResponse = {
  league: DepthChartLeague;
  season: number;
  teamId: number;
  count: number;
  pageIndex: number | null;
  pageSize: number | null;
  pageCount: number | null;
  depthCharts: DepthChartInfo[];
};

type UseDepthChartsOptions = {
  league?: DepthChartLeague;
  season?: number | string | null;
  resolveAthletes?: boolean;
  enabled?: boolean;
};

type UseDepthChartsReturn = {
  depthCharts: DepthChartInfo[];
  data: DepthChartsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  offensiveChart: DepthChartInfo | null;
  defensiveChart: DepthChartInfo | null;
  specialTeamsChart: DepthChartInfo | null;

  depthChart: DepthChartInfo | null;
  positions: DepthChartPosition[];
  positionsByKey: Record<string, DepthChartPosition>;

  pointGuard: DepthChartPosition | null;
  shootingGuard: DepthChartPosition | null;
  smallForward: DepthChartPosition | null;
  powerForward: DepthChartPosition | null;
  center: DepthChartPosition | null;
};

function isDefenseChart(chart: DepthChartInfo) {
  const name = chart.name?.toLowerCase() ?? "";

  return (
    name.includes("base") ||
    name.includes("nickel") ||
    name.includes("dime") ||
    name.includes("defense") ||
    name === "d" ||
    name.startsWith("d ")
  );
}

function isSpecialTeamsChart(chart: DepthChartInfo) {
  const name = chart.name?.toLowerCase() ?? "";
  return name.includes("special");
}

function isOffenseChart(chart: DepthChartInfo) {
  return !isDefenseChart(chart) && !isSpecialTeamsChart(chart);
}

function getPositionByKey(
  positions: DepthChartPosition[],
  key: string
): DepthChartPosition | null {
  return (
    positions.find(
      (position) => position.key?.toLowerCase() === key.toLowerCase()
    ) ?? null
  );
}

export function useDepthCharts(
  teamId: number | string | null | undefined,
  options: UseDepthChartsOptions = {}
): UseDepthChartsReturn {
  const {
    league = "nfl",
    season,
    resolveAthletes = true,
    enabled = true,
  } = options;

  const [data, setData] = useState<DepthChartsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = Boolean(enabled && teamId);

  const url = useMemo(() => {
    if (!teamId) return null;

    const params = new URLSearchParams();

    if (season) {
      params.append("season", String(season));
    }

    params.append("resolveAthletes", String(resolveAthletes));

    return `api/depth/${league}/teams/${teamId}?${params.toString()}`;
  }, [teamId, league, season, resolveAthletes]);

  const fetchDepthCharts = useCallback(async () => {
    if (!url || !canFetch) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<DepthChartsResponse>(url);

      setData(response.data);
    } catch (err: any) {
      console.error("useDepthCharts error:", err?.response?.data || err);

      setError(
        err?.response?.data?.details ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to fetch depth charts"
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, canFetch]);

  useEffect(() => {
    fetchDepthCharts();
  }, [fetchDepthCharts]);

  const depthCharts = useMemo(() => {
    return data?.depthCharts ?? [];
  }, [data?.depthCharts]);

  /**
   * NFL chart helpers
   */
  const offensiveChart = useMemo(() => {
    if (league !== "nfl") return null;
    return depthCharts.find(isOffenseChart) ?? null;
  }, [depthCharts, league]);

  const defensiveChart = useMemo(() => {
    if (league !== "nfl") return null;
    return depthCharts.find(isDefenseChart) ?? null;
  }, [depthCharts, league]);

  const specialTeamsChart = useMemo(() => {
    if (league !== "nfl") return null;
    return depthCharts.find(isSpecialTeamsChart) ?? null;
  }, [depthCharts, league]);

  /**
   * General / NBA chart helpers
   */
  const depthChart = useMemo(() => {
    return depthCharts[0] ?? null;
  }, [depthCharts]);

  const positions = useMemo(() => {
    return depthChart?.positions ?? [];
  }, [depthChart]);

  const positionsByKey = useMemo(() => {
    return positions.reduce<Record<string, DepthChartPosition>>(
      (acc, position) => {
        if (position.key) {
          acc[position.key.toLowerCase()] = position;
        }

        return acc;
      },
      {}
    );
  }, [positions]);

  const pointGuard = useMemo(() => {
    return getPositionByKey(positions, "pg");
  }, [positions]);

  const shootingGuard = useMemo(() => {
    return getPositionByKey(positions, "sg");
  }, [positions]);

  const smallForward = useMemo(() => {
    return getPositionByKey(positions, "sf");
  }, [positions]);

  const powerForward = useMemo(() => {
    return getPositionByKey(positions, "pf");
  }, [positions]);

  const center = useMemo(() => {
    return getPositionByKey(positions, "c");
  }, [positions]);

  return {
    depthCharts,
    data,
    loading,
    error,
    refetch: fetchDepthCharts,

    offensiveChart,
    defensiveChart,
    specialTeamsChart,

    depthChart,
    positions,
    positionsByKey,

    pointGuard,
    shootingGuard,
    smallForward,
    powerForward,
    center,
  };
}

export default useDepthCharts;