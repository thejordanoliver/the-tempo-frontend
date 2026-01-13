// hooks/useTeamCoaches.ts
import { useEffect, useState } from "react";

export interface Coach {
  id: number;
  espn_id: number;
  first_name: string;
  last_name: string;
  experience: string | null;
  teamId: number | undefined,
  role: string;
  season: number;
  is_active: boolean;
}

interface UseTeamCoachesResult {
  coaches: Coach[];
  loading: boolean;
  error: string | null;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useTeamCoaches(
  teamId: number,
  league: string
): UseTeamCoachesResult {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId || !league) return;

    setLoading(true);
    setError(null);

    fetch(`${BASE_URL}/api/coaches/${league}/team/${teamId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch coaches: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCoaches(data.coaches);
        } else {
          setError(data.error || "Unknown error");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [teamId, league]);

  return { coaches, loading, error };
}
