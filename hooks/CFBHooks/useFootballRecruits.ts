import axios from "axios";
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface RecruitOffer {
  visit: string | null;
  school: string;
  status: string | null;
  hasOffer: boolean;
  signedDate: string | null; // JSON shows "(12/5/2025)" as string
}

export interface FootballRecruit {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  short_name: string;
  profile_url: string;
  high_school: string;
  hometown: string;
  position: string;
  height: string | null;
  weight: string | null;
  score: string;
  stars: number;
  national_rank: string;
  position_rank: string;
  state_rank: string;
  committed: boolean;
  signed: boolean;
  predicted: boolean;
  projected_school: string | null;
  predicted_school: string | null;
  prediction_percentage: string | null;
  image_url: string | null;
  committed_team_id: number;
  predicted_team_id: number;
  projected_team_id: number;
  offers: RecruitOffer[];
}

interface UseFootballRecruitsResult {
  data: FootballRecruit[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}


export function useFootballRecruits(year: number): UseFootballRecruitsResult {
  const [data, setData] = useState<FootballRecruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    if (!year) return;

    const controller = new AbortController();

    async function fetchRecruits() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get<FootballRecruit[]>(
          `api/recruits/football/${year}`,
          { signal: controller.signal },
        );

        setData(res.data);
      } catch (err: any) {
        if (err.name === "CanceledError") return;

        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load recruits",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRecruits();

    return () => controller.abort();
  }, [year, reloadKey]);

  return { data, loading, error, refetch };
}
