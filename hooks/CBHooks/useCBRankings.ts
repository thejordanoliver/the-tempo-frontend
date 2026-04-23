import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CollegeBaseballTeam } from "types/baseball";
import { apiClient } from "utils/apiClient";

/* =====================================================
   TYPES
===================================================== */

export type CBBTeamWithGroups = CollegeBaseballTeam & {
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
  current: number;
  previous: number;
  points: number;
  firstPlaceVotes: number;
  trend: string;
  recordSummary: string;
  team: CBBTeamWithGroups | null;
  date: string;
  lastUpdated: string;
};

export type CBRankPoll = {
  id?: string;
  type: string;
  shortName: string;
  ranks: CBTeamRank[];
  droppedOut: CBTeamRank[];
};

/* =====================================================
   CONFIG
===================================================== */

const CACHE_TTL = 6 * 60 * 60 * 1000;

/* =====================================================
   HOOK
===================================================== */

export const useCBRankings = (league: "cb" | "sb") => {
  const CACHE_KEY = `rankings_cache_${league}`;
  const LAST_REFRESH_KEY = `rankings_last_refresh_${league}`;

  const [rankings, setRankings] = useState<CBRankPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------------------------
     CACHE HELPERS
  -------------------------------------------------- */

  const saveCache = async (data: CBRankPoll[]) => {
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
  };

  const loadCache = async (): Promise<CBRankPoll[] | null> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);

      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }

      return null;
    } catch {
      return null;
    }
  };

  /* --------------------------------------------------
     FETCH
  -------------------------------------------------- */

  const fetchLatest = useCallback(async () => {
    try {
      const res = await apiClient.get(
        `/api/standings/${league}/rankings`,
      );

      const polls: CBRankPoll[] = res.data?.rankings?.all || [];

      setRankings(polls);

      await saveCache(polls);
      await AsyncStorage.setItem(
        LAST_REFRESH_KEY,
        Date.now().toString(),
      );
    } catch (err: any) {
      console.error("❌ Fetch CBB rankings failed:", err);

      const message =
        err.response?.data?.error ||
        err.response?.statusText ||
        err.message ||
        "Failed to fetch rankings";

      setError(message);
    }
  }, [league]);

  /* --------------------------------------------------
     BACKGROUND REFRESH
  -------------------------------------------------- */

  const fetchLatestInBackground = useCallback(async () => {
    try {
      const last = await AsyncStorage.getItem(LAST_REFRESH_KEY);

      if (last && Date.now() - parseInt(last) < 5 * 60 * 1000) return;

      await fetchLatest();
    } catch {}
  }, [fetchLatest]);

  /* --------------------------------------------------
     INITIAL LOAD
  -------------------------------------------------- */

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const cached = await loadCache();

    if (cached) {
      setRankings(cached);
      await fetchLatestInBackground();
      setLoading(false);
      return;
    }

    await fetchLatest();
    setLoading(false);
  }, [fetchLatest, fetchLatestInBackground]);

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

  const rankedTeamIds = useMemo(() => {
    const set = new Set<string>();

    for (const poll of rankings) {
      for (const r of poll.ranks || []) {
        if (
          typeof r.current === "number" &&
          r.current > 0 &&
          r.current <= 25 &&
          r.team?.id
        ) {
          set.add(String(r.team.id));
        }
      }
    }

    return set;
  }, [rankings]);

  return {
    rankings,
    loading,
    error,
    refresh,
    rankedTeamIds,
  };
};