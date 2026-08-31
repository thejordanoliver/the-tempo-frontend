// hooks/RecruitHooks/useRecruits.ts
import { Recruit } from "@/types/recruiting/players";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";


export interface RecruitPredictedSchool {
  team_id: number | null;
  team_name: string;
  team_title: string | null;
  percentage: number | null;
  confidence_score: number | null;
  confidence_text: string | null;
  matched_by?: string | null;
  href?: string | null;
  image_url?: string | null;
}


interface useRecruitsResult {
  data: Recruit[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
}

function parseJsonArray<T>(value: T[] | string | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizePredictedSchool(
  prediction: Partial<RecruitPredictedSchool>,
): RecruitPredictedSchool | null {
  const teamName =
    typeof prediction.team_name === "string" ? prediction.team_name.trim() : "";

  if (!teamName) {
    return null;
  }

  return {
    team_id:
      typeof prediction.team_id === "number" &&
      Number.isFinite(prediction.team_id)
        ? prediction.team_id
        : null,
    team_name: teamName,
    team_title: prediction.team_title ?? null,
    percentage:
      typeof prediction.percentage === "number" &&
      Number.isFinite(prediction.percentage)
        ? prediction.percentage
        : null,
    confidence_score:
      typeof prediction.confidence_score === "number" &&
      Number.isFinite(prediction.confidence_score)
        ? prediction.confidence_score
        : null,
    confidence_text: prediction.confidence_text ?? null,
    matched_by: prediction.matched_by ?? null,
    href: prediction.href ?? null,
    image_url: prediction.image_url ?? null,
  };
}

function normalizeRecruit(recruit: Recruit): Recruit {
  const predictedSchools = parseJsonArray<RecruitPredictedSchool>(
    recruit.predicted_schools,
  )
    .map(normalizePredictedSchool)
    .filter((prediction): prediction is RecruitPredictedSchool =>
      Boolean(prediction),
    );

  return {
    ...recruit,
    committed_team_id: recruit.committed_team_id ?? null,
    predicted_team_id: recruit.predicted_team_id ?? null,
    projected_team_id: recruit.projected_team_id ?? null,
    predicted_schools: predictedSchools,
  };
}

export function useAllRecruits(
  year: number,
  league: "cbb" | "cfb",
): useRecruitsResult {
  const [data, setData] = useState<Recruit[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruits = useCallback(
    async (isRefresh = false, signal?: AbortSignal) => {
      if (!year) {
        setData([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const res = await apiClient.get<Recruit[]>(
          `api/recruits/${league}/${year}`,
          { signal },
        );

        const recruits = Array.isArray(res.data)
          ? res.data.map(normalizeRecruit)
          : [];

        setData(recruits);
      } catch (err: any) {
        if (
          err?.name === "CanceledError" ||
          err?.code === "ERR_CANCELED" ||
          signal?.aborted
        ) {
          return;
        }

        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load recruits",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [year, league],
  );

  const refresh = useCallback(() => {
    return fetchRecruits(true);
  }, [fetchRecruits]);

  const refetch = useCallback(() => {
    return fetchRecruits(false);
  }, [fetchRecruits]);

  useEffect(() => {
    const controller = new AbortController();

    fetchRecruits(false, controller.signal);

    return () => controller.abort();
  }, [fetchRecruits]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
    refetch,
  };
}
