import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";

export type CBBTeam = {
  id: number;
  name: string;
  logo?: string;
};

export type CBBGame = {
  id: number;
  date: string;
  dateUTC?: string;
  dateLocal?: string;
  teams?: {
    home: CBBTeam;
    away: CBBTeam;
  };
  scores?: {
    home: { total: number };
    away: { total: number };
  };
  league?: {
    id: number;
    name: string;
  };
  season?: string;
  status?: {
    long: string;
    short: string;
  };
};

const LIVE_STATUSES = ["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT"];

export function useCBBWeeklyGames(timezone: string = "America/New_York") {
  const [cbbGames, setGames] = useState<CBBGame[]>([]);
  const [cbbLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const refreshCBBGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000"}/api/gamesCBB/weekly`,
        { params: { timezone } }
      );

      const data: CBBGame[] = res.data?.response || [];
      setGames(data);
      setLastFetched(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    } catch (err: any) {
      console.error("Error fetching CBB weekly games:", err.message);
      setError("Failed to load weekly CBB games");
    } finally {
      setLoading(false);
    }
  }, [timezone]);

  useEffect(() => {
    refreshCBBGames();
  }, [refreshCBBGames]);

  // Helper to check if a game is live
  const isLiveGame = (game: CBBGame) => game.status?.short && LIVE_STATUSES.includes(game.status.short);

  // Sorted games with live games first
  const sortedGames = useMemo(() => {
    return [...cbbGames].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)));
  }, [cbbGames]);

  return {
    cbbGames: sortedGames,
    cbbLoading,
    error,
    lastFetched,
    refresh: refreshCBBGames,
  };
}
