import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "utils/apiClient";

export type StatCategory =
  | "pass"
  | "rush"
  | "rec"
  | "def"
  | "misc"
  | "defint"
  | "gen";

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

export interface CFBStatsResponse {
  team: TeamInfo;
  season: any;
  stats: Record<string, StatCategoryData>;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function useFootballRosterStats(
  espnID: string,
  league: "CFB" | "NFL",
  category?: StatCategory
) {
  const [data, setData] = useState<CFBStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!espnID) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      const cacheKey = `${league}_TEAM_${espnID}_${category || "all"}`;

      try {
        // 🔹 1. Check cache
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp, data: cachedData } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            console.log("📦 Loaded cached stats:", cacheKey);
            setData(cachedData);
            setLoading(false);
            return;
          } else {
            await AsyncStorage.removeItem(cacheKey);
          }
        }

        // 🔹 2. Fetch from YOUR backend only
        const endpoint =
          league === "NFL"
            ? `${BASE_URL}/api/players/nfl/teams/${espnID}/stats`
            : `${BASE_URL}/api/players/cfb/teams/${espnID}/stats`;

        const url = `${endpoint}${category ? `?category=${category}` : ""}`;

        console.log("🌐 Fetching team stats:", url);

        const response = await axios.get<CFBStatsResponse>(url);

        const responseData = response.data;

        // 🔹 3. Cache result
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            data: responseData,
          })
        );

        console.log("✅ Cached stats:", cacheKey);

        setData(responseData);
      } catch (err: any) {
        console.error("❌ Error fetching stats:", err.message || err);
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [espnID, category, league]);

  return { data, loading, error };
}