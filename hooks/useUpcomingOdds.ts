import axios, { CancelTokenSource } from "axios";
import { useEffect, useRef, useState } from "react";

export interface Bookmaker {
  key: string;
  title: string;
  markets: {
    key: string;
    outcomes: {
      name: string;
      price: number;
      point?: number;
    }[];
  }[];
}

export interface GameOdds {
  id: string;
  commence_time: string;
  commence_time_local?: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Simple cache
const cache: Record<string, GameOdds[]> = {};

interface UseUpcomingOddsOptions {
  timestamp?: string | number; // ISO string or epoch
  team1?: string; // abbreviation or full
  team2?: string;
}

export const useUpcomingOdds = ({
  timestamp,
  team1,
  team2,
}: UseUpcomingOddsOptions) => {
  const [data, setData] = useState<GameOdds[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizedTs = timestamp
      ? new Date(timestamp).toISOString()
      : undefined;

    const params: Record<string, string> = {};
    if (normalizedTs) params.timestamp = normalizedTs;
    if (team1) params.team1 = team1;
    if (team2) params.team2 = team2;

    const key = JSON.stringify(params);

    // If cached, immediately set it
    if (cache[key]) {
      setData(cache[key]);
      setError(null);
    } else {
      setData([]); // clear previous data
      setError(null);
    }

    let cancelSource: CancelTokenSource | null = axios.CancelToken.source();

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/nba/odds/upcoming`, {
          params,
          cancelToken: cancelSource?.token,
        });

        const games = res.data.games || [];
        cache[key] = games; // cache result
        setData(games);
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        setError(err.response?.data?.error || "Failed to fetch upcoming odds");
      } finally {
        setLoading(false);
      }
    };

    // Fetch if not cached
    if (!cache[key]) fetchData();

    return () => {
      cancelSource?.cancel("Component unmounted");
    };
  }, [timestamp, team1, team2]);

  return { data, loading, error };
};
