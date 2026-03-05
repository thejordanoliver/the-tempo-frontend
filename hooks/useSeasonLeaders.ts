import { useEffect, useState } from "react";
import axios from "axios";
import { PlayerLeader, StatCategory } from "types/stats";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type LeadersByStat = Partial<Record<StatCategory, PlayerLeader[]>>;

interface ApiResponse {
  season: string;
  perMode: string;
  seasonType: string;
  leaderboards: LeadersByStat;
}

interface UseSeasonLeadersOptions {
  limit?: number;
  baseUrl?: string;
}

export function useSeasonLeaders({
  limit = 5,
  baseUrl = API_URL,
}: UseSeasonLeadersOptions = {}) {
  const [leaders, setLeaders] = useState<LeadersByStat>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchLeaders() {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get<ApiResponse>(
          `${baseUrl}/api/season-leaders/nba/leaders`,
          {
            params: { limit }, // only send limit now
          }
        );

        if (!isCancelled) {
          setLeaders(data.leaderboards);
        }
      } catch (err) {
        if (!isCancelled) {
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.error || err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Unknown error");
          }
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchLeaders();

    return () => {
      isCancelled = true;
    };
  }, [limit, baseUrl]);

  return { leaders, loading, error };
}
