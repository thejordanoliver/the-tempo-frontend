import { apiClient } from "@/utils/apiClient";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { SeasonLeaderCategory } from "types/stats";

interface SeasonLeadersApiResponse {
  league: string;
  requestedLeague: string;
  requestedSeason: number;
  season: number;
  displaySeason: string;
  fallbackUsed: boolean;
  source: "database";
  seasonType: number;
  seasonTypeLabel: string;
  limit: number;
  categories: SeasonLeaderCategory[];
}

export function useSeasonLeaders({
  season,
  enabled = true,
}: {
  season: number | string;
  enabled?: boolean;
}) {
  const [categories, setCategories] = useState<SeasonLeaderCategory[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isCancelled = false;

    async function fetchLeaders() {
      setLoading(true);
      setError(null);

      try {
        const { data } = await apiClient.get<SeasonLeadersApiResponse>(
          "api/leaders/nba",
          { params: { season } },
        );

        if (isCancelled) {
          return;
        }

        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch (err) {
        if (isCancelled) {
          return;
        }

        setCategories([]);

        if (isAxiosError<{ error?: string }>(err)) {
          setError(err.response?.data?.error ?? err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void fetchLeaders();

    return () => {
      isCancelled = true;
    };
  }, [enabled, season]);

  return {
    categories,
    loading: enabled ? loading : false,
    error: enabled ? error : null,
  };
}
