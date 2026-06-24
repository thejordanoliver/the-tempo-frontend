// hooks/useTeamCoaches.ts
import { isCancel } from "axios";
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface Coach {
  id: number;
  espn_id: number;
  first_name: string;
  last_name: string;
  experience: string | null;
  teamId: number | undefined;
  role: string;
  season: number;
  is_active: boolean;
}

interface UseTeamCoachesResult {
  coaches: Coach[];
  loading: boolean;
  error: string | null;
}

export function useTeamCoaches(
  teamId: number,
  league: string,
): UseTeamCoachesResult {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId || !league) return;

    const controller = new AbortController();

    const fetchCoaches = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await apiClient.get(
          `api/coaches/${league}/team/${teamId}`,
          {
            signal: controller.signal,
          },
        );

        if (data.success) {
          setCoaches(data.coaches);
        } else {
          setError(data.error || "Unknown error");
        }
      } catch (err: any) {
        if (isCancel(err)) return;
        setError(err.message || "Failed to fetch coaches");
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();

    return () => controller.abort();
  }, [teamId, league]);

  return { coaches, loading, error };
}
