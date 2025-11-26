import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

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
  playerName?: string;
  position?: string;
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

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function useFootballRosterStats(
  espnID: string,
  teamId: string,
  category?: StatCategory,
  viewMode: "team" | "players" = "team",
  league: "cfb" | "nfl" = "cfb" // 👈 added optional league param
) {
  const [data, setData] = useState<CFBStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ((viewMode === "team" && !espnID) || (viewMode === "players" && !teamId))
      return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      const cacheKey = `${league}_${viewMode}_${espnID || teamId}_${
        category || "all"
      }`;

      try {
        // 🔹 1. Check cache first
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp, data: cachedData } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            console.log("📦 Loaded cached stats:", cacheKey);
            setData(cachedData);
            setLoading(false);
            return;
          } else {
            console.log("🕒 Cache expired for:", cacheKey);
            await AsyncStorage.removeItem(cacheKey);
          }
        }

        let response;

        // --- ESPN team stats ---
        if (viewMode === "team") {
          // 👇 call either /api/cfb/teams or /api/cfb/nfl/teams
          const endpoint =
            league === "nfl"
              ? `${BASE_URL}/api/nfl/teams/${espnID}/stats`
              : `${BASE_URL}/api/teams/${espnID}/stats`;

          const url = `${endpoint}${category ? `?category=${category}` : ""}`;
          console.log("🌐 Fetching team stats:", url);
          response = await axios.get<CFBStatsResponse>(url);
        }

        // --- RapidAPI player stats ---
       else {
  const url = `${BASE_URL}/api/${teamId}/players/stats${
    category ? `?category=${category}` : ""
  }`;
          console.log("🌐 Fetching player stats:", url);
          response = await axios.get(url);

          const players = response.data?.players || response.data?.response || [];
          if (!Array.isArray(players) || players.length === 0) {
            console.warn("⚠️ No players found in response.");
            setData({
              team: {
                id: teamId,
                name: "Unknown Team",
                abbreviation: "UNK",
                logo: "",
                recordSummary: "",
                standingSummary: "",
              },
              season: response.data?.season || "2025",
              stats: {},
            });
            return;
          }

          const statsByCategory: Record<string, StatCategoryData> = {};

          players.forEach((player: any) => {
            const playerName = player.name || player.player?.name || "-";
            const team = player.teams?.[0] || player.team || {};
            const groups = player.teams?.[0]?.groups || team.groups || [];

            groups.forEach((group: any) => {
              if (!statsByCategory[group.name])
                statsByCategory[group.name] = { name: group.name, stats: [] };

              (group.statistics || []).forEach((stat: any) => {
                statsByCategory[group.name].stats.push({
                  name: stat.name.toLowerCase().replace(/\s/g, "_"),
                  displayName: stat.name,
                  abbreviation: stat.name.substring(0, 3).toUpperCase(),
                  value:
                    stat.value !== null && stat.value !== undefined
                      ? Number(stat.value)
                      : undefined,
                  displayValue:
                    stat.value !== null && stat.value !== undefined
                      ? String(stat.value)
                      : undefined,
                  playerName,
                });
              });
            });
          });

          response.data = {
            team: {
              id: teamId,
              name:
                players[0]?.teams?.[0]?.team?.name ||
                players[0]?.team?.name ||
                "Unknown",
              abbreviation:
                players[0]?.teams?.[0]?.team?.name?.slice(0, 3).toUpperCase() ||
                "UNK",
              logo:
                players[0]?.teams?.[0]?.team?.logo ||
                players[0]?.team?.logo ||
                "",
              recordSummary: "",
              standingSummary: "",
            },
            season: response.data?.season || "2025",
            stats: statsByCategory,
          };
        }

        const responseData = response.data as CFBStatsResponse;

        // 🔹 2. Save to cache
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
  }, [espnID, teamId, category, viewMode, league]);

  return { data, loading, error };
}
