import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BaseballGame } from "types/baseball";
import { apiClient } from "utils/apiClient";

type League = "nba" | "cbb" | "wcbb" | "wnba" | "summervegas" | "summerutah";

type FetchGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

const LIVE_STATES = new Set(["in", "half"]);

function isLiveBasketballGame(game: any) {
  const state = String(game?.status?.state || "").toLowerCase();
  const description = String(game?.status?.description || "").toLowerCase();
  const detail = String(game?.status?.detail || "").toLowerCase();
  const shortDetail = String(game?.status?.shortDetail || "").toLowerCase();

  return (
    LIVE_STATES.has(state) ||
    description.includes("in progress") ||
    detail.includes("in progress") ||
    shortDetail.includes("in progress")
  );
}

function getBasketballEndpoint(league: League) {
  switch (league) {
    case "cbb":
      return "api/games/basketball/cbb";
    case "wcbb":
      return "api/games/basketball/wcbb";
    case "wnba":
      return "api/games/basketball/wnba";
    case "summervegas":
      return "api/games/basketball/summervegas";
    case "summerutah":
      return "api/games/basketball/summerutah";
    default:
      return "api/games/basketball/nba";
  }
}

export function useBasketballGames(date?: Date, league: League = "nba") {
  const [games, setGames] = useState<BaseballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

  const endpoint = useMemo(() => getBasketballEndpoint(league), [league]);

  const fetchGames = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchGamesOptions = {}) => {
      try {
        setError(null);

        // Keep pull-to-refresh and live polling from showing the full skeleton.
        if (!forceRefresh && !silent) {
          setLoading(true);
        }

        const { data } = await apiClient.get(endpoint, {
          params: formattedDate !== "today" ? { date: formattedDate } : {},
        });

        const gamesData = Array.isArray(data?.games) ? data.games : [];

        setGames(gamesData);
      } catch (err) {
        console.error(err);
        setError(new Error(`Failed to fetch ${league} games`));
        setGames([]);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [endpoint, formattedDate, league],
  );

  const refreshGames = useCallback(async () => {
    await fetchGames({ forceRefresh: true });
  }, [fetchGames]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const hasLiveGame = useMemo(() => {
    return games.some(isLiveBasketballGame);
  }, [games]);

  useEffect(() => {
    if (!hasLiveGame) return;

    const interval = setInterval(() => {
      fetchGames({ silent: true });
    }, 10000);

    return () => clearInterval(interval);
  }, [hasLiveGame, fetchGames]);

  return {
    games,
    loading,
    error,
    refreshGames,
  };
}
