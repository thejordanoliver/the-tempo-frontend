import { useEffect, useState, useCallback } from "react";

export interface Recruit {
  rank: string;
  name: string;
  position: string;
  hometown: string;
  school: string;
  height: string | null;
  weight: string | null;
  stars: number | null;
  rating: string | null;
  profileUrl: string | null;
  commitSchool: string | null;
  commitStatus: string | null;
  commitDate: string | null;
  commitSchoolId: string | null;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? ""; // safety fallback

export interface UseRecruitsOptions {
  year?: number;
  limit?: number;
  teamId?: string | number;
  teamName?: string;
}

export function useRecruits(options: UseRecruitsOptions = {}) {
  const { year, limit, teamId, teamName } = options;

  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();

      if (year) params.append("year", String(year));
      if (limit) params.append("limit", String(limit));
      if (teamId) params.append("teamId", String(teamId));
      if (teamName) params.append("teamName", teamName);

      const url = `${BASE_URL}/api/recruits${params.toString() ? `?${params.toString()}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.recruits)) {
        throw new Error("Invalid response structure");
      }

      setRecruits(data.recruits);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [year, limit, teamId, teamName]);

  useEffect(() => {
    fetchRecruits();
  }, [fetchRecruits]);

  return {
    recruits,
    loading,
    error,
    refresh: fetchRecruits,
  };
}
