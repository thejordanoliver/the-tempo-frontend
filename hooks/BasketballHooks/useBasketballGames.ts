import { BasketballGame } from "@/types/basketball/basketball";
import { isGameLive } from "@/utils/games";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { apiClient } from "utils/apiClient";

type FetchGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

type BasketballGamesResponse = {
  games?: BasketballGame[];
};

type ConferenceId = number | string | null | undefined;

function getBasketballEndpoint(league: string) {
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

    case "summercalifornia":
      return "api/games/basketball/summercalifornia";

    default:
      return "api/games/basketball/nba";
  }
}

export function useBasketballGames(
  date?: Date,
  league: string = "nba",
  conferenceId?: ConferenceId,
) {
  const [games, setGames] = useState<BasketballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

  const endpoint = useMemo(() => getBasketballEndpoint(league), [league]);

  const isCollegeBasketball = league === "cbb" || league === "wcbb";

  const normalizedConferenceId = useMemo(() => {
    if (!isCollegeBasketball) {
      return undefined;
    }

    if (conferenceId === null || conferenceId === undefined) {
      return undefined;
    }

    const value = String(conferenceId).trim();

    if (!value || value === "top25") {
      return undefined;
    }

    return value;
  }, [conferenceId, isCollegeBasketball]);

  const requestParams = useMemo(() => {
    const params: {
      date?: string;
      conferenceId?: string;
    } = {};

    if (formattedDate !== "today") {
      params.date = formattedDate;
    }

    if (normalizedConferenceId !== undefined) {
      params.conferenceId = normalizedConferenceId;
    }

    return params;
  }, [formattedDate, normalizedConferenceId]);

  const fetchGames = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchGamesOptions = {}) => {
      try {
        setError(null);

        /*
         * Initial fetch / conference change can show the normal
         * loading state.
         *
         * Pull-to-refresh and live updates should not display
         * the full-page skeleton.
         */
        if (!forceRefresh && !silent) {
          setLoading(true);
        }

        const { data } = await apiClient.get(endpoint, {
          params: requestParams,
        });

        const gamesData: BasketballGame[] = Array.isArray(data?.games)
          ? data.games
          : [];

        setGames(gamesData);
      } catch (err) {
        console.error(`Failed to fetch ${league} games:`, err);

        setError(new Error(`Failed to fetch ${league} games`));

        setGames([]);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [endpoint, league, requestParams],
  );

  const refreshGames = useCallback(async () => {
    await fetchGames({
      forceRefresh: true,
    });
  }, [fetchGames]);

  /*
   * Re-fetch whenever:
   *
   * - date changes
   * - league changes
   * - conference changes
   *
   * conferenceId is part of requestParams, which is part
   * of fetchGames' dependency chain.
   */
  useEffect(() => {
    void fetchGames();
  }, [fetchGames]);

  const hasLiveGame = useMemo(() => {
    return games.some(isGameLive);
  }, [games]);

  useLiveSportsSubscription<BasketballGamesResponse>({
    enabled: hasLiveGame,

    kind: "scoreboard",

    payload: {
      sport: "basketball",
      league,

      date: formattedDate !== "today" ? formattedDate : undefined,

      conferenceId: normalizedConferenceId,
    },

    onUpdate: (payload) => {
      setGames(Array.isArray(payload?.games) ? payload.games : []);
    },
  });

  return {
    games,
    loading,
    error,
    refreshGames,
  };
}
