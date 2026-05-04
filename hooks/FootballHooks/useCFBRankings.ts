import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

/* ----------------------------- Types ----------------------------- */

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

export type CFBRankPoll = {
  type: "ap" | "coaches" | "cfp";
  shortName: string;
  ranks: CFBTeamRank[];
  droppedOut: CFBTeamRank[];
};

/* ----------------------------- Config ----------------------------- */

const CACHE_KEY = "cfb_rankings_cache_v1";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

/* ----------------------------- Hook ----------------------------- */

export const useCFBRankings = () => {
  const [rankings, setRankings] = useState<CFBRankPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Cache Helpers ---------------- */

  const saveCache = async (data: CFBRankPoll[]) => {
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data }),
      );
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
        return data;
      }

      console.log("⚠️ Cache expired — will refetch");
      return null;
    } catch (err) {
      console.warn("⚠️ Failed to read CFB cache:", err);
      return null;
    }
  };

  /* ---------------- Normalize ---------------- */

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
        raw.shortName ||
        nested.shortName ||
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

  /* ---------------- Fetch Latest ---------------- */

  const fetchLatest = async () => {
    try {
      const res = await apiClient.get("api/standings/cfb/rankings");

      const raw = res.data.rankings || {};

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
    } catch (err: any) {
      console.error("❌ Fetch latest rankings failed:", err);
      setError(err.message || "Failed to fetch rankings");
    }
  };

  /* ---------------- Background Refresh ---------------- */

  const fetchLatestInBackground = async () => {
    try {
      const res = await apiClient.get("/api/cfb-rankings");

      const raw = res.data.rankings || {};

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
    } catch (err) {
      console.warn("⚠️ Background refresh failed:", err);
    }
  };

  /* ---------------- Main Fetch ---------------- */

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cached = await loadCache();

      if (cached) {
        setRankings(cached);
        setLoading(false);

        // 🔥 refresh silently
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

  return {
    rankings,
    loading,
    error,
    refresh: fetchLatest,
  };
};