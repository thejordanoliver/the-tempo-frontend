import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Game } from "types/nba";
import { apiClient } from "utils/apiClient";
import { getNBASeason } from "utils/dateUtils";

export type GameWithStatusText = Game & {
  statusText?: string;
  arena?: {
    name: string;
    city: string;
    state: string;
  } | null;
  year: number;
  month: number;
};

export type TeamGamesMonthGroup = {
  key: string;
  year: number;
  month: number;
  label: string;
  count: number;
  games?: GameWithStatusText[];
};

type TeamGamesResponse = {
  success: boolean;
  count: number;
  gamesByMonth?: TeamGamesMonthGroup[];
  selectedMonth?: TeamGamesMonthGroup | null;
  games?: GameWithStatusText[];
};

export function useTeamGames(
  teamId?: string,
  season = getNBASeason(),
  selectedDate?: Date | null,
) {
  const [gamesByMonth, setGamesByMonth] = useState<TeamGamesMonthGroup[]>([]);
  const [games, setGames] = useState<GameWithStatusText[]>([]);
  const [loading, setLoading] = useState(Boolean(teamId));
  const [error, setError] = useState<Error | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId) {
      setGamesByMonth([]);
      setGames([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params =
        selectedDate instanceof Date
          ? {
              year: selectedDate.getFullYear(),
              month: selectedDate.getMonth(),
            }
          : undefined;

      const res = await apiClient.get<TeamGamesResponse>(
        `api/games/nba/team/${teamId}/${season}`,
        { params },
      );

      setGamesByMonth(
        Array.isArray(res.data?.gamesByMonth) ? res.data.gamesByMonth : [],
      );

      setGames(Array.isArray(res.data?.games) ? res.data.games : []);
    } catch (err: any) {
      console.error("[useTeamGames] error:", err?.response?.data || err);

      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load team games";

      setError(new Error(message));
      setGamesByMonth([]);
      setGames([]);
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
    loading,
    error,
    refreshGames: fetchGames,
  };
}