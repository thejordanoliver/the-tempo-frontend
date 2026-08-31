import { FootballGame } from "@/types/football/football";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { useCallback, useEffect, useState } from "react";
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

function mergeFootballGames(
  currentGames: FootballGame[],
  updatedGames: FootballGame[],
): FootballGame[] {
  if (updatedGames.length === 0) {
    return currentGames;
  }

  const updates = new Map(updatedGames.map((game) => [String(game.id), game]));

  const merged = currentGames.map((game) => {
    const updatedGame = updates.get(String(game.id));

    if (!updatedGame) {
      return game;
    }

    updates.delete(String(game.id));

    return updatedGame;
  });

  // Include any games returned by realtime that were not already
  // present in the original schedule.
  return [...merged, ...updates.values()];
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
      if (teamId == null || teamId === "" || !league) {
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

        const hasSeason =
          season !== undefined && season !== null && season !== "";

        const endpoint = hasSeason
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

        // Preserve existing schedule during silent/background refreshes.
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

  const subscriptionEnabled =
    teamId != null && teamId !== "" && Boolean(league);

  useLiveSportsSubscription<FootballTeamGamesResponse>({
    enabled: subscriptionEnabled,
    kind: "scoreboard",

    payload: {
      sport: "football",
      league,
      feed: "teamSchedule",
      teamId: teamId ?? "",
      season,
    },

    onUpdate: (payload) => {
      const updatedGames = Array.isArray(payload?.games) ? payload.games : [];

      if (updatedGames.length === 0) {
        return;
      }

      setGames((currentGames) =>
        mergeFootballGames(currentGames, updatedGames),
      );
    },
  });

  const refreshGames = useCallback(async () => {
    await fetchGames({
      forceRefresh: true,
    });
  }, [fetchGames]);

  return {
    games,
    loading,
    refreshing,
    error,
    refreshGames,
  };
}
