import { BasketballGame } from "@/types/basketball";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export type BasketballTeamScheduleLeague = "nba" | "cbb" | "wcbb" | "wnba";

export type BasketballScheduleMonth = {
  key: string;
  label: string;
  year: number | null;
  month: number | null;
  games: BasketballGame[];
};

export type BasketballTeamScheduleTeam = {
  id?: string;
  code?: string;
  location?: string;
  name?: string;
  displayName?: string;
  logo?: string;
  recordSummary?: string;
  seasonSummary?: string;
  standingSummary?: string;
  groups?: any;
};

export type BasketballTeamScheduleResponse = {
  league: string;
  team: BasketballTeamScheduleTeam | null;
  season: any;
  games: BasketballGame[];
  months: BasketballScheduleMonth[];
};

type FetchScheduleOptions = {
  isRefresh?: boolean;
  silent?: boolean;
};

interface UseBasketballTeamGamesResult {
  league: string | null;
  team: BasketballTeamScheduleTeam | null;
  season: any;
  games: BasketballGame[];
  months: BasketballScheduleMonth[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const LIVE_STATES = new Set(["in", "half"]);

function isLiveBasketballGame(game: any) {
  const state = String(game?.status?.state || "").toLowerCase();
  const description = String(game?.status?.description || "").toLowerCase();
  const detail = String(game?.status?.detail || "").toLowerCase();
  const shortDetail = String(game?.status?.shortDetail || "").toLowerCase();

  return (
    LIVE_STATES.has(state) ||
    description.includes("in progress") ||
    detail.includes("in progress") ||
    shortDetail.includes("in progress") ||
    description.includes("live") ||
    detail.includes("live") ||
    shortDetail.includes("live")
  );
}

function groupGamesByMonth(games: BasketballGame[]): BasketballScheduleMonth[] {
  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const monthMap = new Map<string, BasketballScheduleMonth>();

  games.forEach((game) => {
    const date = game.date ? new Date(game.date) : null;

    if (!date || Number.isNaN(date.getTime())) {
      const key = "unknown";

      if (!monthMap.has(key)) {
        monthMap.set(key, {
          key,
          label: "Unknown Date",
          year: null,
          month: null,
          games: [],
        });
      }

      monthMap.get(key)?.games.push(game);
      return;
    }

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        key,
        label: monthFormatter.format(date),
        year,
        month,
        games: [],
      });
    }

    monthMap.get(key)?.games.push(game);
  });

  return Array.from(monthMap.values()).sort((a, b) => {
    if (a.key === "unknown") return 1;
    if (b.key === "unknown") return -1;
    return a.key.localeCompare(b.key);
  });
}

function getGameTime(game: BasketballGame) {
  const timestamp = Number((game as any).timestamp);

  if (Number.isFinite(timestamp) && timestamp > 0) {
    return timestamp;
  }

  if (game.date) {
    const dateTime = new Date(game.date).getTime();
    return Number.isNaN(dateTime) ? 0 : dateTime;
  }

  return 0;
}

function sortGamesByDate(games: BasketballGame[]) {
  return [...games].sort((a, b) => getGameTime(a) - getGameTime(b));
}

export function useBasketballTeamGames(
  league: BasketballTeamScheduleLeague,
  teamId?: string | number | null,
): UseBasketballTeamGamesResult {
  const [data, setData] = useState<BasketballTeamScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchedule = useCallback(
    async ({ isRefresh = false, silent = false }: FetchScheduleOptions = {}) => {
      if (!league || !teamId) {
        setData(null);
        setLoading(false);
        setRefreshing(false);
        setError(null);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (!silent) {
          setLoading(true);
        }

        setError(null);

        const response = await apiClient.get<BasketballTeamScheduleResponse>(
          `api/games/basketball/team/${league}/${teamId}`,
        );

        const games = sortGamesByDate(response.data.games || []);

        const months =
          Array.isArray(response.data.months) && response.data.months.length > 0
            ? response.data.months
            : groupGamesByMonth(games);

        setData({
          ...response.data,
          team: response.data.team ?? null,
          games,
          months,
        });
      } catch (err: any) {
        console.error("BASKETBALL TEAM SCHEDULE ERROR:", err);

        const message =
          err?.response?.data?.error ||
          err?.message ||
          `Failed to fetch ${league} basketball team schedule`;

        setError(new Error(message));

        // Do not clear the current schedule during silent live polling.
        if (!silent) {
          setData(null);
        }
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        }

        if (!silent) {
          setLoading(false);
        }
      }
    },
    [league, teamId],
  );

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const games = useMemo(() => data?.games ?? [], [data]);

  const hasLiveGame = useMemo(() => {
    return games.some(isLiveBasketballGame);
  }, [games]);

  useEffect(() => {
    if (!hasLiveGame) return;

    const interval = setInterval(() => {
      fetchSchedule({ silent: true });
    }, 10000);

    return () => clearInterval(interval);
  }, [hasLiveGame, fetchSchedule]);

  const refresh = useCallback(async () => {
    await fetchSchedule({ isRefresh: true });
  }, [fetchSchedule]);

  return useMemo(
    () => ({
      league: data?.league ?? null,
      team: data?.team ?? null,
      season: data?.season ?? null,
      games,
      months: data?.months ?? [],
      loading,
      refreshing,
      error,
      refresh,
    }),
    [data, games, loading, refreshing, error, refresh],
  );
}