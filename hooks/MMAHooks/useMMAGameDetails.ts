import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";
import type { MMAAthlete, MMAFight } from "./useMMAGames";

export type { MMAAthlete, MMAFight } from "./useMMAGames";

export type MMAScore = {
  gameId: string;
  lastUpdated?: number;

  status: "canceled" | "scheduled" | "in_play" | "final";
  gameStatusDescription?: string | null;
  gameStatusDetail?: string | null;
  statusText?: string | null;
  displayClock?: string | null;
  period?: number | null;

  eventName?: string | null;
  headline?: string | null;

  mainEvent?: MMAFight | null;
  fights?: MMAFight[];
  competitors?: MMAAthlete[];

  plays?: any[];
  lastPlay?: any | null;

  boxScore?: any | null;
  leaders?: any[];

  home: { total: number | null };
  away: { total: number | null };
  homeTeam: string;
  awayTeam: string;

  teamStats: any[];
  playerStats: any[];
  timeouts: { home: number | null; away: number | null };
  fouls: { home: number | null; away: number | null };
};

export type MMAGameDetails = {
  broadcast?: string | null;
  broadcasts?: string[];
  headline?: string | null;

  officials?: any[];
  injuries?: any[];
  highlights?: any[];
  plays?: any[];

  neutralSite?: boolean;
  venue?: any | null;
  attendance?: number | null;

  fights?: MMAFight[];
  mainEvent?: MMAFight | null;
  card?: any;

  predictor?: any[];
  records?: {
    home?: { overall?: string | null };
    away?: { overall?: string | null };
  };
};

export type UseMMAGameDetailsOptions = {
  enabled?: boolean;
  pollLiveEvents?: boolean;
  pollIntervalMs?: number;
};

type FetchDetailsOptions = {
  silent?: boolean;
};

function getStatusDescription(status: any) {
  return (
    status?.description ??
    status?.detail ??
    status?.shortDetail ??
    status?.long ??
    null
  );
}

function normalizeStatus(status: any): MMAScore["status"] {
  const state = String(status?.state ?? "").toLowerCase();
  const text = [
    status?.description,
    status?.detail,
    status?.shortDetail,
    status?.long,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (state === "in" || text.includes("live") || text.includes("in progress")) {
    return "in_play";
  }

  if (state === "post" || status?.completed || text.includes("final")) {
    return "final";
  }

  if (state.includes("cancel") || text.includes("cancel")) {
    return "canceled";
  }

  return "scheduled";
}

function getFighterName(fighter: any) {
  return (
    fighter?.displayName ??
    fighter?.name ??
    fighter?.full_name ??
    fighter?.fullName ??
    fighter?.shortName ??
    fighter?.abbreviation ??
    "TBD"
  );
}

function getMainFight(event: any): MMAFight | null {
  if (event?.mainEvent) return event.mainEvent;

  const fights = Array.isArray(event?.fights) ? event.fights : [];

  return fights[0] ?? null;
}

function getCompetitors(event: any, mainEvent: MMAFight | null) {
  const mainCompetitors = Array.isArray(mainEvent?.competitors)
    ? (mainEvent?.competitors ?? [])
    : [];
  const eventCompetitors = Array.isArray(event?.competitors)
    ? event.competitors
    : [];

  if (mainCompetitors.length >= 2) return mainCompetitors;
  if (eventCompetitors.length >= 2) return eventCompetitors;

  return [event?.home, event?.away].filter(Boolean);
}

function normalizeScoreFromEvent(event: any, gameId: string): MMAScore | null {
  if (!event || typeof event !== "object") return null;

  const mainEvent = getMainFight(event);
  const competitors = getCompetitors(event, mainEvent);
  const status = normalizeStatus(event?.status ?? mainEvent?.status);
  const statusDescription = getStatusDescription(
    event?.status ?? mainEvent?.status,
  );

  return {
    gameId,
    lastUpdated: Date.now(),
    status,
    gameStatusDescription: statusDescription,
    gameStatusDetail:
      event?.status?.detail ?? mainEvent?.status?.detail ?? null,
    statusText: event?.status?.shortDetail ?? null,
    displayClock: event?.status?.displayClock ?? null,
    period: event?.status?.period ?? null,
    eventName: event?.name ?? event?.shortName ?? null,
    headline: event?.headline ?? mainEvent?.headline ?? null,
    mainEvent,
    fights: Array.isArray(event?.fights) ? event.fights : [],
    competitors,
    plays: [],
    lastPlay: null,
    boxScore: null,
    leaders: [],
    home: { total: null },
    away: { total: null },
    homeTeam: getFighterName(event?.home ?? competitors[0]),
    awayTeam: getFighterName(event?.away ?? competitors[1]),
    teamStats: [],
    playerStats: [],
    timeouts: { home: null, away: null },
    fouls: { home: null, away: null },
  };
}

function normalizeDetailsFromEvent(event: any): MMAGameDetails | undefined {
  if (!event || typeof event !== "object") return undefined;

  return {
    broadcast: event?.broadcast ?? event?.broadcasts?.[0] ?? null,
    broadcasts: Array.isArray(event?.broadcasts) ? event.broadcasts : [],
    headline: event?.headline ?? event?.mainEvent?.headline ?? null,
    officials: event?.officials ?? [],
    injuries: event?.injuries ?? [],
    highlights: event?.highlights ?? [],
    plays: event?.plays ?? [],
    neutralSite: event?.neutralSite ?? false,
    venue: event?.venue ?? null,
    attendance: event?.attendance ?? null,
    fights: Array.isArray(event?.fights) ? event.fights : [],
    mainEvent: event?.mainEvent ?? getMainFight(event),
    card: event?.card ?? null,
    predictor: event?.predictor ?? [],
    records: event?.records ?? {},
  };
}

function isLiveMMAScore(score?: MMAScore) {
  return score?.status === "in_play";
}

export const useMMAGameDetails = (
  league: string | undefined,
  gameId?: string | number | null,
  options: UseMMAGameDetailsOptions = {},
) => {
  const {
    enabled = true,
    pollLiveEvents = true,
    pollIntervalMs = 10000,
  } = options;

  const [score, setScore] = useState<MMAScore | undefined>();
  const [details, setDetails] = useState<MMAGameDetails | undefined>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const skipFetch = !enabled || !league || !gameId;

  const fetchDetails = useCallback(
    async ({ silent = false }: FetchDetailsOptions = {}) => {
      if (skipFetch) return;

      try {
        if (!silent) setLoading(true);
        setWarning(null);

        const { data } = await apiClient.get("api/games/mma/details", {
          params: { league, gameId },
        });

        const eventData = data?.event ?? data?.game ?? data?.details?.event;
        const nextScore =
          data?.score ?? normalizeScoreFromEvent(eventData, String(gameId));
        const nextDetails =
          data?.details ?? normalizeDetailsFromEvent(eventData);

        if (nextScore) {
          setScore(nextScore);
          setDetails(nextDetails);
          setLastRefresh(new Date());
        } else {
          setWarning("Fight data unavailable");
        }
      } catch (err: any) {
        console.warn(`[${league}] MMA game details fetch failed`, err);

        setWarning(
          err?.response?.data?.error ||
            err?.message ||
            "Unable to refresh MMA game data",
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [league, gameId, skipFetch],
  );

  useEffect(() => {
    if (skipFetch) return;
    fetchDetails({ silent: false });
  }, [skipFetch, fetchDetails]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!pollLiveEvents || !isLiveMMAScore(score)) return;

    intervalRef.current = setInterval(() => {
      fetchDetails({ silent: true });
    }, pollIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchDetails, pollIntervalMs, pollLiveEvents, score, score?.status]);

  const refresh = useCallback(() => {
    if (!skipFetch) {
      fetchDetails({ silent: false });
    }
  }, [fetchDetails, skipFetch]);

  return {
    score,
    details,
    loading,
    warning,
    refresh,
    isLive: isLiveMMAScore(score),
    lastRefresh,
  };
};
