import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { PlayerResult, ResultItem, TeamResult, UserResult } from "types/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const RECENT_SEARCHES_KEY = "recentSearches";

export function useExplore() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validResults = parsed.filter(
          (item: any) => item && typeof item === "object" && "type" in item && ("id" in item || "player_id" in item)
        );
        setRecentSearches(validResults);
      }
    } catch (err) {
      console.warn("Error loading recent searches", err);
    }
  };

  const saveToRecentSearches = async (item: ResultItem) => {
    const key = getResultKey(item);
    if (!key) return;

    try {
      const existing = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      let parsed: ResultItem[] = existing ? JSON.parse(existing) : [];

      parsed = parsed.filter((r) => getResultKey(r) !== key || r.type !== item.type);
      parsed.unshift(item);
      parsed = parsed.slice(0, 10);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(parsed));
      setRecentSearches(parsed);
    } catch (err) {
      console.warn("Failed to save recent search", err);
    }
  };

  const deleteRecentSearch = async (itemToDelete: ResultItem) => {
    try {
      const deleteKey = getResultKey(itemToDelete);
      if (!deleteKey) return;

      const existing = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      let parsed: ResultItem[] = existing ? JSON.parse(existing) : [];
      parsed = parsed.filter((r) => getResultKey(r) !== deleteKey || r.type !== itemToDelete.type);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(parsed));
      setRecentSearches(parsed);
    } catch (err) {
      console.warn("Failed to delete recent search", err);
    }
  };

  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ players: PlayerResult[]; teams: TeamResult[]; users: UserResult[] }>(
        `${API_URL}/api/explore/search`,
        { params: { query: searchQuery } }
      );

      const combined: ResultItem[] = [
        ...res.data.teams.map((t) => ({ ...t, type: "team" as const })),
        ...res.data.players.map((p) => ({ ...p, type: "player" as const })),
        ...res.data.users.map((u) => ({ ...u, type: "user" as const })),
      ];

      setResults(combined);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getResultKey = (item: ResultItem) => {
    if (item.type === "player") return String(item.player_id);
    if (item.type === "team") return String(item.id);
    if (item.type === "user") return String(item.id);
    return null;
  };

  return {
    query,
    setQuery,
    results,
    recentSearches,
    loading,
    error,
    search,
    saveToRecentSearches,
    deleteRecentSearch,
  };
}
