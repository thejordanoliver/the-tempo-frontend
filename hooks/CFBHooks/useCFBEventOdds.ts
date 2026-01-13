import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { EventOdds, UseEventOddsParams } from "types/odds";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const getCacheKey = (params: {
  homeId: number | string;
  awayId: number | string;
  date: string;
  markets?: string;
  bookmakers?: string;
}) =>
  `cfb_event_odds:${params.homeId}:${params.awayId}:${params.date}:${
    params.markets ?? "default"
  }:${params.bookmakers ?? "all"}`;

export function useCFBEventOdds({
  homeId,
  awayId,
  date,
  markets,
  bookmakers = "draftkings",
  regions = "us",
  oddsFormat = "american",
  enabled = true,
}: UseEventOddsParams) {
  const [data, setData] = useState<EventOdds[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !homeId || !awayId || !date) return;

    const fetchOdds = async () => {
      try {
        setLoading(true);
        setError(null);

        const normalizedDate = date.includes("T")
          ? date.slice(0, 10).replace(/-/g, "")
          : date;

        const cacheKey = getCacheKey({
          homeId,
          awayId,
          date: normalizedDate,
          markets,
          bookmakers,
        });

        // 1️⃣ Try cache first
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const isFresh = Date.now() - parsed.timestamp < CACHE_TTL_MS;

          if (isFresh) {
            setData(parsed.data);
            setLoading(false);
            return;
          }
        }

        // 2️⃣ Fetch from API
        const res = await axios.get(`${BASE_URL}/api/cfb/odds/events/odds`, {
          params: {
            homeId,
            awayId,
            date: normalizedDate,
            regions,
            oddsFormat,
            bookmakers,
            markets,
          },
        });

        const odds = res.data?.odds ?? [];
        setData(odds);

        // 3️⃣ Save to cache
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            data: odds,
          })
        );
      } catch (err: any) {
        console.error("❌ Failed to fetch CFB event odds", err);
        setError(err.response?.data?.error || "Failed to load odds");
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, [homeId, awayId, date, markets, bookmakers, regions, oddsFormat, enabled]);

  return {
    odds: data,
    loading,
    error,
    hasOdds: data.length > 0,
  };
}
