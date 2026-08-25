import { BaseballGame } from "@/types/baseball/baseball";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
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

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (!silent) {
          setLoading(true);
        }

        const response = await apiClient.get<BaseballTeamScheduleResponse>(
          `api/games/baseball/team/${league}/${teamId}/${season}`,
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

  useLiveSportsSubscription<BaseballTeamScheduleResponse>({
    enabled: Boolean(league && hasValidValue(teamId) && hasValidValue(season)),
    kind: "scoreboard",
    payload: {
      sport: "baseball",
      league,
      feed: "teamSchedule",
      teamId: teamId || "",
      season: season || "",
    },
    onUpdate: (payload) => {
      const nextData: BaseballTeamScheduleResponse = {
        league: payload.league,
        team: payload.team ?? null,
        season: payload.season,
        games: payload.games ?? [],
        months: payload.months ?? [],
      };

      setError(null);
      setData((currentData) => {
        if (currentData && areScheduleResponsesEqual(currentData, nextData)) {
          return currentData;
        }

        return nextData;
      });
    },
  });

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
