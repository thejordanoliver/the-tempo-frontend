import { BaseballGame } from "@/types/baseball/baseball";
import { isGameLive } from "@/utils/games";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

export type BaseballTeamScheduleLeague = "mlb" | "cb" | "sb";

export type BaseballScheduleMonth = {
  key: string;
  label: string;
  year: number | null;
  month: number | null;
  games: BaseballGame[];
};

export type BaseballTeamScheduleTeam = {
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

type Season = {
  year: number;
  type: number;
  name: string;
  displayName: string;
  half: number;
};

export type BaseballTeamScheduleResponse = {
  league: string;
  team: BaseballTeamScheduleTeam | null;
  season: Season;
  games: BaseballGame[];
  months: BaseballScheduleMonth[];
};

type FetchScheduleOptions = {
  isRefresh?: boolean;
  silent?: boolean;
};

interface UseBaseballTeamGamesResult {
  league: string | null;
  team: BaseballTeamScheduleTeam | null;
  season: Season | null;
  games: BaseballGame[];
  months: BaseballScheduleMonth[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const LIVE_POLL_INTERVAL = 60_000;
const IDLE_POLL_INTERVAL = 60_000;

function areScheduleResponsesEqual(
  current: BaseballTeamScheduleResponse,
  next: BaseballTeamScheduleResponse,
): boolean {
  if (current === next) {
    return true;
  }

  try {
    return JSON.stringify(current) === JSON.stringify(next);
  } catch {
    return false;
  }
}

function hasValidValue(
  value: string | number | null | undefined,
): value is string | number {
  return value !== null && value !== undefined && value !== "";
}

function isBaseballGameLive(game: BaseballGame): boolean {
  if (isGameLive(game)) {
    return true;
  }

  const currentGame = game as any;

  const state = String(
    currentGame?.status?.type?.state ??
      currentGame?.status?.state ??
      currentGame?.state ??
      currentGame?.statusState ??
      "",
  ).toLowerCase();

  const statusName = String(
    currentGame?.status?.type?.name ??
      currentGame?.status?.name ??
      currentGame?.statusName ??
      "",
  ).toLowerCase();

  return (
    state === "in" ||
    state === "live" ||
    state === "in_progress" ||
    statusName === "status_in_progress" ||
    statusName.includes("in_progress") ||
    statusName.includes("in progress")
  );
}

export function useBaseballTeamGames(
  league: BaseballTeamScheduleLeague,
  teamId: string | number | null,
  season: string | number | null,
): UseBaseballTeamGamesResult {
  const [data, setData] =
    useState<BaseballTeamScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pollingRequestInProgressRef = useRef(false);

  const fetchSchedule = useCallback(
    async ({
      isRefresh = false,
      silent = false,
    }: FetchScheduleOptions = {}) => {
      if (!league || !hasValidValue(teamId) || !hasValidValue(season)) {
        setData(null);
        setLoading(false);
        setRefreshing(false);
        setError(null);
        return;
      }

      if (silent && pollingRequestInProgressRef.current) {
        return;
      }

      if (silent) {
        pollingRequestInProgressRef.current = true;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (!silent) {
          setLoading(true);
        }

        const response = await apiClient.get<BaseballTeamScheduleResponse>(
          `api/games/baseball/team/${league}/${teamId}/${season}`,
          {
            params: silent
              ? {
                  // Prevent cached live-score responses.
                  _t: Date.now(),
                }
              : undefined,
          },
        );

        const responseGames = response.data.games ?? [];
        const responseMonths = response.data.months ?? [];

        const nextData: BaseballTeamScheduleResponse = {
          league: response.data.league,
          team: response.data.team ?? null,
          season: response.data.season,
          games: responseGames,
          months: responseMonths,
        };

        setError(null);

        setData((currentData) => {
          if (
            currentData &&
            areScheduleResponsesEqual(currentData, nextData)
          ) {
            return currentData;
          }

          return nextData;
        });
      } catch (err: any) {
        const message =
          err?.response?.data?.error ??
          err?.message ??
          `Failed to fetch ${league} baseball team schedule`;

        if (silent) {
          console.warn("BASEBALL SCHEDULE POLLING ERROR:", message);
        } else {
          console.error("BASEBALL TEAM SCHEDULE ERROR:", err);
          setError(new Error(message));
          setData(null);
        }
      } finally {
        if (silent) {
          pollingRequestInProgressRef.current = false;
        }

        if (isRefresh) {
          setRefreshing(false);
        }

        if (!silent) {
          setLoading(false);
        }
      }
    },
    [league, teamId, season],
  );

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const games = useMemo(() => data?.games ?? [], [data]);

  const hasLiveGame = useMemo(
    () => games.some(isBaseballGameLive),
    [games],
  );

  useEffect(() => {
    // Keep polling so scheduled games can transition into a live state.
    const intervalDuration = hasLiveGame
      ? LIVE_POLL_INTERVAL
      : IDLE_POLL_INTERVAL;

    const interval = setInterval(() => {
      fetchSchedule({ silent: true });
    }, intervalDuration);

    return () => {
      clearInterval(interval);
    };
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