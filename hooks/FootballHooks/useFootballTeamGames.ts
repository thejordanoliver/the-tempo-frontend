import { FootballGame } from "@/types/football/football";
import { isGameLive } from "@/utils/games";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

type FetchTeamGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

type FootballTeamGamesResponse = {
  games?: FootballGame[];
};

interface UseTeamGamesReturn {
  games: FootballGame[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshGames: () => Promise<void>;
}

export function useFootballTeamGames(
  teamId: string | number | null,
  league: string = "nfl",
  season?: number | string,
): UseTeamGamesReturn {
  const [games, setGames] = useState<FootballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchTeamGamesOptions = {}) => {
      if (!teamId || !league) {
        if (!silent) {
          setGames([]);
          setError(null);
          setLoading(false);
        }

        if (forceRefresh) {
          setRefreshing(false);
        }

        return;
      }

      try {
        setError(null);

        if (forceRefresh) {
          setRefreshing(true);
        } else if (!silent) {
          setLoading(true);
        }

        const endpoint =
          season !== undefined && season !== null && season !== ""
            ? `/api/games/football/team/${league}/${teamId}/${season}`
            : `/api/games/football/team/${league}/${teamId}`;

        const { data } =
          await apiClient.get<FootballTeamGamesResponse>(endpoint);

        const nextGames = Array.isArray(data?.games) ? data.games : [];

        setGames(nextGames);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unknown request error";

        console.error("Error fetching football team games:", message);

        setError("Failed to load team games");

        // Preserve the existing schedule if a background poll fails.
        if (!silent) {
          setGames([]);
        }
      } finally {
        if (forceRefresh) {
          setRefreshing(false);
        }

        if (!silent) {
          setLoading(false);
        }
      }
    },
    [teamId, league, season],
  );

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const hasLiveGame = useMemo(() => {
    return games.some(isGameLive);
  }, [games]);

  useEffect(() => {
    if (!hasLiveGame) return;

    const interval = setInterval(() => {
      fetchGames({ silent: true });
    }, 10_000);

    return () => clearInterval(interval);
  }, [hasLiveGame, fetchGames]);

  const refreshGames = useCallback(async () => {
    await fetchGames({ forceRefresh: true });
  }, [fetchGames]);

  return {
    games,
    loading,
    refreshing,
    error,
    refreshGames,
  };
}