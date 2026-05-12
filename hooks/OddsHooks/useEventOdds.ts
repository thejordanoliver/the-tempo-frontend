import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

export type League = "nba" | "wnba" | "nfl" | "nhl" | "mlb" | "mma" | string;

export type EventOddsOutcome = {
  name: string;
  description?: string;
  price: number;
  point?: number;
};

export type EventOddsMarket = {
  key: string;
  last_update?: string;
  outcomes: EventOddsOutcome[];
};

export type EventOddsBookmaker = {
  key: string;
  title: string;
  last_update?: string;
  markets: EventOddsMarket[];
};

export type EventOddsGame = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  home_id?: number | null;
  away_id?: number | null;
  bookmakers: EventOddsBookmaker[];
};

export type MatchedEvent = {
  id: string;
  home_team: string;
  away_team: string;
  home_id: number;
  away_id: number;
  commence_time: string;
};

export type EventOddsRequestUsage = {
  remaining: string | null;
  used: string | null;
  last: string | null;
};

export type EventOddsResponse = {
  success: boolean;
  league: string;
  leaguePath: string;
  eventId: string;
  resolvedFromEventsTable: boolean;
  matchedEvent: MatchedEvent | null;
  requestUsage?: EventOddsRequestUsage;
  count: number;
  bookmakerCount: number;
  query: {
    markets: string;
    regions: string;
    oddsFormat: string;
    dateFormat: string;
    bookmakers: string | null;
    preferBookmaker: string | null;
    allBookmakers: boolean;
    includeMultipliers: boolean | null;
  };
  game: EventOddsGame | null;
};

export type UseEventOddsParams = {
  league?: League;

  /**
   * Pass eventId directly if you already have the Odds API event id.
   * Otherwise pass homeId + awayId + commenceTime.
   */
  eventId?: string | null;

  homeId?: number | string | null;
  awayId?: number | string | null;
  commenceTime?: string | Date | null;

  markets?: string;
  regions?: string;
  oddsFormat?: "american" | "decimal";
  dateFormat?: "iso" | "unix";
  bookmakers?: string;
  preferBookmaker?: string;
  allBookmakers?: boolean;
  includeMultipliers?: boolean;

  /**
   * Use enabled=false when the screen does not have IDs/time ready yet.
   */
  enabled?: boolean;
};

export type EventOddsRefetchOverrides = Partial<UseEventOddsParams>;

function formatCommenceTime(value?: string | Date | null) {
  if (!value) return undefined;

  if (value instanceof Date) {
    return value.toISOString();
  }

  const rawValue = String(value).trim();

  return rawValue.length > 0 ? rawValue : undefined;
}

function normalizeId(value?: number | string | null) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
}

function getCanFetch(params: UseEventOddsParams) {
  if (params.enabled === false) return false;

  if (params.eventId && String(params.eventId).trim().length > 0) {
    return true;
  }

  return Boolean(
    normalizeId(params.homeId) &&
      normalizeId(params.awayId) &&
      formatCommenceTime(params.commenceTime),
  );
}

function getErrorMessage(err: unknown) {
  if (typeof err === "object" && err !== null) {
    const maybeError = err as {
      response?: {
        data?: {
          error?: string;
          details?: string | { message?: string };
          message?: string;
        };
      };
      message?: string;
    };

    const details = maybeError.response?.data?.details;

    if (maybeError.response?.data?.error) {
      return maybeError.response.data.error;
    }

    if (typeof details === "object" && details?.message) {
      return details.message;
    }

    if (typeof details === "string") {
      return details;
    }

    if (maybeError.response?.data?.message) {
      return maybeError.response.data.message;
    }

    if (maybeError.message) {
      return maybeError.message;
    }
  }

  return "Failed to fetch event odds";
}

export function useEventOdds(params: UseEventOddsParams = {}) {
  const {
    league = "nba",
    eventId,
    homeId,
    awayId,
    commenceTime,
    markets,
    regions = "us",
    oddsFormat = "american",
    dateFormat = "iso",
    bookmakers,
    preferBookmaker = "draftkings",
    allBookmakers = false,
    includeMultipliers,
    enabled = true,
  } = params;

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const [data, setData] = useState<EventOddsResponse | null>(null);
  const [game, setGame] = useState<EventOddsGame | null>(null);
  const [matchedEvent, setMatchedEvent] = useState<MatchedEvent | null>(null);
  const [requestUsage, setRequestUsage] = useState<
    EventOddsRequestUsage | undefined
  >(undefined);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseParams = useMemo<UseEventOddsParams>(
    () => ({
      league,
      eventId: eventId ? String(eventId).trim() : undefined,
      homeId: normalizeId(homeId),
      awayId: normalizeId(awayId),
      commenceTime: formatCommenceTime(commenceTime),
      markets,
      regions,
      oddsFormat,
      dateFormat,
      bookmakers,
      preferBookmaker,
      allBookmakers,
      includeMultipliers,
      enabled,
    }),
    [
      league,
      eventId,
      homeId,
      awayId,
      commenceTime,
      markets,
      regions,
      oddsFormat,
      dateFormat,
      bookmakers,
      preferBookmaker,
      allBookmakers,
      includeMultipliers,
      enabled,
    ],
  );

  const canFetch = useMemo(() => getCanFetch(baseParams), [baseParams]);

  const bookmakersList = useMemo(
    () => game?.bookmakers ?? [],
    [game?.bookmakers],
  );

  const preferredBookmaker = useMemo(() => {
    const normalizedPreferBookmaker = String(
      preferBookmaker || "draftkings",
    ).toLowerCase();

    return (
      bookmakersList.find(
        (bookmaker) =>
          String(bookmaker.key || "").toLowerCase() ===
          normalizedPreferBookmaker,
      ) ||
      bookmakersList[0] ||
      null
    );
  }, [bookmakersList, preferBookmaker]);

  const marketsList = useMemo(
    () => preferredBookmaker?.markets ?? [],
    [preferredBookmaker?.markets],
  );

  const clear = useCallback(() => {
    setData(null);
    setGame(null);
    setMatchedEvent(null);
    setRequestUsage(undefined);
    setError(null);
    setLoading(false);
    setRefreshing(false);
    setInitialFetchComplete(false);
  }, []);

  const fetchEventOdds = useCallback(
    async (
      overrides: EventOddsRefetchOverrides = {},
      isRefresh = false,
    ): Promise<EventOddsResponse | null> => {
      const mergedParams: UseEventOddsParams = {
        ...baseParams,
        ...overrides,
      };

      const mergedCanFetch = getCanFetch(mergedParams);

      if (!mergedCanFetch) {
        setLoading(false);
        setRefreshing(false);

        // Do not show a user-facing error while screen data is still being prepared.
        if (mergedParams.enabled === false) {
          setError(null);
        }

        return null;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await apiClient.get<EventOddsResponse>(
          "/api/odds/events/odds",
          {
            params: {
              league: mergedParams.league || "nba",
              eventId: mergedParams.eventId || undefined,
              homeId: normalizeId(mergedParams.homeId),
              awayId: normalizeId(mergedParams.awayId),
              commenceTime: formatCommenceTime(mergedParams.commenceTime),
              markets: mergedParams.markets || undefined,
              regions: mergedParams.regions || "us",
              oddsFormat: mergedParams.oddsFormat || "american",
              dateFormat: mergedParams.dateFormat || "iso",
              bookmakers: mergedParams.bookmakers || undefined,
              preferBookmaker: mergedParams.preferBookmaker || "draftkings",
              allBookmakers: mergedParams.allBookmakers ? "true" : "false",
              includeMultipliers:
                mergedParams.includeMultipliers !== undefined
                  ? String(mergedParams.includeMultipliers)
                  : undefined,
            },
          },
        );

        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return null;
        }

        const payload = response.data;

        setData(payload);
        setGame(payload.game || null);
        setMatchedEvent(payload.matchedEvent || null);
        setRequestUsage(payload.requestUsage);
        setError(null);

        return payload;
      } catch (err: unknown) {
        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return null;
        }

        const message = getErrorMessage(err);

        setError(message);
        return null;
      } finally {
        if (mountedRef.current && requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setInitialFetchComplete(true);
        }
      }
    },
    [baseParams],
  );

  const refetch = useCallback(
    (overrides: EventOddsRefetchOverrides = {}) =>
      fetchEventOdds(overrides, true),
    [fetchEventOdds],
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }

    if (!canFetch) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    fetchEventOdds();
  }, [enabled, canFetch, fetchEventOdds]);

  return {
    data,
    game,
    matchedEvent,
    requestUsage,

    bookmakers: bookmakersList,
    preferredBookmaker,
    markets: marketsList,

    loading,
    refreshing,
    initialFetchComplete,
    error,

    canFetch,
    isEmpty: initialFetchComplete && !loading && !error && !game,
    hasOdds: marketsList.length > 0,

    refetch,
    clear,
  };
}