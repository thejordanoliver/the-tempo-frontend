import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BasketballTeam } from "types/basketball";
import { apiClient } from "utils/apiClient";
/* =====================================================
   TYPES
===================================================== */

export type CBBTeamWithGroups = BasketballTeam & {
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

export type CBBTeamRank = {
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

export type CBBRankPoll = {
  type: "ap" | "coaches";
  shortName: string;
  ranks: CBBTeamRank[];
  droppedOut: CBBTeamRank[];
};

/* =====================================================
   CONFIG
===================================================== */

const CACHE_TTL = 6 * 60 * 60 * 1000;

/* =====================================================
   HOOK
===================================================== */

export const useCBBRankings = (league: "CBB" | "WCBB") => {
  const CACHE_KEY = `cbb_rankings_cache_${league}`;
  const LAST_REFRESH_KEY = `cbb_rankings_last_refresh_${league}`;

  const [rankings, setRankings] = useState<CBBRankPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------------------------
     CACHE HELPERS
  -------------------------------------------------- */

  const saveCache = useCallback(async (data: CBBRankPoll[]) => {
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data }),
      );
    } catch (err) {
      console.warn("⚠️ Failed to cache CBB rankings:", err);
    }
  }, [CACHE_KEY]);

  const loadCache = useCallback(async (): Promise<CBBRankPoll[] | null> => {
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
  }, [CACHE_KEY]);

  /* --------------------------------------------------
     FETCH
  -------------------------------------------------- */

  const fetchLatest = useCallback(async () => {
    try {
      const res = await apiClient.get(`api/standings/cbb/rankings`, {
        params: { league },
      });

      const polls: CBBRankPoll[] = res.data.rankings || [];

      setRankings(polls);

      await saveCache(polls);
      await AsyncStorage.setItem(LAST_REFRESH_KEY, Date.now().toString());
    } catch (err: any) {
      console.error("❌ Fetch CBB rankings failed:", err);

      // Axios-specific error handling
      const message =
        err.response?.data?.error ||
        err.response?.statusText ||
        err.message ||
        "Failed to fetch rankings";

      setError(message);
    }
  }, [LAST_REFRESH_KEY, league, saveCache]);

  /* --------------------------------------------------
     BACKGROUND REFRESH
  -------------------------------------------------- */

  const fetchLatestInBackground = useCallback(async () => {
    try {
      const last = await AsyncStorage.getItem(LAST_REFRESH_KEY);

      if (last && Date.now() - parseInt(last) < 5 * 60 * 1000) return;

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
      setRankings(cached);
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

  const refresh = async () => {
    try {
      setLoading(true);

      await AsyncStorage.removeItem(CACHE_KEY);

      await fetchLatest();

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  /* --------------------------------------------------
     RANKED TEAM SET
  -------------------------------------------------- */

  const rankedTeamIds = useMemo(() => {
    const set = new Set<string>();

    for (const poll of rankings) {
      for (const r of poll.ranks) {
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
