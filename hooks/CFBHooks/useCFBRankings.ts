import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Team Rank type ---
export type CFBTeamRank = {
  current: number;
  previous: number;
  points: number;
  firstPlaceVotes: number;
  trend: string;
  recordSummary: string;
  team: {
    id: string;
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

// --- Poll type containing multiple team ranks ---
export type CFBRankPoll = {
  type: "ap" | "coaches" | "cfp";
  shortName: string;
  ranks: CFBTeamRank[];
  droppedOut: CFBTeamRank[];
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
const CACHE_KEY = "cfb_rankings_cache_v1";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export const useCFBRankings = () => {
  const [rankings, setRankings] = useState<CFBRankPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Cache helpers ---
  const saveCache = async (data: CFBRankPoll[]) => {
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data })
      );
      console.log("💾 Cached CFB rankings");
    } catch (err) {
      console.warn("⚠️ Failed to cache CFB rankings:", err);
    }
  };

  const loadCache = async (): Promise<CFBRankPoll[] | null> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        console.log("✅ Using cached CFB rankings");
        return data;
      } else {
        console.log("⚠️ Cache expired — will refetch");
        return null;
      }
    } catch (err) {
      console.warn("⚠️ Failed to read CFB cache:", err);
      return null;
    }
  };

  // --- Unified parser for any backend shape ---
  const normalizePoll = (raw: any, type: CFBRankPoll["type"]): CFBRankPoll => {
    if (!raw) {
      return {
        type,
        shortName:
          type === "ap"
            ? "AP Poll"
            : type === "coaches"
            ? "Coaches Poll"
            : "CFP Rankings",
        ranks: [],
        droppedOut: [],
      };
    }

    const nested = raw.polls?.[0] || {};
    return {
      type,
      shortName:
        raw.shortName || nested.shortName ||
        (type === "ap"
          ? "AP Poll"
          : type === "coaches"
          ? "Coaches Poll"
          : "CFP Rankings"),
      ranks:
        (Array.isArray(raw.ranks)
          ? raw.ranks
          : Array.isArray(nested.ranks)
          ? nested.ranks
          : []) || [],
      droppedOut:
        (Array.isArray(raw.droppedOut)
          ? raw.droppedOut
          : Array.isArray(nested.droppedOut)
          ? nested.droppedOut
          : []) || [],
    };
  };

  // --- Fetch and parse latest data ---
  const fetchLatest = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/cfb-rankings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch rankings`);

      const data = await res.json();
      const raw = data.rankings || {};

      const apData = raw.ap || raw.associatedPress || raw.apTop25;
      const coachesData = raw.coaches || raw.coachesPoll;
      const cfpData = raw.cfp || raw.playoff || raw.cfpRankings;

      const polls = [
        normalizePoll(apData, "ap"),
        normalizePoll(coachesData, "coaches"),
        normalizePoll(cfpData, "cfp"),
      ];

      setRankings(polls);
      await saveCache(polls);

      console.log("✅ Updated CFB rankings from server");
      console.log("📊 AP Poll team count:", polls[0]?.ranks?.length);
    } catch (err: any) {
      console.error("❌ Fetch latest rankings failed:", err);
      setError(err.message || "Failed to fetch rankings");
    }
  };

  // --- Silent background refresh ---
  const fetchLatestInBackground = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/cfb-rankings`);
      if (!res.ok) return;

      const data = await res.json();
      const raw = data.rankings || {};
      const apData = raw.ap || raw.associatedPress || raw.apTop25;
      const coachesData = raw.coaches || raw.coachesPoll;
      const cfpData = raw.cfp || raw.playoff || raw.cfpRankings;

      const polls = [
        normalizePoll(apData, "ap"),
        normalizePoll(coachesData, "coaches"),
        normalizePoll(cfpData, "cfp"),
      ];

      setRankings(polls);
      await saveCache(polls);
      console.log("🔄 Background refreshed CFB rankings");
    } catch (err) {
      console.warn("⚠️ Background refresh failed:", err);
    }
  };

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cached = await loadCache();
      if (cached) {
        setRankings(cached);
        setLoading(false);
        fetchLatestInBackground();
        return;
      }
      await fetchLatest();
    } catch (err: any) {
      console.error("❌ useCFBRankings error:", err);
      setError(err.message || "Failed to fetch rankings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return { rankings, loading, error, refresh: fetchLatest };
};
