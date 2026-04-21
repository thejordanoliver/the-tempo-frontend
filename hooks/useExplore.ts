import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  PlayerResult,
  ResultItem,
  TeamResult,
  UserResult,
} from "types/explore";
import { apiClient } from "utils/apiClient";
const RECENT_SEARCHES_KEY = "recentSearches";

export function useExplore() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const isSearching =
    loading || (query.trim().length > 0 && debouncedQuery !== query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400); // wait 400ms after last keystroke

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // trigger search only when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery);
    } else {
      setResults([]); // clear results if input is empty
    }
  }, [debouncedQuery]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validResults = parsed.filter(
          (item: any) =>
            item &&
            typeof item === "object" &&
            "type" in item &&
            ("id" in item || "player_id" in item),
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

      parsed = parsed.filter(
        (r) => getResultKey(r) !== key || r.type !== item.type,
      );
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
      parsed = parsed.filter(
        (r) => getResultKey(r) !== deleteKey || r.type !== itemToDelete.type,
      );

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
      const res = await apiClient.get<{
        players: PlayerResult[];
        teams: TeamResult[];
        users: UserResult[];
      }>(`api/explore/search`, { params: { query: searchQuery } });

      const q = searchQuery.toLowerCase();

      // Add scoring for users
      const scoredUsers: ResultItem[] = res.data.users.map((u) => {
        let score = u.score ?? 0;
        const uname = u.username.toLowerCase();
        if (uname === q)
          score += 1000; // exact match boost
        else if (uname.startsWith(q)) score += 500; // prefix boost
        return { ...u, type: "user" as const, score };
      });

      // Sort users by score descending
      const sortedUsers = scoredUsers.sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0),
      );

      // Sort players by score descending
      const sortedPlayers = res.data.players
        .map((p) => ({ ...p, type: "player" as const }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

      // Sort teams by score descending
      const sortedTeams = res.data.teams
        .map((t) => ({ ...t, type: "team" as const }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

      // Combine results: users first, then players, then teams
      const combined: ResultItem[] = [
        ...sortedTeams,
        ...sortedUsers,
        ...sortedPlayers,
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
    isSearching,
  };
}
