import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import {
  FetchRacingEventsOptions,
  RacingEvent,
  RacingEventsResponse,
  UseRacingEventsOptions,
} from "types/racing/racing";
import { apiClient } from "utils/apiClient";
import { formatDateToUTCYYYYMMDD } from "utils/common/dateUtils";

type RacingCompetition = RacingEvent["competitions"][number];

function normalizeLeague(value: string) {
  return String(value || "f1")
    .trim()
    .toLowerCase();
}

function getEndpoint(league: string) {
  return `/api/games/racing/${normalizeLeague(league)}`;
}

function getTimestamp(value?: string | null) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
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
    String(status.state ?? "").toLowerCase() === "in" ||
    statusText.includes("in progress") ||
    statusText.includes("live") ||
    statusText.includes("underway")
  );
}

function isValidCompetition(
  competition: RacingCompetition | null | undefined,
): competition is RacingCompetition {
  if (!competition || typeof competition !== "object") {
    return false;
  }

  const hasId = Boolean(competition.id || competition.uid);

  const hasType = Boolean(
    competition.type?.text ||
    competition.type?.name ||
    competition.type?.abbreviation,
  );

  const hasDate = Boolean(
    competition.startDate || competition.date || competition.timestamp,
  );

  const hasStatus = Boolean(
    competition.status &&
    typeof competition.status === "object" &&
    Object.keys(competition.status).length > 0,
  );

  const hasDrivers =
    Array.isArray(competition.drivers) && competition.drivers.length > 0;

  const hasBroadcasts =
    Array.isArray(competition.broadcasts) && competition.broadcasts.length > 0;

  return (
    hasId || hasType || hasDate || hasStatus || hasDrivers || hasBroadcasts
  );
}

function getSessionName(competition: RacingCompetition, index: number) {
  return (
    competition.type?.text ||
    competition.type?.abbreviation ||
    competition.type?.name ||
    `Session ${index + 1}`
  );
}

function createSessionEvent(
  event: RacingEvent,
  competition: RacingCompetition,
  competitionIndex: number,
): RacingEvent {
  const sessionName = getSessionName(competition, competitionIndex);

  const sessionDrivers = Array.isArray(competition.drivers)
    ? competition.drivers
    : [];

  const sessionId =
    competition.id || `${event.id || "racing-event"}-${competitionIndex}`;

  const sessionUid =
    competition.uid ||
    `${event.uid || event.id || "racing-event"}-${competitionIndex}`;

  const sessionDate =
    competition.startDate ||
    competition.date ||
    event.startDate ||
    event.date ||
    null;

  const sessionTimestamp =
    competition.timestamp ??
    getTimestamp(sessionDate) ??
    event.timestamp ??
    null;

  const sessionBroadcasts = Array.isArray(competition.broadcasts)
    ? competition.broadcasts
    : [];

  const sessionGeoBroadcasts = Array.isArray(competition.geoBroadcasts)
    ? competition.geoBroadcasts
    : [];

  const eventBroadcasts = Array.isArray(event.broadcasts)
    ? event.broadcasts
    : [];

  const eventGeoBroadcasts = Array.isArray(event.geoBroadcasts)
    ? event.geoBroadcasts
    : [];

  const competitionSummary = {
    id: competition.id ?? null,
    uid: competition.uid ?? null,
    date: competition.date ?? sessionDate,
    startDate: competition.startDate ?? sessionDate,
    timestamp: competition.timestamp ?? sessionTimestamp,
    type: competition.type,
    status: competition.status,
    broadcasts: sessionBroadcasts,
    broadcast: competition.broadcast || sessionBroadcasts.join("/") || null,
    driverCount: sessionDrivers.length,
  };

  return {
    ...event,

    // Give each session a distinct list key.
    id: sessionId,
    uid: sessionUid,

    // Keep the weekend name and use the competition type as the session label.
    name: event.name || event.shortName || sessionName,

    shortName: sessionName,

    date: sessionDate,
    startDate: sessionDate,
    timestamp: sessionTimestamp,

    competitions: [competition],

    // Session status can differ from the weekend status.
    status: competition.status ?? event.status,

    primaryCompetition: competitionSummary,
    driverCompetition: competitionSummary,

    // Upcoming sessions can be valid before drivers are available.
    drivers: sessionDrivers,

    winner: competition.winner ?? null,

    broadcasts:
      sessionBroadcasts.length > 0 ? sessionBroadcasts : eventBroadcasts,

    broadcast:
      competition.broadcast ||
      sessionBroadcasts.join("/") ||
      event.broadcast ||
      eventBroadcasts.join("/") ||
      null,

    geoBroadcasts:
      sessionGeoBroadcasts.length > 0
        ? sessionGeoBroadcasts
        : eventGeoBroadcasts,
  };
}

function flattenRacingSessions(events: RacingEvent[]) {
  return events.flatMap((event) => {
    const competitions = Array.isArray(event.competitions)
      ? event.competitions.filter(isValidCompetition)
      : [];

    // Retain weekend events with no usable sessions.
    if (competitions.length === 0) {
      return [event];
    }

    return competitions.map((competition, competitionIndex) =>
      createSessionEvent(event, competition, competitionIndex),
    );
  });
}

function getEventSortTimestamp(event: RacingEvent) {
  if (typeof event.timestamp === "number" && Number.isFinite(event.timestamp)) {
    return event.timestamp;
  }

  return (
    getTimestamp(event.startDate) ??
    getTimestamp(event.date) ??
    Number.MAX_SAFE_INTEGER
  );
}

function sortSessions(events: RacingEvent[]) {
  return [...events].sort((first, second) => {
    return getEventSortTimestamp(first) - getEventSortTimestamp(second);
  });
}

export function useRacingEvents({
  date,
  league = "f1",
  enabled = true,
  onScoreboardCalendar,
  pollLiveEvents = true,
  pollIntervalMs = 90_000,
}: UseRacingEventsOptions = {}) {
  const [games, setGames] = useState<RacingEvent[]>([]);

  const [weekendEvents, setWeekendEvents] = useState<RacingEvent[]>([]);

  const [response, setResponse] = useState<RacingEventsResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ignore responses from superseded requests.
  const latestRequestIdRef = useRef(0);

  const normalizedLeague = normalizeLeague(league);

  const formattedDate = useMemo(() => {
    return formatDateToUTCYYYYMMDD(date);
  }, [date]);

  const endpoint = getEndpoint(normalizedLeague);

  const canFetch = enabled && (Boolean(formattedDate) || (!date && Boolean(onScoreboardCalendar)));

  const fetchEvents = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchRacingEventsOptions = {}) => {
      const requestId = latestRequestIdRef.current + 1;

      latestRequestIdRef.current = requestId;

      if (!canFetch) {
        setGames([]);
        setWeekendEvents([]);
        setResponse(null);
        setError(null);
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

          setGames([]);
          setWeekendEvents([]);
        }

        const apiResponse = await apiClient.get<RacingEventsResponse>(
          endpoint,
          {
            params: {
              ...(formattedDate ? { date: formattedDate } : {}),
            },
          },
        );

        /*
         * Ignore the response if a newer request was started
         * before this one finished.
         */
        if (requestId !== latestRequestIdRef.current) {
          return;
        }

        const nextResponse = apiResponse.data;

        const rawEvents = Array.isArray(nextResponse?.events)
          ? nextResponse.events
          : [];

        const sessionEvents = sortSessions(flattenRacingSessions(rawEvents));

        onScoreboardCalendar?.(nextResponse);
        setResponse(nextResponse);
        setWeekendEvents(rawEvents);
        setGames(sessionEvents);
      } catch (requestError: unknown) {
        if (requestId !== latestRequestIdRef.current) {
          return;
        }

        onScoreboardCalendar?.(null);
        console.error(
          `[useRacingEvents] ${normalizedLeague} fetch failed`,
          requestError,
        );

        const normalizedError = requestError as {
          message?: string;
          response?: {
            data?: {
              error?: string;
              message?: string;
            };
          };
        };

        setError(
          new Error(
            normalizedError.response?.data?.error ||
              normalizedError.response?.data?.message ||
              normalizedError.message ||
              `Failed to fetch ${normalizedLeague.toUpperCase()} events`,
          ),
        );

        setGames([]);
        setWeekendEvents([]);
        setResponse(null);
      } finally {
        if (requestId === latestRequestIdRef.current) {
          if (!silent) {
            setLoading(false);
          }

          setRefreshing(false);
        }
      }
    },
    [canFetch, endpoint, formattedDate, normalizedLeague, onScoreboardCalendar],
  );

  const refreshEvents = useCallback(async () => {
    await fetchEvents({
      forceRefresh: true,
    });
  }, [fetchEvents]);

  useEffect(() => {
    void Promise.resolve().then(() => fetchEvents());
  }, [fetchEvents]);

  const hasLiveEvent = useMemo(() => {
    return games.some(isLiveEvent);
  }, [games]);

  useLiveSportsSubscription<RacingEventsResponse>({
    enabled:
      canFetch && pollLiveEvents && !loading && pollIntervalMs > 0 &&
      (hasLiveEvent || games.some(shouldTrackGameUpdates)),
    kind: "scoreboard",
    payload: {
      sport: "racing",
      league: normalizedLeague,
      feed: "eventList",
      date: formattedDate,
    },
    onUpdate: (payload) => {
      const rawEvents = Array.isArray(payload?.events) ? payload.events : [];
      const sessionEvents = sortSessions(flattenRacingSessions(rawEvents));

      setResponse(payload);
      setWeekendEvents(rawEvents);
      setGames(sessionEvents);
      setError(null);
    },
  });

  return {
    games,
    events: games,

    weekendEvents,

    response,

    loading,
    refreshing,
    error,

    refreshEvents,
    refreshGames: refreshEvents,

    hasLiveEvent,
  };
}
