import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const CACHE_KEY = "all_league_news_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface NewsArticle {
  id: number;
  headline: string;
  description: string;
  published: string;
  lastModified: string;
  byline: string;
  images: any[];
  webUrl: string | null;
  apiUrl: string | null;
  story: string[];
}

export interface LeagueNewsResponse {
  league: string;
  count: number;
  articles: NewsArticle[];
}

export interface AllNewsResponse {
  status: string;
  leagues: {
    [league: string]: {
      count: number;
      articles: NewsArticle[];
      error?: string;
    };
  };
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// ---------------------------------------------------
// Dynamic League News Hook
// ---------------------------------------------------
export function useLeagueNews(league: string | null) {
  const [data, setData] = useState<LeagueNewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!league) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get<LeagueNewsResponse>(
        `${BASE_URL}/api/news/${league}`
      );
      setData(res.data);
    } catch (err: any) {
      console.error("useLeagueNews error:", err.message);
      setError("Failed to fetch league news");
    } finally {
      setLoading(false);
    }
  }, [league]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

export function useAllLeagueNews(enabled: boolean = true) {
  const [data, setData] = useState<AllNewsResponse["leagues"] | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  // Fetch Function
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // Try loading cached data
      const cachedString = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedString) {
        const cached = JSON.parse(cachedString);
        const isFresh = Date.now() - cached.timestamp < CACHE_TTL;

        if (isFresh) {
          setData(cached.data);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const res = await axios.get<AllNewsResponse>(
        `${BASE_URL}/api/espn/news/all`
      );

      const leagues = res.data.leagues;
      setData(leagues);

      // Save cache
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: leagues })
      );

    } catch (err: any) {
      console.error("useAllLeagueNews error:", err.message);
      setError("Failed to fetch all news");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Run on mount or when enabled changes
  useEffect(() => {
    if (enabled) fetchData();
  }, [enabled, fetchData]);

  return { data, loading, error, refresh: fetchData };
}