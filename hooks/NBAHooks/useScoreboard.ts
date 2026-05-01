import { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosError } from "axios";

export interface TeamInfo {
  id: string;
  displayName: string;
  abbreviation: string;
  logo: string;
  score: number;
  winner: boolean;
  record: string;
  linescores: string[];
}

export interface SeriesCompetitor {
  id: string;
  wins: number;
  ties: number;
}

export interface Series {
  type: string;
  title: string;
  summary: string;
  completed: boolean;
  totalCompetitions: number;
  competitors: SeriesCompetitor[];
}

export interface Venue {
  id: string;
  fullName: string;
  address: { city: string; state: string };
  indoor: boolean;
}

export interface GameNote {
  type: string;
  headline: string;
}

export interface ScoreboardGame {
  gameId: string;
  name: string;
  shortName: string;
  date: string;
  status: "final" | "in_play" | "scheduled";
  statusText: string;
  displayClock: string | null;
  period: number | null;
  broadcast: string | null;
  venue: Venue | null;
  home: TeamInfo;
  away: TeamInfo;
  isPostseason: boolean;
  series: Series | null;
  notes: GameNote[];
}

export interface ScoreboardResponse {
  date: string;
  league: string;
  games: ScoreboardGame[];
}

interface UseScoreboardOptions {
  league: string;
  date?: string;
  pollInterval?: number;
  enabled?: boolean;
}

interface UseScoreboardResult {
  data: ScoreboardResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useScoreboard({
  league,
  date,
  pollInterval,
  enabled = true,
}: UseScoreboardOptions): UseScoreboardResult {
  const [data, setData] = useState<ScoreboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchScoreboard = useCallback(async () => {
    if (!enabled) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const { data: json } = await axios.get<ScoreboardResponse>(
        "http://localhost:4000/api/details/scoreboard",
        {
          params: {
            league,
            ...(date && { date }),
          },
          signal: controller.signal,
        }
      );

      setData(json);
      setError(null);
    } catch (err) {
      if (axios.isCancel(err)) return;
      const axiosErr = err as AxiosError<{ error: string }>;
      setError(
        axiosErr.response?.data?.error ??
          axiosErr.message ??
          "Failed to fetch scoreboard"
      );
    } finally {
      setLoading(false);
    }
  }, [league, date, enabled]);

  useEffect(() => {
    setLoading(true);
    fetchScoreboard();
    return () => controllerRef.current?.abort();
  }, [fetchScoreboard]);

  useEffect(() => {
    if (!pollInterval || !enabled) return;
    const id = setInterval(fetchScoreboard, pollInterval);
    return () => clearInterval(id);
  }, [fetchScoreboard, pollInterval, enabled]);

  return { data, loading, error, refetch: fetchScoreboard };
}