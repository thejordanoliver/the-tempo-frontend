import { PlayerLeader, SeasonLeaderCategory } from "@/types/stats";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient } from "utils/apiClient";

/* ----------------------------- Types ----------------------------- */

export type Leader = PlayerLeader;

export type LeaderCategory = SeasonLeaderCategory;

export type LeaderDataSource = "database" | null;

interface SeasonLeadersApiResponse {
  league: string;
  requestedLeague: string;
  requestedSeason: number;
  season: number;
  displaySeason: string;
  fallbackUsed: boolean;
  source: Exclude<LeaderDataSource, null>;
  seasonType: number;
  seasonTypeLabel: string;
  limit: number;
  hasMore?: boolean;
  nextCursor?: string | null;
  categories: LeaderCategory[];
}

interface SeasonLeaderResult {
  categories: LeaderCategory[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  source: LeaderDataSource;
  returnedSeason: number | null;
  displaySeason: string | null;
  refresh: () => void;
  loadMore: () => void;
}

interface CachedLeadersResponse {
  expiresAt: number;
  data: SeasonLeadersApiResponse;
}

const RESPONSE_CACHE_TTL_MS = 60_000;
const MAX_CACHE_ENTRIES = 100;
const responseCache = new Map<string, CachedLeadersResponse>();

/* ----------------------------- Hook ------------------------------ */

export function useSeasonLeaders(
  season: number,
  league: string,
  {
    enabled = true,
    limit,
    category,
    paginated = false,
  }: {
    enabled?: boolean;
    limit?: number;
    category?: string;
    paginated?: boolean;
  } = {},
): SeasonLeaderResult {
  const [categories, setCategories] = useState<LeaderCategory[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<LeaderDataSource>(null);
  const [returnedSeason, setReturnedSeason] = useState<number | null>(null);
  const [displaySeason, setDisplaySeason] = useState<string | null>(null);

  /** Prevent an older request from overwriting newer screen state. */
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingMoreRef = useRef(false);

  const normalizedLeague = league.trim().toLowerCase();

  const fetchLeaders = useCallback(async ({
    cursor = null,
    append = false,
    bypassCache = false,
  }: {
    cursor?: string | null;
    append?: boolean;
    bypassCache?: boolean;
  } = {}) => {
    if (!enabled) {
      return;
    }

    const requestId = ++requestIdRef.current;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (append) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      loadingMoreRef.current = false;
      setLoadingMore(false);
      setLoading(true);
    }
    setError(null);

    try {
      const cacheKey = JSON.stringify({
        normalizedLeague,
        season,
        limit,
        category,
        cursor,
      });
      const cached = !bypassCache ? responseCache.get(cacheKey) : undefined;
      let data: SeasonLeadersApiResponse;

      if (cached && cached.expiresAt > Date.now()) {
        data = cached.data;
      } else {
        const response = await apiClient.get<SeasonLeadersApiResponse>(
          `api/leaders/${normalizedLeague}`,
          {
            params: {
              season,
              ...(limit !== undefined ? { limit } : {}),
              ...(category ? { category } : {}),
              ...(cursor ? { cursor } : {}),
            },
            signal: controller.signal,
          },
        );
        data = response.data;
        if (responseCache.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = responseCache.keys().next().value;
          if (oldestKey) responseCache.delete(oldestKey);
        }
        responseCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + RESPONSE_CACHE_TTL_MS,
        });
      }

      /**
       * Ignore stale responses from an older league/season request.
       */
      if (requestId !== requestIdRef.current) {
        return;
      }

      const incomingCategories = Array.isArray(data.categories)
        ? data.categories
        : [];
      setCategories((currentCategories) => {
        if (!append) return incomingCategories;

        if (currentCategories.length === 0) return incomingCategories;

        return currentCategories.map((currentCategory) => {
          const nextCategory = incomingCategories.find(
            (item) => item.categoryName === currentCategory.categoryName,
          );
          return nextCategory
            ? {
                ...nextCategory,
                leaders: [
                  ...currentCategory.leaders,
                  ...nextCategory.leaders,
                ],
              }
            : currentCategory;
        });
      });
      setHasMore(Boolean(data.hasMore));
      setNextCursor(data.nextCursor ?? null);

      setSource(data.source ?? null);

      setReturnedSeason(data.season ?? null);

      setDisplaySeason(
        data.displaySeason ??
          (data.season !== null && data.season !== undefined
            ? String(data.season)
            : null),
      );
    } catch (error: unknown) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (isAxiosError(error) && error.code === "ERR_CANCELED") return;

      console.error(`❌ [${normalizedLeague}] Season Leaders Error:`, error);

      const message = isAxiosError<{ error?: string }>(error)
        ? (error.response?.data?.error ?? error.message)
        : error instanceof Error
          ? error.message
          : "Failed to fetch leaders";

      if (append) return;

      if (!append) setCategories([]);
      setSource(null);
      setReturnedSeason(null);
      setDisplaySeason(null);
      setError(message);
    } finally {
      if (requestId === requestIdRef.current) {
        if (append) {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        } else setLoading(false);
      }
    }
  }, [category, enabled, limit, normalizedLeague, season]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    /**
     * Schedule the request after the current synchronous effect execution.
     *
     * This avoids synchronously calling setState from inside the effect,
     * which satisfies react-hooks/set-state-in-effect.
     */
    queueMicrotask(() => {
      if (!cancelled) {
        void fetchLeaders();
      }
    });

    return () => {
      cancelled = true;
      abortControllerRef.current?.abort();

      /**
       * Ignore any response belonging to the previous
       * league/season request.
       */
      requestIdRef.current += 1;
    };
  }, [enabled, fetchLeaders]);

  const refresh = useCallback(() => {
    if (!enabled) {
      return;
    }

    setNextCursor(null);
    void fetchLeaders({ bypassCache: true });
  }, [enabled, fetchLeaders]);

  const loadMore = useCallback(() => {
    if (
      !enabled ||
      !paginated ||
      loading ||
      loadingMoreRef.current ||
      !hasMore ||
      !nextCursor
    ) {
      return;
    }

    void fetchLeaders({ cursor: nextCursor, append: true });
  }, [
    enabled,
    fetchLeaders,
    hasMore,
    loading,
    nextCursor,
    paginated,
  ]);

  return {
    categories,
    loading: enabled ? loading : false,
    loadingMore: enabled ? loadingMore : false,
    hasMore: enabled ? hasMore : false,
    error: enabled ? error : null,
    source,
    returnedSeason,
    displaySeason,
    refresh,
    loadMore,
  };
}
