import axios from "axios";
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

export interface HistoricalGameOdds {
  id: string;
  commence_time: string;
  commence_time_local?: string;
  home_team: string;
  away_team: string;
  home_team_id?: string; // Odds API team ID
  away_team_id?: string;
  bookmakers: Bookmaker[];
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface UseHistoricalOddsOptions {
  date?: string; // YYYY-MM-DD
  timestamp?: number;
  team1?: string;      // string fallback
  team2?: string;
  team1Id?: string;    // Odds API ID
  team2Id?: string;
  gameId?: string | number;
  skip?: boolean;
}

// In-memory cache
const cache: Record<string, HistoricalGameOdds[]> = {};

export const useHistoricalOdds = (options: UseHistoricalOddsOptions) => {
  const { date, timestamp, team1, team2, team1Id, team2Id, gameId, skip } = options;

  const [data, setData] = useState<HistoricalGameOdds[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastParamsRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (skip) return;
    if (!date || !gameId) return;
    if (!BASE_URL) {
      setError("API base URL not set");
      return;
    }

    const params: Record<string, string> = { date };
    if (timestamp) params.timestamp = new Date(timestamp).toISOString();

    // include both string and ID params
    if (team1Id) params.team1Id = team1Id;
    if (team2Id) params.team2Id = team2Id;
    if (!team1Id && team1) params.team1 = team1;
    if (!team2Id && team2) params.team2 = team2;

    const key = JSON.stringify({ ...params, gameId });

    // Return cached data if available
    if (cache[key]) {
      setData(cache[key]);
      setError(null);
      return;
    }

    if (lastParamsRef.current === key) return;
    lastParamsRef.current = key;

    const cancelSource = axios.CancelToken.source();

    const fetchData = async () => {
      const currentId = ++requestIdRef.current;
      setLoading(true);

      try {
        const res = await axios.get(`${BASE_URL}/api/nba/odds/historical`, {
          params,
          cancelToken: cancelSource.token,
        });

        if (currentId !== requestIdRef.current) return;

        let games: HistoricalGameOdds[] = Array.isArray(res.data?.games)
          ? res.data.games
          : [];

        // --- Filter by Odds API IDs if provided ---
        if (team1Id && team2Id) {
          games = games.filter(
            (g) =>
              (g.home_team_id === team1Id && g.away_team_id === team2Id) ||
              (g.home_team_id === team2Id && g.away_team_id === team1Id)
          );
        } else if (team1 && team2) {
          games = games.filter(
            (g) =>
              (g.home_team.toLowerCase() === team1.toLowerCase() &&
                g.away_team.toLowerCase() === team2.toLowerCase()) ||
              (g.home_team.toLowerCase() === team2.toLowerCase() &&
                g.away_team.toLowerCase() === team1.toLowerCase())
          );
        }

        cache[key] = games;
        setData(games);
        setError(null);
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        setError(err.response?.data?.error || err.message || "Failed to fetch odds");
      } finally {
        if (currentId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelSource.cancel("Component unmounted");
    };
  }, [date, timestamp, team1, team2, team1Id, team2Id, gameId, skip]);

  const refetch = () => {
    lastParamsRef.current = null;
    setError(null);
    setData([]);
    setLoading(false);
  };

  return { data, loading, error, refetch };
};
