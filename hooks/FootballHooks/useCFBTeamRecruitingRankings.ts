import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export type CFBRecruitTeamRankingType = "composite" | "overall" | "transfer" | string;
export type CFBRecruitTeamRankingSource = "247sports" | string;

export interface CFBRecruitTeamRanking {
  id: number;
  year: number;
  sport: string;
  ranking_type: CFBRecruitTeamRankingType;
  source: CFBRecruitTeamRankingSource;
  rank: number;
  previous_rank: number | null;
  team_name: string;
  team_slug: string | null;
  team_url: string | null;
  commits_url: string | null;
  total_commits: number;
  five_stars: number;
  four_stars: number;
  three_stars: number;
  average_rating: string | number | null;
  points: string | number | null;
  source_url: string | null;
  updated_at: string | null;
  team_id: number | null;
}

export interface UseCFBTeamRecruitingRankingsResult {
  rankings: CFBRecruitTeamRanking[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getRankingByTeamId: (teamId: number | string | null | undefined) => CFBRecruitTeamRanking | undefined;
  getRankingByTeamName: (teamName: string | null | undefined) => CFBRecruitTeamRanking | undefined;
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error;

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.error === "string"
  ) {
    return new Error((error as any).response.data.error);
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as any).message === "string"
  ) {
    return new Error((error as any).message);
  }

  return new Error("Failed to load CFB team recruiting rankings");
}

function normalizeTeamName(value: string | null | undefined) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function useCFBTeamRecruitingRankings(
  year: number | string | null | undefined,
): UseCFBTeamRecruitingRankingsResult {
  const [rankings, setRankings] = useState<CFBRecruitTeamRanking[]>([]);
  const [loading, setLoading] = useState(Boolean(year));
  const [error, setError] = useState<Error | null>(null);

  const fetchRankings = useCallback(async () => {
    if (!year) {
      setRankings([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await apiClient.get<CFBRecruitTeamRanking[]>(
        `api/recruits/football/team/${year}`,
      );

      setRankings(Array.isArray(data) ? data : []);
    } catch (err) {
      setRankings([]);
      setError(toError(err));
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const rankingsByTeamId = useMemo(() => {
    const map = new Map<number, CFBRecruitTeamRanking>();

    for (const ranking of rankings) {
      if (ranking.team_id !== null && ranking.team_id !== undefined) {
        map.set(Number(ranking.team_id), ranking);
      }
    }

    return map;
  }, [rankings]);

  const rankingsByTeamName = useMemo(() => {
    const map = new Map<string, CFBRecruitTeamRanking>();

    for (const ranking of rankings) {
      map.set(normalizeTeamName(ranking.team_name), ranking);
    }

    return map;
  }, [rankings]);

  const getRankingByTeamId = useCallback(
    (teamId: number | string | null | undefined) => {
      if (teamId === null || teamId === undefined || teamId === "") {
        return undefined;
      }

      return rankingsByTeamId.get(Number(teamId));
    },
    [rankingsByTeamId],
  );

  const getRankingByTeamName = useCallback(
    (teamName: string | null | undefined) => {
      const normalized = normalizeTeamName(teamName);
      if (!normalized) return undefined;

      return rankingsByTeamName.get(normalized);
    },
    [rankingsByTeamName],
  );

  return {
    rankings,
    loading,
    error,
    refetch: fetchRankings,
    getRankingByTeamId,
    getRankingByTeamName,
  };
}