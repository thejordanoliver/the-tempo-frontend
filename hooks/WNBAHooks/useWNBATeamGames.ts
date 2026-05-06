import { useCallback, useEffect, useMemo, useState } from "react";
import { BasketballGame } from "types/basketball";
import { apiClient } from "utils/apiClient";
import { getWNBASeason } from "utils/dateUtils";

export type WNBATeamGamesMonthGroup = {
  key: string;
  year: number;
  month: number;
  label: string;
  count: number;
};

export type WNBATeamGamesSelectedMonth = WNBATeamGamesMonthGroup & {
  games: BasketballGame[];
};

type UseTeamGamesOptions = {
  season?: string;
  selectedDate?: Date | null;
};

type WNBATeamGamesResponse = {
  success?: boolean;
  league?: string;
  season?: string;
  count?: number;
  gamesByMonth?: WNBATeamGamesMonthGroup[];
  selectedMonth?: WNBATeamGamesSelectedMonth | null;
  games?: BasketballGame[];
};

function getSelectedDateParts(selectedDate: Date | null) {
  if (!selectedDate) {
    return {
      year: null,
      month: null,
    };
  }

  return {
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth(),
  };
}

function normalizeWNBASeason(season: string | number | null | undefined) {
  if (season === undefined || season === null || season === "") {
    return String(getWNBASeason()).slice(0, 4);
  }

  return String(season).slice(0, 4);
}

export function useWNBATeamGames(
  teamId: string | number,
  { season = getWNBASeason(), selectedDate = null }: UseTeamGamesOptions = {},
) {
  const [games, setGames] = useState<BasketballGame[]>([]);
  const [gamesByMonth, setGamesByMonth] = useState<WNBATeamGamesMonthGroup[]>(
    [],
  );
  const [selectedMonth, setSelectedMonth] =
    useState<WNBATeamGamesSelectedMonth | null>(null);
  const [loading, setLoading] = useState(Boolean(teamId));
  const [error, setError] = useState<string | null>(null);

  const resolvedSeason = useMemo(() => normalizeWNBASeason(season), [season]);

  const selectedDateParts = useMemo(
    () => getSelectedDateParts(selectedDate),
    [selectedDate],
  );

  const fetchGames = useCallback(async () => {
    if (!teamId) {
      setGames([]);
      setGamesByMonth([]);
      setSelectedMonth(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = {
        season: resolvedSeason,
      };

      if (
        Number.isInteger(selectedDateParts.year) &&
        Number.isInteger(selectedDateParts.month)
      ) {
        params.year = selectedDateParts.year as number;
        params.month = selectedDateParts.month as number;
      }

      const res = await apiClient.get<WNBATeamGamesResponse>(
        `api/games/wnba/team/${teamId}`,
        { params },
      );

      const nextGamesByMonth = Array.isArray(res.data?.gamesByMonth)
        ? res.data.gamesByMonth
        : [];

      const nextSelectedMonth = res.data?.selectedMonth ?? null;
      const nextGames = Array.isArray(res.data?.games) ? res.data.games : [];

      setGamesByMonth(nextGamesByMonth);
      setSelectedMonth(nextSelectedMonth);
      setGames(nextGames);
    } catch (err: any) {
      console.error(
        "Error fetching WNBA team games:",
        err?.response?.data || err?.message || err,
      );

      setError("Failed to load team games");
      setGames([]);
      setGamesByMonth([]);
      setSelectedMonth(null);
    } finally {
      setLoading(false);
    }
  }, [
    teamId,
    resolvedSeason,
    selectedDateParts.year,
    selectedDateParts.month,
  ]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refreshGames = useCallback(async () => {
    await fetchGames();
  }, [fetchGames]);

  return {
    games,
    gamesByMonth,
    selectedMonth,
    loading,
    error,
    refreshGames,
  };
}