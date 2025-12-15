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

export function useCBBTeamStats(espnID: string, category?: string) {
  const [data, setData] = useState<CBBStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!espnID) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      const cacheKey = `cbb_teamstats_${espnID}_${category || "all"}`;

      try {
        // 🔹 1. Check cache
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp, data: cachedData } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            // console.log("📦 Loaded cached CBB stats:", cacheKey);
            setData(cachedData);
            setLoading(false);
            return;
          } else {
            await AsyncStorage.removeItem(cacheKey);
          }
        }

        // 🔹 2. Fetch from your Express backend
        const url = `${BASE_URL}/api/cbb/teams/${espnID}/stats`;
        // console.log("🌐 Fetching CBB stats:", url);

        const response = await axios.get<CBBStatsResponse>(url);

        // Optional filter by category abbreviation
        let responseData = response.data;

        if (category && responseData.stats[category]) {
          responseData = {
            ...responseData,
            stats: {
              [category]: responseData.stats[category],
            },
          };
        }

        // 🔹 3. Cache the result
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), data: responseData })
        );

     
        setData(responseData);
      } catch (err: any) {
        console.error("❌ Error fetching CBB stats:", err.message || err);
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [espnID, category]);

  return { data, loading, error };
}
