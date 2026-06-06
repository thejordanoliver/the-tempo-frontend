import { HockeyGame } from "@/types/hockey";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export type TeamScheduleLeague = "nhl" | "mch";

export type ScheduleMonth = {
  key: string;
  label: string;
  year: number | null;
  month: number | null;
  games: HockeyGame[];
};

export type TeamScheduleTeam = {
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

export type TeamScheduleResponse = {
  league: string;
  team: TeamScheduleTeam | null;
  season: any;
  games: HockeyGame[];
  months: ScheduleMonth[];
};

interface UseTeamGamesResult {
  league: string | null;
  team: TeamScheduleTeam | null;
  season: any;
  games: HockeyGame[];
  months: ScheduleMonth[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

function groupGamesByMonth(games: HockeyGame[]): ScheduleMonth[] {
  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const monthMap = new Map<string, ScheduleMonth>();

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

function sortGamesByDate(games: HockeyGame[]) {
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

export function useTeamGames(
  league: TeamScheduleLeague,
  teamId?: string | number | null,
): UseTeamGamesResult {
  const [data, setData] = useState<TeamScheduleResponse | null>(null);
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

        const response = await apiClient.get<TeamScheduleResponse>(
          `api/games/hockey/team/${league}/${teamId}`,
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
          "Failed to fetch hockey team schedule";

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
