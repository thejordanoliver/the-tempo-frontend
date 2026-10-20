import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import { BasketballGame } from "@/types/basketball/basketball";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { apiClient } from "utils/apiClient";

type FetchGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

type BasketballGamesResponse = {
  games?: BasketballGame[];
  calendar?: unknown[] | null;
  calendarStartDate?: string | null;
  calendarEndDate?: string | null;
};

type ConferenceId = number | string | null | undefined;

function getBasketballEndpoint(league: string) {
  switch (league) {
    case "mcbb":
      return "api/games/basketball/mcbb";

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

    case "gleague":
      return "api/games/basketball/gleague";

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
  const [calendarResponse, setCalendarResponse] = useState<{
    league: string;
    data: BasketballGamesResponse;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

  const endpoint = getBasketballEndpoint(league);

  const isCollegeBasketball = league === "mcbb" || league === "wcbb";

  const normalizedConferenceId = useMemo(() => {
    if (!isCollegeBasketball) {
      return undefined;
    }

    if (conferenceId === null || conferenceId === undefined) {
      return undefined;
    }

    const value = String(conferenceId).trim();

    if (!value) {
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
      const requestId = ++requestIdRef.current;

      try {
        setError(null);

        // Background updates keep the current list visible.
        if (!forceRefresh && !silent) {
          setLoading(true);
        }

        const { data } = await apiClient.get<BasketballGamesResponse>(endpoint, {
          params: requestParams,
        });

        const gamesData: BasketballGame[] = Array.isArray(data?.games)
          ? data.games
          : [];

        if (requestId === requestIdRef.current) {
          setGames(gamesData);
          setCalendarResponse({ league, data });
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error(`Failed to fetch ${league} games:`, err);

        setError(new Error(`Failed to fetch ${league} games`));

        if (!forceRefresh && !silent) setGames([]);
      } finally {
        if (!silent && requestId === requestIdRef.current) {
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

  const hasActiveGame = useMemo(() => {
    return games.some(shouldTrackGameUpdates);
  }, [games]);

  useLiveSportsSubscription<BasketballGamesResponse>({
    enabled: !loading && hasActiveGame,

    kind: "scoreboard",

    payload: {
      sport: "basketball",
      league,

      date: formattedDate !== "today" ? formattedDate : undefined,

      conferenceId: normalizedConferenceId,
    },

    onUpdate: (payload) => {
      requestIdRef.current += 1;
      setGames(Array.isArray(payload?.games) ? payload.games : []);
    },
  });

  const scoreboardCalendar = useMemo(
    () => ({
      pending: loading,
      calendar: calendarResponse?.league === league
        ? calendarResponse.data.calendar : null,
      startDate: calendarResponse?.league === league
        ? calendarResponse.data.calendarStartDate : null,
      endDate: calendarResponse?.league === league
        ? calendarResponse.data.calendarEndDate : null,
    }),
    [calendarResponse, league, loading],
  );

  return {
    games,
    scoreboardCalendar,
    loading,
    error,
    refreshGames,
  };
}
