import AsyncStorage from "@react-native-async-storage/async-storage";
import { teams } from "constants/teamsCBB";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CBBTeam } from "types/types";

/* =====================================================
   TYPES
===================================================== */

export type CBBTeamWithGroups = CBBTeam & {
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

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const LAST_REFRESH_KEY = "cbb_rankings_last_refresh";

/* =====================================================
   ESPN TEAM ID RESOLUTION
===================================================== */

const resolveESPNTeamId = (id: string | number, league: "116" | "423") => {
  const team = teams.find(
    (t) =>
      String(t.id) === String(id) ||
      String(t.wid) === String(id) ||
      String(t.espnID) === String(id)
  );

  // ESPN uses SAME team ID for men & women
  if (team?.espnID) return String(team.espnID);
  return String(id);
};

/* =====================================================
   HOOK
===================================================== */

export const useCBBRankings = (league: "116" | "423" = "116") => {
  const CACHE_KEY = `cbb_rankings_cache_${league}`;

  const [rankings, setRankings] = useState<CBBRankPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------------------------
     CACHE HELPERS
  -------------------------------------------------- */

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
      return null;
    } catch {
      return null;
    }
  };

  /* --------------------------------------------------
     FETCH LOGIC
  -------------------------------------------------- */

  const fetchLatest = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/cbb-rankings?league=${league}`);
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

  const fetchLatestInBackground = async () => {
    try {
      const last = await AsyncStorage.getItem(LAST_REFRESH_KEY);
      if (last && Date.now() - parseInt(last) < 5 * 60 * 1000) return;

      await fetchLatest();
      await AsyncStorage.setItem(LAST_REFRESH_KEY, Date.now().toString());
    } catch {}
  };

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
  }, [league]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  /* --------------------------------------------------
     ✅ RANKED TEAM ID SET (SOURCE OF TRUTH)
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

  /* --------------------------------------------------
     DEBUG LOGGING
  -------------------------------------------------- */

  // useEffect(() => {
  //   if (!rankings.length) return;

  //   const output = [];

  //   for (const poll of rankings) {
  //     for (const r of poll.ranks) {
  //       if (rankedTeamIds.has(String(r.team?.id))) {
  //         output.push({
  //           league,
  //           poll: poll.type,
  //           rank: r.current,
  //           teamId: r.team?.id,
  //           teamName:
  //             r.team?.name ??
  //             r.team?.shortDisplayName ??
  //             r.team?.nickname ??
  //             "Unknown",
  //         });
  //       }
  //     }
  //   }

  //   console.log(
  //     `🏀 [CBB Rankings Debug] League ${league} — Ranked Teams`,
  //     output
  //   );
  // }, [rankings, rankedTeamIds, league]);

  /* --------------------------------------------------
     RANK LOOKUP (SAFE)
  -------------------------------------------------- */

  const getTeamRankingById = (teamId: string | number) => {
    const espnId = resolveESPNTeamId(teamId, league);

    // 🔒 HARD GUARD — prevents ETSU / false ranks
    if (!rankedTeamIds.has(String(espnId))) {
      return null;
    }

    for (const poll of rankings) {
      const found = poll.ranks.find(
        (r) => String(r.team?.id) === String(espnId)
      );
      if (found) return found;
    }

    return null;
  };

  /* --------------------------------------------------
     PUBLIC API
  -------------------------------------------------- */

  return {
    rankings,
    loading,
    error,
    refresh: fetchLatest,
    getTeamRankingById,
    rankedTeamIds, // 👈 REQUIRED BY GAMECARD
  };
};
