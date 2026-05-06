import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BasketballGame } from "types/basketball";
import { apiClient } from "utils/apiClient";
import { getCBBSeason } from "utils/dateUtils";

export type CBBTeamGamesMonthGroup = {
  key: string;
  year: number;
  month: number;
  label: string;
  count: number;
};

export type CBBTeamGamesSelectedMonth = CBBTeamGamesMonthGroup & {
  games: BasketballGame[];
};

type UseTeamGamesOptions = {
  season?: string;
  selectedDate?: Date | null;
};

type CBBTeamGamesResponse = {
  success?: boolean;
  league?: string;
  count?: number;
  gamesByMonth?: CBBTeamGamesMonthGroup[];
  selectedMonth?: CBBTeamGamesSelectedMonth | null;
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

export function useCBBTeamGames(
  teamId: string | number,
  league: string,
  { season = getCBBSeason(), selectedDate = null }: UseTeamGamesOptions = {},
) {
  const [games, setGames] = useState<BasketballGame[]>([]);
  const [gamesByMonth, setGamesByMonth] = useState<CBBTeamGamesMonthGroup[]>(
    [],
  );
  const [selectedMonth, setSelectedMonth] =
    useState<CBBTeamGamesSelectedMonth | null>(null);
  const [loading, setLoading] = useState(Boolean(teamId));
  const [error, setError] = useState<string | null>(null);

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
        season,
        league,
      };

      if (
        Number.isInteger(selectedDateParts.year) &&
        Number.isInteger(selectedDateParts.month)
      ) {
        params.year = selectedDateParts.year as number;
        params.month = selectedDateParts.month as number;
      }

      const res = await apiClient.get<CBBTeamGamesResponse>(
        `api/games/cbb/team/${teamId}`,
        { params },
      );

      const nextGamesByMonth = Array.isArray(res.data?.gamesByMonth)
        ? res.data.gamesByMonth
        : [];

      const nextSelectedMonth = res.data?.selectedMonth ?? null;
      const nextGames = Array.isArray(res.data?.games) ? res.data.games : [];

      setGamesByMonth((prevGamesByMonth) => {
        if (nextGamesByMonth.length > 0) {
          return nextGamesByMonth;
        }

        return prevGamesByMonth;
      });

      setSelectedMonth(nextSelectedMonth);
      setGames(nextGames);
    } catch (err: any) {
      console.error(
        "Error fetching CBB team games:",
        err?.response?.data || err?.message || err,
      );

      setError("Failed to load team games");
      setGames([]);
      setSelectedMonth(null);
    } finally {
      setLoading(false);
    }
  }, [
    teamId,
    season,
    league,
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