import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PlayerResult,
  ResultItem,
  TeamResult,
  UserResult,
} from "types/explore";
import {
  buildExploreSearchSelectionEvent,
  buildExploreSearchSettledEvent,
  createExploreSearchAnalyticsId,
  sendExploreSearchEvent,
  type ExploreSearchSettledEvent,
} from "services/exploreSearchAnalytics";
import { apiClient } from "utils/apiClient";
import {
  EXPLORE_SEARCH_MAX_QUERY_LENGTH,
  EXPLORE_SEARCH_MIN_QUERY_LENGTH,
  canSearchExploreQuery,
  getExploreResultIdentity,
  normalizeExploreSearchQuery,
} from "utils/exploreSearch";

const RECENT_SEARCHES_KEY_PREFIX = "recentSearches";
const RECENT_SEARCHES_LEGACY_KEY = RECENT_SEARCHES_KEY_PREFIX;
const RECENT_SEARCHES_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;
const COLLAPSED_SEARCH_LIMIT = 5;
const EXPANDED_SEARCH_LIMIT = 25;
const SEARCH_SETTLED_DELAY_MS = 750;

export type ExploreSearchScope = "all" | "players" | "teams" | "users";

type ExploreSearchResponse = {
  results: ResultItem[];
  players: PlayerResult[];
  teams: TeamResult[];
  users: UserResult[];
};

const getRecentSearchesKey = (userId: string | number) =>
  `${RECENT_SEARCHES_KEY_PREFIX}:${userId}`;

async function getCurrentRecentSearchesKey() {
  const userId = await AsyncStorage.getItem("userId");
  return userId ? getRecentSearchesKey(userId) : null;
}

function isValidResultItem(item: unknown): item is ResultItem {
  if (!item || typeof item !== "object") return false;

  const value = item as Partial<ResultItem>;

  if (!("type" in value)) return false;

  if (value.type === "player") {
    return (
      "id" in value &&
      value.id !== undefined &&
      typeof value.affiliation === "string"
    );
  }

  if (value.type === "team") {
    return (
      "id" in value &&
      value.id !== undefined &&
      typeof value.affiliation === "string"
    );
  }

  if (value.type === "user") {
    return "id" in value && value.id !== undefined;
  }

  return false;
}

function safeParseRecentSearches(value: string | null): ResultItem[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidResultItem).slice(0, RECENT_SEARCHES_LIMIT);
  } catch {
    return [];
  }
}

function isCanceledRequest(error: unknown) {
  const err = error as {
    name?: string;
    code?: string;
    message?: string;
  };

  return (
    err?.name === "CanceledError" ||
    err?.code === "ERR_CANCELED" ||
    err?.message === "canceled"
  );
}

function removeDuplicateRecentSearch(
  searches: ResultItem[],
  itemToRemove: ResultItem,
) {
  const itemKey = getExploreResultIdentity(itemToRemove);

  return searches.filter(
    (item) => getExploreResultIdentity(item) !== itemKey,
  );
}

async function persistRecentSearches(
  storageKey: string,
  searches: ResultItem[],
) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(searches));
}

export function useExplore() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<ResultItem[]>([]);
  const [recentSearchesKey, setRecentSearchesKey] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchScope, setSearchScope] = useState<ExploreSearchScope>("all");
  const [expandedSearch, setExpandedSearch] = useState(false);

  const requestIdRef = useRef(0);
  const recentSearchLoadRequestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchSessionIdRef = useRef<string | null>(null);
  const settledAnalyticsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pendingSettledEventRef = useRef<ExploreSearchSettledEvent | null>(null);

  const normalizedQuery = normalizeExploreSearchQuery(query);
  const normalizedDebouncedQuery = normalizeExploreSearchQuery(debouncedQuery);
  const searchLimit = expandedSearch
    ? EXPANDED_SEARCH_LIMIT
    : COLLAPSED_SEARCH_LIMIT;

  const isSearching = useMemo(() => {
    return (
      loading ||
      (canSearchExploreQuery(normalizedQuery) &&
        normalizedQuery !== normalizedDebouncedQuery)
    );
  }, [loading, normalizedQuery, normalizedDebouncedQuery]);

  const clearPendingSettledEvent = useCallback(() => {
    if (settledAnalyticsTimerRef.current) {
      clearTimeout(settledAnalyticsTimerRef.current);
      settledAnalyticsTimerRef.current = null;
    }
    pendingSettledEventRef.current = null;
  }, []);

  const startSearchSession = useCallback(() => {
    if (!searchSessionIdRef.current) {
      searchSessionIdRef.current = createExploreSearchAnalyticsId();
    }
    return searchSessionIdRef.current;
  }, []);

  const finishSearchSession = useCallback(() => {
    clearPendingSettledEvent();
    searchSessionIdRef.current = null;
  }, [clearPendingSettledEvent]);

  const flushPendingSettledEvent = useCallback(() => {
    if (settledAnalyticsTimerRef.current) {
      clearTimeout(settledAnalyticsTimerRef.current);
      settledAnalyticsTimerRef.current = null;
    }

    const event = pendingSettledEventRef.current;
    pendingSettledEventRef.current = null;
    if (event) sendExploreSearchEvent(event);
  }, []);

  const setSearchQuery = useCallback((nextQuery: string) => {
    clearPendingSettledEvent();
    setQuery(nextQuery);
    const nextQueryLength = normalizeExploreSearchQuery(nextQuery).length;

    if (canSearchExploreQuery(nextQuery)) {
      startSearchSession();
      return;
    }

    if (nextQueryLength === 0) finishSearchSession();

    requestIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setResults([]);
    setError(
      nextQueryLength > EXPLORE_SEARCH_MAX_QUERY_LENGTH
        ? "Search query is too long"
        : null,
    );
    setLoading(false);
  }, [clearPendingSettledEvent, finishSearchSession, startSearchSession]);

  const loadRecentSearches = useCallback(async () => {
    const requestId = ++recentSearchLoadRequestIdRef.current;

    try {
      const storageKey = await getCurrentRecentSearchesKey();

      if (requestId !== recentSearchLoadRequestIdRef.current) return;

      setRecentSearchesKey(storageKey);
      AsyncStorage.removeItem(RECENT_SEARCHES_LEGACY_KEY).catch(() => {});

      if (!storageKey) {
        setRecentSearches([]);
        return;
      }

      const stored = await AsyncStorage.getItem(storageKey);

      if (requestId !== recentSearchLoadRequestIdRef.current) return;

      setRecentSearches(safeParseRecentSearches(stored));
    } catch (err) {
      if (requestId !== recentSearchLoadRequestIdRef.current) return;
      console.warn("Error loading recent searches", err);
      setRecentSearchesKey(null);
      setRecentSearches([]);
    }
  }, []);

  const search = useCallback(
    async (
      searchQuery: string,
      options: {
        scope?: ExploreSearchScope;
        limit?: number;
      } = {},
    ) => {
      const trimmedQuery = normalizeExploreSearchQuery(searchQuery);
      const requestScope = options.scope ?? searchScope;
      const requestLimit = options.limit ?? searchLimit;

      requestIdRef.current += 1;
      const requestId = requestIdRef.current;

      abortControllerRef.current?.abort();

      if (trimmedQuery.length < EXPLORE_SEARCH_MIN_QUERY_LENGTH) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (trimmedQuery.length > EXPLORE_SEARCH_MAX_QUERY_LENGTH) {
        setResults([]);
        setError("Search query is too long");
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);
      const requestStartedAt = Date.now();

      try {
        const res = await apiClient.get<ExploreSearchResponse>(
          "api/explore/search",
          {
            params: {
              query: trimmedQuery,
              scope: requestScope,
              limit: requestLimit,
            },
            signal: controller.signal,
          },
        );

        if (requestId !== requestIdRef.current) return;

        setResults(res.data.results);
        setError(null);

        const searchSessionId = searchSessionIdRef.current;
        if (searchSessionId) {
          clearPendingSettledEvent();
          pendingSettledEventRef.current = buildExploreSearchSettledEvent({
            searchSessionId,
            query: trimmedQuery,
            scope: requestScope,
            results: res.data.results,
            durationMs: Date.now() - requestStartedAt,
          });
          settledAnalyticsTimerRef.current = setTimeout(() => {
            flushPendingSettledEvent();
          }, SEARCH_SETTLED_DELAY_MS);
        }
      } catch (err: unknown) {
        if (isCanceledRequest(err)) return;
        if (requestId !== requestIdRef.current) return;

        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setResults([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [
      clearPendingSettledEvent,
      flushPendingSettledEvent,
      searchLimit,
      searchScope,
    ],
  );

  const recordResultSelection = useCallback(
    (item: ResultItem) => {
      const searchSessionId = searchSessionIdRef.current;
      const normalizedSelectionQuery = normalizeExploreSearchQuery(query);
      if (!searchSessionId || !canSearchExploreQuery(normalizedSelectionQuery)) {
        return;
      }

      const position = results.findIndex(
        (result) =>
          getExploreResultIdentity(result) === getExploreResultIdentity(item),
      );
      if (position < 0) return;

      flushPendingSettledEvent();
      sendExploreSearchEvent(
        buildExploreSearchSelectionEvent({
          searchSessionId,
          query: normalizedSelectionQuery,
          scope: searchScope,
          item,
          position: position + 1,
        }),
      );
    }, [flushPendingSettledEvent, query, results, searchScope],
  );

  const saveToRecentSearches = useCallback(async (item: ResultItem) => {
    try {
      const storageKey = await getCurrentRecentSearchesKey();

      setRecentSearchesKey(storageKey);

      if (!storageKey) {
        setRecentSearches([]);
        return;
      }

      const stored = await AsyncStorage.getItem(storageKey);
      const existing = safeParseRecentSearches(stored);

      const nextSearches = [
        item,
        ...removeDuplicateRecentSearch(existing, item),
      ].slice(0, RECENT_SEARCHES_LIMIT);

      await persistRecentSearches(storageKey, nextSearches);
      setRecentSearches(nextSearches);
    } catch (err) {
      console.warn("Failed to save recent search", err);
    }
  }, []);

  const deleteRecentSearch = useCallback(
    async (itemToDelete: ResultItem) => {
      try {
        const storageKey =
          recentSearchesKey ?? (await getCurrentRecentSearchesKey());

        if (!storageKey) {
          setRecentSearches([]);
          return;
        }

        const stored = await AsyncStorage.getItem(storageKey);
        const existing = safeParseRecentSearches(stored);
        const nextSearches = removeDuplicateRecentSearch(
          existing,
          itemToDelete,
        );

        await persistRecentSearches(storageKey, nextSearches);
        setRecentSearches(nextSearches);
      } catch (err) {
        console.warn("Failed to delete recent search", err);
      }
    },
    [recentSearchesKey],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    void Promise.resolve().then(() =>
      search(debouncedQuery, {
        scope: searchScope,
        limit: searchLimit,
      }),
    );
  }, [debouncedQuery, search, searchLimit, searchScope]);

  useEffect(() => {
    clearPendingSettledEvent();
  }, [clearPendingSettledEvent, expandedSearch, searchScope]);

  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
    }, [loadRecentSearches]),
  );

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      clearPendingSettledEvent();
      searchSessionIdRef.current = null;
    };
  }, [clearPendingSettledEvent]);

  return {
    query,
    setQuery: setSearchQuery,
    results,
    recentSearches,
    loading,
    error,
    search,
    searchScope,
    setSearchScope,
    expandedSearch,
    setExpandedSearch,
    canExpandResults:
      canSearchExploreQuery(normalizedQuery) &&
      !expandedSearch &&
      results.length >= COLLAPSED_SEARCH_LIMIT,
    saveToRecentSearches,
    deleteRecentSearch,
    isSearching,
    startSearchSession,
    finishSearchSession,
    recordResultSelection,
  };
}
