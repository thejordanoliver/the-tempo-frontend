import type { StandingsTeamInfo } from "types/standings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

import { apiClient } from "utils/apiClient";

export type TeamWithGroups = StandingsTeamInfo & {
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

export type TeamRank = {
  current: number;
  previous: number;
  points: number;
  firstPlaceVotes: number;
  trend: string;
  recordSummary: string;
  team: TeamWithGroups | null;
  date: string;
  lastUpdated: string;
};

export type MCBBTeamRank = TeamRank;

export type RankPoll = {
  type: "ap" | "coaches";
  shortName: string;
  ranks: TeamRank[];
  droppedOut: TeamRank[];
};

const CACHE_TTL = 6 * 60 * 60 * 1000;

export const useMCBBRankings = (league: "mcbb" | "wcbb") => {
  const CACHE_KEY = `mcbb_rankings_cache_${league}_v2`;
  const LAST_REFRESH_KEY = `mcbb_rankings_last_refresh_${league}_v2`;

  const [rankings, setRankings] = useState<RankPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCache = useCallback(
    async (data: RankPoll[]) => {
      try {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data }),
        );
      } catch (err) {
        console.warn("⚠️ Failed to cache MCBB rankings:", err);
      }
    },
    [CACHE_KEY],
  );

  const loadCache = useCallback(async (): Promise<RankPoll[] | null> => {
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

  const fetchLatest = useCallback(async () => {
    try {
      const res = await apiClient.get(`api/standings/mcbb/rankings`, {
        params: { league },
      });

      const polls: RankPoll[] = res.data.rankings || [];

      setRankings(polls);

      await saveCache(polls);
      await AsyncStorage.setItem(LAST_REFRESH_KEY, Date.now().toString());
    } catch (err: any) {
      console.error(`❌ Fetch ${league} rankings failed:`, err);

      const message =
        err.response?.data?.error ||
        err.response?.statusText ||
        err.message ||
        "Failed to fetch rankings";

      setError(message);
    }
  }, [LAST_REFRESH_KEY, league, saveCache]);

  const fetchLatestInBackground = useCallback(async () => {
    try {
      const last = await AsyncStorage.getItem(LAST_REFRESH_KEY);

      if (last && Date.now() - parseInt(last) < 5 * 60 * 1000) return;

      await fetchLatest();
    } catch {}
  }, [LAST_REFRESH_KEY, fetchLatest]);

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
    void Promise.resolve().then(() => fetchRankings());
  }, [fetchRankings]);

  const refresh = async () => {
    try {
      setRefreshing(true);
      setError(null);

      await AsyncStorage.removeItem(CACHE_KEY);

      await fetchLatest();
    } finally {
      setRefreshing(false);
    }
  };

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
    refreshing,
    error,
    refresh,
    rankedTeamIds,
  };
};
