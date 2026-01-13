import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export interface TeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  recordSummary: string;
  standingSummary: string;
}

export interface Stat {
  name: string;
  displayName: string;
  abbreviation: string;
  value?: number;
  displayValue?: string;
}

export interface StatCategoryData {
  name: string;
  stats: Stat[];
}

export interface CBBStatsResponse {
  team: TeamInfo;
  season: any;
  stats: Record<string, StatCategoryData>;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch team stats for CBB or WCBB
 */
export function useCBBTeamStats(
  espnID: string,
  category?: string,
  league: "CBB" | "WCBB" = "CBB"
) {
  const [data, setData] = useState<CBBStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!espnID) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      const leagueKey = league.toLowerCase();
      const cacheKey = `${leagueKey}_teamstats_${espnID}_${category || "all"}`;

      try {
        // 1️⃣ Check cache
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp, data: cachedData } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setData(cachedData);
            setLoading(false);
            return;
          }
          await AsyncStorage.removeItem(cacheKey);
        }

        // 2️⃣ Fetch from backend (league-aware)
        const url = `${BASE_URL}/api/cbb/teams/${espnID}/stats?league=${leagueKey}`;
        // console.log("🌐 Fetching team stats:", url);

        const response = await axios.get<CBBStatsResponse>(url);

        let responseData = response.data;

        // Optional category filter
        if (category && responseData.stats?.[category]) {
          responseData = {
            ...responseData,
            stats: {
              [category]: responseData.stats[category],
            },
          };
        }

        // 3️⃣ Cache result
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            data: responseData,
          })
        );

        setData(responseData);
      } catch (err: any) {
        console.error("❌ Error fetching CBB/WCBB team stats:", err);
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [espnID, category, league]);

  return { data, loading, error };
}
