import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export type MMALeague = "ufc" | "mma";

export type MMAAthlete = {
  id?: string | number | null;
  uid?: string | null;
  name?: string | null;
  displayName?: string | null;
  shortName?: string | null;
  abbreviation?: string | null;
  headshot?: string | null;
  flag?: string | null;
  country?: string | null;
  record?: string | null;
  winner?: boolean | null;
  homeAway?: string | null;
  order?: number | null;
  result?: string | null;
  raw?: any;
};

export type MMAFight = {
  id?: string | number | null;
  uid?: string | null;
  name?: string | null;
  shortName?: string | null;
  date?: string | null;
  startDate?: string | null;
  timestamp?: number | null;
  status?: {
    state?: string | null;
    description?: string | null;
    detail?: string | null;
    shortDetail?: string | null;
    period?: number | null;
    clock?: number | string | null;
    displayClock?: string | null;
    completed?: boolean;
    statusPrimary?: string | null;
    [key: string]: any;
  } | null;
  weightClass?: string | null;
  cardSegment?: string | null;
  headline?: string | null;
  competitors?: MMAAthlete[];
  winner?: MMAAthlete | null;
  method?: string | null;
  round?: number | null;
  time?: string | null;
  order?: number | null;
  venue?: any;
  broadcasts?: string[];
  geoBroadcasts?: any[];
  raw?: any;
  [key: string]: any;
};

export type MMAEvent = {
  league?: any;
  id: string | number;
  uid?: string | null;
  name?: string | null;
  shortName?: string | null;
  headline?: string | null;
  date?: string | null;
  startDate?: string | null;
  timestamp?: number | null;
  season?: any;
  status?: {
    state?: string | null;
    description?: string | null;
    detail?: string | null;
    shortDetail?: string | null;
    period?: number | null;
    clock?: number | string | null;
    displayClock?: string | null;
    completed?: boolean;
    statusPrimary?: string | null;
    [key: string]: any;
  } | null;
  venue?: any;
  broadcasts?: string[];
  geoBroadcasts?: any[];
  fights?: MMAFight[];
  mainEvent?: MMAFight | null;
  competitors?: MMAAthlete[];
  home?: any;
  away?: any;
  raw?: any;

  gameId?: string | number | null;
  eventId?: string | number | null;
  parentEventId?: string | number | null;
  eventName?: string | null;
  eventShortName?: string | null;
  parentEvent?: any;

  [key: string]: any;
};

export type MMAGamesResponse = {
  league?: string;
  leagueInfo?: {
    id?: string | number | null;
    uid?: string | null;
    code?: string | null;
    name?: string | null;
    slug?: string | null;
    [key: string]: any;
  } | null;
  season?: any;
  date?: string | null;
  count?: number;
  events?: MMAEvent[];
  games?: MMAEvent[];
  [key: string]: any;
};

export type UseMMAGamesOptions = {
  date?: Date | string | number | null;
  league?: MMALeague;
  enabled?: boolean;
  pollLiveEvents?: boolean;
  pollIntervalMs?: number;
};

type FetchGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

function getEndpoint(league: MMALeague) {
  return league === "mma" ? "api/games/mma" : "api/games/mma/ufc";
}

function getRawMMAEvents(response: MMAGamesResponse | null): MMAEvent[] {
  if (Array.isArray(response?.events)) return response.events;
  if (Array.isArray(response?.games)) return response.games;

  return [];
}

function toSafeNumber(value: any, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function getFightId(event: MMAEvent, fight: MMAFight, index: number) {
  return (
    fight?.id ??
    fight?.uid ??
    `${event?.id ?? event?.uid ?? "mma-event"}-fight-${index}`
  );
}

function getFightDate(event: MMAEvent, fight: MMAFight) {
  return (
    fight?.date ??
    fight?.startDate ??
    fight?.raw?.date ??
    fight?.raw?.startDate ??
    event?.date ??
    event?.startDate ??
    null
  );
}

function getFightTimestamp(event: MMAEvent, fight: MMAFight, fightDate: any) {
  const timestamp =
    fight?.timestamp ??
    fight?.raw?.timestamp ??
    event?.timestamp ??
    (fightDate ? new Date(fightDate).getTime() : null);

  return Number.isFinite(Number(timestamp)) ? Number(timestamp) : null;
}

function getFightVenue(event: MMAEvent, fight: MMAFight) {
  return fight?.venue ?? fight?.raw?.venue ?? event?.venue ?? null;
}

function getFightBroadcasts(event: MMAEvent, fight: MMAFight) {
  if (Array.isArray(fight?.broadcasts)) return fight.broadcasts;
  if (Array.isArray(fight?.raw?.broadcasts)) return fight.raw.broadcasts;
  if (Array.isArray(event?.broadcasts)) return event.broadcasts;

  return [];
}

function getFightGeoBroadcasts(event: MMAEvent, fight: MMAFight) {
  if (Array.isArray(fight?.geoBroadcasts)) return fight.geoBroadcasts;
  if (Array.isArray(fight?.raw?.geoBroadcasts)) return fight.raw.geoBroadcasts;
  if (Array.isArray(event?.geoBroadcasts)) return event.geoBroadcasts;

  return [];
}

function sortFightsByOrder(fights: MMAFight[]) {
  return [...fights].filter(Boolean).sort((a, b) => {
    const aOrder = toSafeNumber(a?.order, 999);
    const bOrder = toSafeNumber(b?.order, 999);

    return aOrder - bOrder;
  });
}

function mapFightToGame({
  event,
  fight,
  index,
  response,
}: {
  event: MMAEvent;
  fight: MMAFight;
  index: number;
  response: MMAGamesResponse | null;
}): MMAEvent {
  const fightId = getFightId(event, fight, index);
  const fightDate = getFightDate(event, fight);

  return {
    ...fight,

    id: fightId,
    gameId: fightId,
    eventId: fightId,
    parentEventId: event?.id ?? null,

    league: event?.league ?? response?.leagueInfo ?? response?.league ?? null,
    season: event?.season ?? response?.season ?? null,

    date: fightDate,
    startDate: fightDate,
    timestamp: getFightTimestamp(event, fight, fightDate),

    venue: getFightVenue(event, fight),
    broadcasts: getFightBroadcasts(event, fight),
    geoBroadcasts: getFightGeoBroadcasts(event, fight),

    eventName: event?.name ?? null,
    eventShortName: event?.shortName ?? null,
    parentEvent: event,

    mainEvent: fight,
    fights: [fight],

    raw: fight?.raw ?? fight,
  };
}

function normalizeMMAEventToGames(
  event: MMAEvent,
  response: MMAGamesResponse | null,
): MMAEvent[] {
  const fights = Array.isArray(event?.fights) ? event.fights : [];

  if (!fights.length) {
    return [
      {
        ...event,
        gameId: event?.gameId ?? event?.id ?? null,
        eventId: event?.eventId ?? event?.id ?? null,
        parentEventId: event?.parentEventId ?? null,
        eventName: event?.eventName ?? event?.name ?? null,
        eventShortName: event?.eventShortName ?? event?.shortName ?? null,
      },
    ];
  }

  return sortFightsByOrder(fights).map((fight, index) =>
    mapFightToGame({
      event,
      fight,
      index,
      response,
    }),
  );
}

function normalizeMMAGames(response: MMAGamesResponse | null): MMAEvent[] {
  const events = getRawMMAEvents(response);

  return events.flatMap((event) => normalizeMMAEventToGames(event, response));
}

function isLiveStatus(status: any) {
  const state = String(status?.state ?? "").toLowerCase();
  const description = String(status?.description ?? "").toLowerCase();
  const detail = String(status?.detail ?? "").toLowerCase();
  const shortDetail = String(status?.shortDetail ?? "").toLowerCase();
  const statusPrimary = String(status?.statusPrimary ?? "").toLowerCase();

  const text = `${description} ${detail} ${shortDetail} ${statusPrimary}`;

  return (
    state === "in" ||
    text.includes("live") ||
    text.includes("in progress") ||
    text.includes("ongoing")
  );
}

function isLiveMMAEvent(event: MMAEvent | any) {
  if (isLiveStatus(event?.status)) return true;
  if (isLiveStatus(event?.mainEvent?.status)) return true;

  const fights = Array.isArray(event?.fights) ? event.fights : [];

  return fights.some((fight: MMAFight) => isLiveStatus(fight?.status));
}

export function useMMAGames({
  date,
  league = "ufc",
  enabled = true,
  pollLiveEvents = true,
  pollIntervalMs = 90000,
}: UseMMAGamesOptions = {}) {
  const [data, setData] = useState<MMAGamesResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(() => {
    if (!date) return dayjs().format("YYYYMMDD");

    return dayjs(date).format("YYYYMMDD");
  }, [date]);

  const endpoint = useMemo(() => getEndpoint(league), [league]);

  const rawEvents = useMemo(() => getRawMMAEvents(data), [data]);

  const games = useMemo(() => normalizeMMAGames(data), [data]);

  const fetchGames = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchGamesOptions = {}) => {
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

        const response = await apiClient.get<MMAGamesResponse>(endpoint, {
          params: { date: formattedDate },
        });

        setData(response.data);
      } catch (err: any) {
        console.error(`[useMMAGames] ${league} fetch failed`, err);

        setError(
          new Error(
            err?.response?.data?.error ||
              err?.message ||
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

  const refreshGames = useCallback(async () => {
    await fetchGames({ forceRefresh: true });
  }, [fetchGames]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const hasLiveEvent = useMemo(() => {
    return rawEvents.some(isLiveMMAEvent) || games.some(isLiveMMAEvent);
  }, [rawEvents, games]);

  useEffect(() => {
    if (!pollLiveEvents || !hasLiveEvent) return;

    const interval = setInterval(() => {
      fetchGames({ silent: true });
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [fetchGames, hasLiveEvent, pollIntervalMs, pollLiveEvents]);

  return {
    data,
    response: data,

    // Raw event-level API response.
    rawEvents,
    events: rawEvents,

    // Flattened fight-level list for MMAGamesList.
    games,
    flatGames: games,

    loading,
    refreshing,
    error,
    refreshGames,
    hasLiveEvent,
  };
}