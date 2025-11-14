import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export type CBBTeamRank = {
  current: number;
  previous: number;
  points: number;
  firstPlaceVotes: number;
  trend: string;
  recordSummary: string;
  team: {
    id: string; // we will use this
    nickname?: string;
    name?: string;
    abbreviation: string;
    shortDisplayName?: string;
    location?: string;
    logos?: { href: string }[];
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
  } | null;
  date: string;
  lastUpdated: string;
};

export type CBBRankPoll = {
  type: "ap" | "coaches";
  shortName: string;
  ranks: CBBTeamRank[];
  droppedOut: CBBTeamRank[];
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
const CACHE_KEY = "cbb_rankings_cache_v3";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const LAST_REFRESH_KEY = "cbb_rankings_last_refresh";

export const useCBBRankings = () => {
  const [rankings, setRankings] = useState<CBBRankPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Cache helpers ---
  const saveCache = async (data: CBBRankPoll[]) => {
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data })
      );
    } catch (err) {
      console.warn("⚠️ Failed to cache CBB rankings:", err);
    }
  };

  const loadCache = async (): Promise<CBBRankPoll[] | null> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
      // console.log("⚠️ Cache expired — will refetch");
      return null;
    } catch (err) {
      console.warn("⚠️ Failed to read CBB cache:", err);
      return null;
    }
  };

  // --- Fetch from backend ---
  const fetchLatest = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/cbb-rankings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const polls: CBBRankPoll[] = data.rankings || [];

      setRankings(polls);
      await saveCache(polls);
    } catch (err: any) {
      console.error("❌ Fetch CBB rankings failed:", err);
      setError(err.message || "Failed to fetch rankings");
    }
  };

  // --- Background refresh ---
  const fetchLatestInBackground = async () => {
    try {
      const last = await AsyncStorage.getItem(LAST_REFRESH_KEY);
      if (last && Date.now() - parseInt(last) < 5 * 60 * 1000) return;

      await fetchLatest();
      await AsyncStorage.setItem(LAST_REFRESH_KEY, Date.now().toString());
      // console.log("🔄 Background refreshed CBB rankings");
    } catch (err) {
      console.warn("⚠️ Background refresh failed:", err);
    }
  };

  // --- Public hook fetch ---
  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cached = await loadCache();
      if (cached) {
        setRankings(cached);
        await fetchLatestInBackground();
        setLoading(false);
        return;
      }

      await fetchLatest();
    } catch (err: any) {
      console.error("❌ useCBBRankings error:", err);
      setError(err.message || "Failed to fetch rankings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // --- Helper: get ranking by team ID ---
  const getTeamRankingById = (teamId: string): CBBTeamRank | null => {
    for (const poll of rankings) {
      const found = poll.ranks.find((r) => r.team?.id === teamId);
      if (found) return found;
    }
    return null;
  };

  return { rankings, loading, error, refresh: fetchLatest, getTeamRankingById };
};
