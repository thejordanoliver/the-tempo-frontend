import { useEffect, useState } from "react";
import axios from "axios";
import { PlayerLeader, STAT_CATEGORIES, StatCategory } from "types/stats";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type LeadersByStat = Partial<Record<StatCategory, PlayerLeader[]>>;

interface ApiResponse {
  stat: StatCategory;
  limit: number;
  minGames: number;
  season: number;
  leaders: PlayerLeader[];
}

interface UseSeasonLeadersOptions {
  season?: number;
  limit?: number;
  minGames?: number;
  baseUrl?: string;
}

export function useSeasonLeaders({
  season = 2025,
  limit = 5,
  minGames = 2,
  baseUrl = API_URL,
}: UseSeasonLeadersOptions = {}) {
  const [leaders, setLeaders] = useState<LeadersByStat>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchLeaders() {
      setLoading(true);
      setError(null);

      try {
        // 🚀 Only ONE request needed when all=true
        const { data } = await axios.get(`${baseUrl}/api/season-leaders`, {
          params: { all: true, season, limit, minGames },
        });

        if (!isCancelled) {
          // backend returns: { leaders: { points: [...], assists: [...], ... } }
          setLeaders(data.leaders);
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
  }, [season, limit, minGames, baseUrl]);

  return { leaders, loading, error };
}

