import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FetchRacingEventsOptions,
  RacingEvent,
  RacingEventsResponse,
  UseRacingEventsOptions,
} from "types/racing/racing";
import { apiClient } from "utils/apiClient";

function getEndpoint(league: string) {
  return league === "f1"
    ? "api/games/racing/f1"
    : league === "nascarpremier"
      ? "api/games/racing/nascarpremier"
      : league === "nascarsecondary"
        ? "api/games/racing/nascarsecondary"
        : "api/games/racing/nascartruck";
}

function isLiveEvent(event: RacingEvent) {
  const status = event.status ?? {};

  const statusText = [
    status.state,
    status.name,
    status.description,
    status.detail,
    status.shortDetail,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(" ");

  return (
    status.state?.toLowerCase() === "in" ||
    statusText.includes("in progress") ||
    statusText.includes("live") ||
    statusText.includes("underway")
  );
}

export function useRacingEvents({
  date,
  league = "f1",
  enabled = true,
  pollLiveEvents = true,
  pollIntervalMs = 90_000,
}: UseRacingEventsOptions = {}) {
  const [data, setData] = useState<RacingEventsResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(() => {
    return dayjs(date ?? undefined).format("YYYYMMDD");
  }, [date]);

  const endpoint = useMemo(() => {
    return getEndpoint(league);
  }, [league]);

  const fetchEvents = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchRacingEventsOptions = {}) => {
      if (!enabled) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        setError(null);

        if (forceRefresh) {
          setRefreshing(true);
        } else if (!silent) {
          setLoading(true);
        }

        const response = await apiClient.get<RacingEventsResponse>(endpoint, {
          params: {
            date: formattedDate,
            league,
          },
        });

        setData(response.data);
      } catch (error: unknown) {
        console.error(`[useRacingEvents] ${league} fetch failed`, error);

        const requestError = error as {
          message?: string;
          response?: {
            data?: {
              error?: string;
            };
          };
        };

        setError(
          new Error(
            requestError.response?.data?.error ||
              requestError.message ||
              `Failed to fetch ${league.toUpperCase()} events`,
          ),
        );

        setData(null);
      } finally {
        if (!silent) {
          setLoading(false);
        }

        setRefreshing(false);
      }
    },
    [enabled, endpoint, formattedDate, league],
  );

  const refreshEvents = useCallback(async () => {
    await fetchEvents({
      forceRefresh: true,
    });
  }, [fetchEvents]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const hasLiveEvent = useMemo(() => {
    return data?.events.some(isLiveEvent) ?? false;
  }, [data]);

  useEffect(() => {
    if (!enabled || !pollLiveEvents || !hasLiveEvent) {
      return;
    }

    const interval = setInterval(() => {
      void fetchEvents({
        silent: true,
      });
    }, pollIntervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, fetchEvents, hasLiveEvent, pollIntervalMs, pollLiveEvents]);

  return {
    data,
    response: data,
    loading,
    refreshing,
    error,
    refreshEvents,
    refreshGames: refreshEvents,
    hasLiveEvent,
  };
}
