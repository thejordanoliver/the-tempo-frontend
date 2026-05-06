import { useCallback, useEffect, useState } from "react";
import { MLBGame } from "types/baseball";
import { apiClient } from "utils/apiClient";

export type MLBTeamGamesMonthGroup = {
  key: string;
  year: number;
  month: number;
  label: string;
  count: number;
};

export type MLBTeamGamesSelectedMonth = MLBTeamGamesMonthGroup & {
  games: MLBGame[];
};

type MLBTeamGamesResponse = {
  success: boolean;
  cached?: boolean;
  teamId: string | number;
  season: string | number;
  count: number;
  gamesByMonth?: MLBTeamGamesMonthGroup[];
  selectedMonth?: MLBTeamGamesSelectedMonth | null;
  games?: MLBGame[];
};

type UseMLBTeamGamesOptions = {
  season?: string;
  selectedDate?: Date | null;
};

export function useMLBTeamGames(
  teamId: string | number,
  { season = "2026", selectedDate = null }: UseMLBTeamGamesOptions = {},
) {
  const [games, setGames] = useState<MLBGame[]>([]);
  const [gamesByMonth, setGamesByMonth] = useState<MLBTeamGamesMonthGroup[]>(
    [],
  );
  const [selectedMonth, setSelectedMonth] =
    useState<MLBTeamGamesSelectedMonth | null>(null);
  const [loading, setLoading] = useState(Boolean(teamId));
  const [error, setError] = useState<string | null>(null);

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
      };

      if (selectedDate) {
        params.selectedYear = selectedDate.getFullYear();
        params.selectedMonth = selectedDate.getMonth();
      }

      const res = await apiClient.get<MLBTeamGamesResponse>(
        `api/games/mlb/team/${teamId}`,
        { params },
      );

      setGames(Array.isArray(res.data?.games) ? res.data.games : []);

      setGamesByMonth(
        Array.isArray(res.data?.gamesByMonth) ? res.data.gamesByMonth : [],
      );

      setSelectedMonth(res.data?.selectedMonth ?? null);
    } catch (err: any) {
      console.error(
        "Error fetching MLB team games:",
        err?.response?.data || err?.message || err,
      );

      setError("Failed to load team games");
      setGames([]);
      setGamesByMonth([]);
      setSelectedMonth(null);
    } finally {
      setLoading(false);
    }
  }, [teamId, season, selectedDate]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    gamesByMonth,
    selectedMonth,
    loading,
    error,
    refreshGames: fetchGames,
  };
}