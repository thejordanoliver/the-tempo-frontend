import { FootballGame } from "@/types/football/football";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const requestIdRef = useRef(0);

  const fetchGames = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchTeamGamesOptions = {}) => {
      const requestId = ++requestIdRef.current;
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

        if (requestId === requestIdRef.current) setGames(nextGames);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;
        const message =
          err instanceof Error ? err.message : "Unknown request error";

        console.error("Error fetching football team games:", message);

        setError("Failed to load team games");

        // Preserve existing schedule during silent/background refreshes.
        if (!silent) {
          setGames([]);
        }
      } finally {
        if (forceRefresh && requestId === requestIdRef.current) {
          setRefreshing(false);
        }

        if (!silent && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [teamId, league, season],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchGames();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
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

    onUpdate: (payload, envelope) => {
      const expectedSeason =
        season === undefined || season === null || season === ""
          ? undefined
          : String(season);
      const isCurrentSchedule =
        envelope.sport === "football" &&
        envelope.league === league &&
        envelope.feed === "teamSchedule" &&
        envelope.params?.teamId === String(teamId) &&
        envelope.params?.season === expectedSeason;

      if (!isCurrentSchedule) return;

      requestIdRef.current += 1;
      const updatedGames = Array.isArray(payload?.games) ? payload.games : [];

      setError(null);
      setGames(updatedGames);
      setLoading(false);
      setRefreshing(false);
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
