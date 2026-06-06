import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BaseballTeam } from "types/baseball";
import { apiClient } from "utils/apiClient";

/* =====================================================
   TYPES
===================================================== */

export type CBTeamWithGroups = BaseballTeam & {
  abbreviation?: string | null;
  groups?: {
    id: string;
    shortName: string;
    parent?: {
      id: string;
      shortName: string;
      isConference: boolean;
    };
    isConference: boolean;
  };
};

export type CBTeamRank = {
  current?: number | string | null;
  previous?: number | string | null;
  points?: number | string | null;
  firstPlaceVotes?: number | string | null;
  trend?: string | number | null;
  recordSummary?: string | null;
  team?: CBTeamWithGroups | null;
  date?: string;
  lastUpdated?: string;
};

export type CBRankPoll = {
  id?: string;
  type?: string;
  shortName?: string;
  name?: string;
  headline?: string;
  date?: string;
  week?: string;
  ranks: CBTeamRank[];
  droppedOut: CBTeamRank[];
};

export type CBRankingsResponse = {
  updated?: string;
  rankings: {
    d1BaseballPoll?: CBRankPoll;
    cbTournamentPoll?: CBRankPoll;
    all?: CBRankPoll[];
    [key: string]: CBRankPoll | CBRankPoll[] | undefined;
  };
};

/* =====================================================
   CONFIG
===================================================== */

const CACHE_TTL = 6 * 60 * 60 * 1000;
const EMPTY_ALL_RANKINGS: CBRankPoll[] = [];

/* =====================================================
   NORMALIZATION
===================================================== */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

const toOptionalString = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  return typeof value === "string" ? value : String(value);
};

const toNullableRankValue = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "number" || typeof value === "string") return value;
  return undefined;
};

const normalizeRank = (rank: unknown): CBTeamRank | undefined => {
  if (!isRecord(rank)) return undefined;

  return {
    current: toNullableRankValue(rank.current),
    previous: toNullableRankValue(rank.previous),
    points: toNullableRankValue(rank.points),
    firstPlaceVotes: toNullableRankValue(rank.firstPlaceVotes),
    trend: toNullableRankValue(rank.trend),
    recordSummary: toOptionalString(rank.recordSummary),
    team: isRecord(rank.team)
      ? (rank.team as unknown as CBTeamWithGroups)
      : null,
    date: toOptionalString(rank.date),
    lastUpdated: toOptionalString(rank.lastUpdated),
  };
};

const normalizeRanks = (ranks: unknown): CBTeamRank[] => {
  if (!Array.isArray(ranks)) return [];

  return ranks.map(normalizeRank).filter(isDefined);
};

const normalizePoll = (poll: unknown): CBRankPoll | undefined => {
  if (!isRecord(poll)) return undefined;

  return {
    id: toOptionalString(poll.id),
    type: toOptionalString(poll.type),
    shortName: toOptionalString(poll.shortName),
    name: toOptionalString(poll.name),
    headline: toOptionalString(poll.headline),
    date: toOptionalString(poll.date),
    week: toOptionalString(poll.week),
    ranks: normalizeRanks(poll.ranks),
    droppedOut: normalizeRanks(poll.droppedOut),
  };
};

const normalizePollArray = (polls: unknown): CBRankPoll[] => {
  if (!Array.isArray(polls)) return [];

  return polls.map(normalizePoll).filter(isDefined);
};

const createEmptyRankingsResponse = (): CBRankingsResponse => ({
  rankings: { all: [] },
});

const normalizeCBRankingsResponse = (data: unknown): CBRankingsResponse => {
  if (Array.isArray(data)) {
    return { rankings: { all: normalizePollArray(data) } };
  }

  if (!isRecord(data)) {
    return createEmptyRankingsResponse();
  }

  const updated = toOptionalString(data.updated);
  const rawRankings = data.rankings;

  if (Array.isArray(rawRankings)) {
    return {
      updated,
      rankings: { all: normalizePollArray(rawRankings) },
    };
  }

  if (!isRecord(rawRankings)) {
    return {
      updated,
      rankings: { all: [] },
    };
  }

  const rankings: CBRankingsResponse["rankings"] = { all: [] };

  Object.entries(rawRankings).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      rankings[key] = normalizePollArray(value);
      return;
    }

    const poll = normalizePoll(value);
    if (poll) {
      rankings[key] = poll;
    }
  });

  if (!Array.isArray(rankings.all)) {
    rankings.all = [];
  }

  return { updated, rankings };
};

const getErrorMessage = (err: unknown) => {
  if (isRecord(err)) {
    const response = isRecord(err.response) ? err.response : undefined;
    const data = isRecord(response?.data) ? response.data : undefined;

    const apiError = toOptionalString(data?.error);
    const statusText = toOptionalString(response?.statusText);
    const message = toOptionalString(err.message);

    return apiError || statusText || message || "Failed to fetch rankings";
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Failed to fetch rankings";
};

/* =====================================================
   HOOK
===================================================== */

export const useCBRankings = (league: "cb" | "sb") => {
  const CACHE_KEY = `rankings_cache_${league}`;
  const LAST_REFRESH_KEY = `rankings_last_refresh_${league}`;

  const [rankingsResponse, setRankingsResponse] = useState<CBRankingsResponse>(
    createEmptyRankingsResponse,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------------------------
     CACHE HELPERS
  -------------------------------------------------- */

  const saveCache = useCallback(
    async (data: CBRankingsResponse) => {
      try {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data }),
        );
      } catch (err) {
        console.warn(
          `⚠️ Failed to cache ${league.toUpperCase()} rankings:`,
          err,
        );
      }
    },
    [CACHE_KEY, league],
  );

  const loadCache =
    useCallback(async (): Promise<CBRankingsResponse | null> => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsed = JSON.parse(cached) as {
          timestamp?: unknown;
          data?: unknown;
        };
        const timestamp = Number(parsed.timestamp);

        if (Number.isFinite(timestamp) && Date.now() - timestamp < CACHE_TTL) {
          return normalizeCBRankingsResponse(parsed.data);
        }

        return null;
      } catch {
        return null;
      }
    }, [CACHE_KEY]);

  /* --------------------------------------------------
     FETCH
  -------------------------------------------------- */

  const fetchLatest = useCallback(async () => {
    try {
      const res = await apiClient.get<unknown>(
        `/api/standings/${league}/rankings`,
      );
      const normalized = normalizeCBRankingsResponse(res.data);

      setRankingsResponse(normalized);
      setError(null);

      await saveCache(normalized);
      await AsyncStorage.setItem(LAST_REFRESH_KEY, Date.now().toString());
    } catch (err: unknown) {
      console.error("❌ Fetch CB rankings failed:", err);
      setError(getErrorMessage(err));
    }
  }, [LAST_REFRESH_KEY, league, saveCache]);

  /* --------------------------------------------------
     BACKGROUND REFRESH
  -------------------------------------------------- */

  const fetchLatestInBackground = useCallback(async () => {
    try {
      const last = await AsyncStorage.getItem(LAST_REFRESH_KEY);

      if (last && Date.now() - parseInt(last, 10) < 5 * 60 * 1000) return;

      await fetchLatest();
    } catch {}
  }, [LAST_REFRESH_KEY, fetchLatest]);

  /* --------------------------------------------------
     INITIAL LOAD
  -------------------------------------------------- */

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const cached = await loadCache();

    if (cached) {
      setRankingsResponse(cached);
      await fetchLatestInBackground();
      setLoading(false);
      return;
    }

    await fetchLatest();
    setLoading(false);
  }, [fetchLatest, fetchLatestInBackground, loadCache]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  /* --------------------------------------------------
     MANUAL REFRESH
  -------------------------------------------------- */

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      await AsyncStorage.removeItem(CACHE_KEY);

      await fetchLatest();

      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [CACHE_KEY, fetchLatest]);

  /* --------------------------------------------------
     RANKED TEAM SET
  -------------------------------------------------- */

  const rankingsByKey = rankingsResponse.rankings;

  const allRankings = useMemo(
    () => rankingsByKey.all ?? EMPTY_ALL_RANKINGS,
    [rankingsByKey.all],
  );

  const updated = rankingsResponse.updated;

  const rankedTeamIds = useMemo(() => {
    const set = new Set<string>();

    for (const poll of allRankings) {
      for (const r of poll.ranks || []) {
        const current = Number(r.current);

        if (
          Number.isFinite(current) &&
          current > 0 &&
          current <= 25 &&
          r.team?.id
        ) {
          set.add(String(r.team.id));
        }
      }
    }

    return set;
  }, [allRankings]);

  return {
    rankingsByKey,
    allRankings,
    updated,
    loading,
    error,
    refresh,
    rankedTeamIds,
  };
};
