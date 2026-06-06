import { useCallback, useEffect, useMemo, useState } from "react";
import { BasketballGame } from "types/basketball";
import { apiClient } from "utils/apiClient";
import { getCBBSeason, getWNBASeason } from "utils/dateUtils";

// Leagues
const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";
const WNBA_LEAGUE = "13";

export type BasketballTeamGamesMonthGroup = {
  key: string;
  year: number;
  month: number;
  label: string;
  count: number;
};

export type BasketballTeamGamesSelectedMonth = BasketballTeamGamesMonthGroup & {
  games: BasketballGame[];
};

type useBasketballGameOptions = {
  selectedDate?: any
  isWNBA?: boolean;
  isWomen?: boolean;
};

type BasketballTeamGamesResponse = {
  success?: boolean;
  league?: string;
  count?: number;
  gamesByMonth?: BasketballTeamGamesMonthGroup[];
  selectedMonth?: BasketballTeamGamesSelectedMonth | null;
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

export function useBasketballTeamGames(
  teamId: string | number,
  { selectedDate = null,   isWNBA = false,
  isWomen = false,
}: useBasketballGameOptions = {}) {
  const [games, setGames] = useState<BasketballGame[]>([]);
  const [gamesByMonth, setGamesByMonth] = useState<
    BasketballTeamGamesMonthGroup[]
  >([]);
  const [selectedMonth, setSelectedMonth] =
    useState<BasketballTeamGamesSelectedMonth | null>(null);
  const [loading, setLoading] = useState(Boolean(teamId));
  const [error, setError] = useState<string | null>(null);
  const selectedDateParts = useMemo(
    () => getSelectedDateParts(selectedDate),
    [selectedDate],
  );
  const season = isWNBA ? getWNBASeason() : getCBBSeason();
  const league = isWNBA
    ? WNBA_LEAGUE
    : isWomen
      ? WOMEN_CBB_LEAGUE
      : MEN_CBB_LEAGUE;

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

      const res = await apiClient.get<BasketballTeamGamesResponse>(
        `api/games/basketball/team/${teamId}`,
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
        "Error fetching basketball team games:",
        err?.response?.data || err?.message || err,
      );

      setError("Failed to load team games");
      setGames([]);
      setSelectedMonth(null);
    } finally {
      setLoading(false);
    }
  }, [teamId, season, league, selectedDateParts.year, selectedDateParts.month]);

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
