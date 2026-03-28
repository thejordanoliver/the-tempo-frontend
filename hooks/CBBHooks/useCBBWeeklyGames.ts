import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CBBTeam } from "types/types";
import { BASE_URL } from "utils/apiClient";
import { getCBBSeason } from "utils/dateUtils";

export type CBBGame = {
  id: number;
  date: string;
  teams: {
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
  status?: {
    long: string;
    short: string;
  };
};

const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";
const LIVE_STATUSES = ["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT"];

type UseCBBWeeklyGamesOptions = {
  season?: string;
  timezone?: string;
  isWomen?: boolean;
};

export function useCBBWeeklyGames({
  season = getCBBSeason(),
  timezone,
  isWomen = false,
}: UseCBBWeeklyGamesOptions = {}) {
  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;

  const [cbbGames, setGames] = useState<CBBGame[]>([]);
  const [cbbLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const refreshCBBGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/games/cbb/weekly`, {
        params: { season, timezone, league },
      });

      const data: CBBGame[] = res.data?.response || [];
      setGames(data);
      setLastFetched(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    } catch (err: any) {
      console.error("Error fetching CBB weekly games:", err.message);
      setError("Failed to load weekly CBB games");
    } finally {
      setLoading(false);
    }
  }, [season, timezone, league]);

  useEffect(() => {
    refreshCBBGames();
  }, [refreshCBBGames]);

  const isLiveGame = useCallback(
    (game: CBBGame) =>
      !!game.status?.short && LIVE_STATUSES.includes(game.status.short),
    [],
  );

  const sortedGames = useMemo(() => {
    return [...cbbGames].sort(
      (a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)),
    );
  }, [cbbGames, isLiveGame]);

  return {
    cbbGames: sortedGames,
    cbbLoading,
    error,
    lastFetched,
    refresh: refreshCBBGames,
  };
}