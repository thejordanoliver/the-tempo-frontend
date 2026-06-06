import { BaseballGame } from "@/types/baseball";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";
export type BaseballTeamScheduleLeague =
  | "mlb"
  | "cb"
  | "sb";


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
  color?: string;
  logo?: string;
  recordSummary?: string;
  seasonSummary?: string;
  standingSummary?: string;
  groups?: any;
};

export type BaseballTeamScheduleResponse = {
  league: string;
  team: BaseballTeamScheduleTeam | null;
  season: any;
  games: BaseballGame[];
  months: BaseballScheduleMonth[];
};

interface UseBaseballTeamGamesResult {
  league: string | null;
  team: BaseballTeamScheduleTeam | null;
  season: any;
  games: BaseballGame[];
  months: BaseballScheduleMonth[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

function groupGamesByMonth(games: BaseballGame[]): BaseballScheduleMonth[] {
  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const monthMap = new Map<string, BaseballScheduleMonth>();

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

function sortGamesByDate(games: BaseballGame[]) {
  return [...games].sort((a, b) => {
    const aTime = Number.isFinite(a.timestamp)
      ? Number(a.timestamp)
      : a.date
        ? new Date(a.date).getTime()
        : 0;

    const bTime = Number.isFinite(b.timestamp)
      ? Number(b.timestamp)
      : b.date
        ? new Date(b.date).getTime()
        : 0;

    return aTime - bTime;
  });
}

export function useBaseballTeamGames(
  league: BaseballTeamScheduleLeague,
  teamId?: string | number | null,
): UseBaseballTeamGamesResult {
  const [data, setData] = useState<BaseballTeamScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchedule = useCallback(
    async (isRefresh = false) => {
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
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await apiClient.get<BaseballTeamScheduleResponse>(
          `api/games/baseball/team/${league}/${teamId}`,
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
        const message =
          err?.response?.data?.error ||
          err?.message ||
          "Failed to fetch baseball team schedule";

        setError(message);
        setData(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [league, teamId],
  );

  useEffect(() => {
    fetchSchedule(false);
  }, [fetchSchedule]);

  const refresh = useCallback(async () => {
    await fetchSchedule(true);
  }, [fetchSchedule]);

  return useMemo(
    () => ({
      league: data?.league ?? null,
      team: data?.team ?? null,
      season: data?.season ?? null,
      games: data?.games ?? [],
      months: data?.months ?? [],
      loading,
      refreshing,
      error,
      refresh,
    }),
    [data, loading, refreshing, error, refresh],
  );
}
