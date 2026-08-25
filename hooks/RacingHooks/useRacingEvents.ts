import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import {
  FetchRacingEventsOptions,
  RacingEvent,
  RacingEventsResponse,
  UseRacingEventsOptions,
} from "types/racing/racing";
import { apiClient } from "utils/apiClient";
import { formatDateToUTCYYYYMMDD } from "utils/dateUtils";

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
    competition.startDate ||
      competition.date ||
      competition.timestamp,
  );

  const hasStatus = Boolean(
    competition.status &&
      typeof competition.status === "object" &&
      Object.keys(competition.status).length > 0,
  );

  const hasDrivers =
    Array.isArray(competition.drivers) &&
    competition.drivers.length > 0;

  const hasBroadcasts =
    Array.isArray(competition.broadcasts) &&
    competition.broadcasts.length > 0;

  return (
    hasId ||
    hasType ||
    hasDate ||
    hasStatus ||
    hasDrivers ||
    hasBroadcasts
  );
}

function getSessionName(
  competition: RacingCompetition,
  index: number,
) {
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
  const sessionName = getSessionName(
    competition,
    competitionIndex,
  );

  const sessionDrivers = Array.isArray(competition.drivers)
    ? competition.drivers
    : [];

  const sessionId =
    competition.id ||
    `${event.id || "racing-event"}-${competitionIndex}`;

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

  const sessionBroadcasts = Array.isArray(
    competition.broadcasts,
  )
    ? competition.broadcasts
    : [];

  const sessionGeoBroadcasts = Array.isArray(
    competition.geoBroadcasts,
  )
    ? competition.geoBroadcasts
    : [];

  const eventBroadcasts = Array.isArray(event.broadcasts)
    ? event.broadcasts
    : [];

  const eventGeoBroadcasts = Array.isArray(
    event.geoBroadcasts,
  )
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
    broadcast:
      competition.broadcast ||
      sessionBroadcasts.join("/") ||
      null,
    driverCount: sessionDrivers.length,
  };

  return {
    ...event,

    /*
     * Each session needs its own identity so FlatList renders every
     * F1 or NASCAR session as a separate card.
     */
    id: sessionId,
    uid: sessionUid,

    /*
     * Keep the full weekend/race name in `name`.
     * Use the competition type for the individual session label.
     *
     * Example:
     * name: "Moët & Chandon Belgian Grand Prix"
     * shortName: "Race"
     */
    name:
      event.name ||
      event.shortName ||
      sessionName,

    shortName: sessionName,

    date: sessionDate,
    startDate: sessionDate,
    timestamp: sessionTimestamp,

    /*
     * Each flattened event represents one competition/session.
     */
    competitions: [competition],

    /*
     * Use the individual session status rather than the overall
     * racing-weekend status.
     */
    status: competition.status ?? event.status,

    primaryCompetition: competitionSummary,
    driverCompetition: competitionSummary,

    /*
     * Drivers may be empty for upcoming practice, qualifying,
     * or race sessions. The session is still preserved as long
     * as the competition contains other valid data.
     */
    drivers: sessionDrivers,

    winner: competition.winner ?? null,

    broadcasts:
      sessionBroadcasts.length > 0
        ? sessionBroadcasts
        : eventBroadcasts,

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

    /*
     * Keep the original event when ESPN does not provide any
     * usable competition/session objects.
     */
    if (competitions.length === 0) {
      return [event];
    }

    return competitions.map(
      (competition, competitionIndex) =>
        createSessionEvent(
          event,
          competition,
          competitionIndex,
        ),
    );
  });
}

function getEventSortTimestamp(event: RacingEvent) {
  if (
    typeof event.timestamp === "number" &&
    Number.isFinite(event.timestamp)
  ) {
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
    return (
      getEventSortTimestamp(first) -
      getEventSortTimestamp(second)
    );
  });
}

export function useRacingEvents({
  date,
  league = "f1",
  enabled = true,
  pollLiveEvents = true,
  pollIntervalMs = 90_000,
}: UseRacingEventsOptions = {}) {
  /*
   * Individual sessions displayed in the UI.
   *
   * F1 examples:
   * - Practice 1
   * - Practice 2
   * - Practice 3
   * - Qualifying
   * - Race
   *
   * NASCAR normally provides fewer session objects.
   */
  const [games, setGames] = useState<RacingEvent[]>([]);

  /*
   * Preserve the original weekend-level events from the API.
   */
  const [weekendEvents, setWeekendEvents] = useState<
    RacingEvent[]
  >([]);

  /*
   * Preserve the complete backend response.
   */
  const [response, setResponse] =
    useState<RacingEventsResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /*
   * Prevent an older request from replacing data from a newer
   * request when the selected date or league changes quickly.
   */
  const latestRequestIdRef = useRef(0);

  const normalizedLeague = useMemo(() => {
    return normalizeLeague(league);
  }, [league]);

  const formattedDate = useMemo(() => {
    return formatDateToUTCYYYYMMDD(date);
  }, [date]);

  const endpoint = useMemo(() => {
    return getEndpoint(normalizedLeague);
  }, [normalizedLeague]);

  const canFetch =
    enabled && Boolean(formattedDate);

  const fetchEvents = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchRacingEventsOptions = {}) => {
      const requestId =
        latestRequestIdRef.current + 1;

      latestRequestIdRef.current = requestId;

      if (!canFetch || !formattedDate) {
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

          /*
           * Clear the previous date's data while the selected
           * racing date is loading.
           */
          setGames([]);
          setWeekendEvents([]);
        }

        const apiResponse =
          await apiClient.get<RacingEventsResponse>(
            endpoint,
            {
              params: {
                date: formattedDate,
              },
            },
          );

        /*
         * Ignore the response if a newer request was started
         * before this one finished.
         */
        if (
          requestId !== latestRequestIdRef.current
        ) {
          return;
        }

        const nextResponse = apiResponse.data;

        const rawEvents = Array.isArray(
          nextResponse?.events,
        )
          ? nextResponse.events
          : [];

        /*
         * Remove ESPN's empty competition objects and convert
         * valid competitions into individual session cards.
         */
        const sessionEvents = sortSessions(
          flattenRacingSessions(rawEvents),
        );

        setResponse(nextResponse);
        setWeekendEvents(rawEvents);
        setGames(sessionEvents);
      } catch (requestError: unknown) {
        if (
          requestId !== latestRequestIdRef.current
        ) {
          return;
        }

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
        /*
         * An outdated request must not modify loading state
         * belonging to the most recent request.
         */
        if (
          requestId === latestRequestIdRef.current
        ) {
          if (!silent) {
            setLoading(false);
          }

          setRefreshing(false);
        }
      }
    },
    [
      canFetch,
      endpoint,
      formattedDate,
      normalizedLeague,
    ],
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
    return games.some(isLiveEvent);
  }, [games]);

  useLiveSportsSubscription<RacingEventsResponse>({
    enabled: canFetch && pollLiveEvents && hasLiveEvent && pollIntervalMs > 0,
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
    /*
     * Individual competition/session events used by the UI.
     */
    games,
    events: games,

    /*
     * Original weekend-level events.
     */
    weekendEvents,

    /*
     * Complete backend response.
     */
    response,

    loading,
    refreshing,
    error,

    refreshEvents,
    refreshGames: refreshEvents,

    hasLiveEvent,
  };
}
