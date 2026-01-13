import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { teamsCBBById, teamsWCBBById } from "constants/teamsCBB";

export type CBBTeam = {
  id?: number;
  wid?: number;
  name: string;
  fullName?: string;
  logo?: string;
  color?: string;
  secondaryColor?: string;
};

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
  timezone?: string;
  isWomen?: boolean;
};

export function useCBBWeeklyGames({
  timezone = "America/New_York",
  isWomen = false,
}: UseCBBWeeklyGamesOptions = {}) {
  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;
  const teamsMap = isWomen ? teamsWCBBById : teamsCBBById;

  const [cbbGames, setGames] = useState<CBBGame[]>([]);
  const [cbbLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const enrichTeams = useCallback(
    (game: any) => {
      const homeKey = isWomen ? Number(game.teams.home.wid) : Number(game.teams.home.id);
      const awayKey = isWomen ? Number(game.teams.away.wid) : Number(game.teams.away.id);

      const homeTeam = teamsMap[homeKey] || game.teams.home;
      const awayTeam = teamsMap[awayKey] || game.teams.away;

      return {
        ...game,
        teams: {
          home: { ...game.teams.home, ...homeTeam },
          away: { ...game.teams.away, ...awayTeam },
        },
      };
    },
    [teamsMap, isWomen]
  );

  const refreshCBBGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000"}/api/gamesCBB/weekly`,
        {
          params: { timezone, league },
        }
      );

      const data: CBBGame[] = res.data?.response || [];
      const enrichedData = data.map(enrichTeams);

      setGames(enrichedData);
      setLastFetched(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    } catch (err: any) {
      console.error("Error fetching CBB weekly games:", err.message);
      setError("Failed to load weekly CBB games");
    } finally {
      setLoading(false);
    }
  }, [timezone, league, enrichTeams]);

  useEffect(() => {
    refreshCBBGames();
  }, [refreshCBBGames]);

  const isLiveGame = useCallback(
    (game: CBBGame) => !!game.status?.short && LIVE_STATUSES.includes(game.status.short),
    []
  );

  const sortedGames = useMemo(() => {
    return [...cbbGames].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)));
  }, [cbbGames, isLiveGame]);

  return {
    cbbGames: sortedGames,
    cbbLoading,
    error,
    lastFetched,
    refresh: refreshCBBGames,
  };
}
