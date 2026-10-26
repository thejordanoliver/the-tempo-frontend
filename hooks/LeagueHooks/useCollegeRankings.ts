import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CollegeRankingsLeague,
  CollegeRankPoll,
} from "types/collegeRankings";
import { apiClient } from "utils/apiClient";
import { getCollegeRankingPolls } from "utils/standings/collegeRankings";

const CACHE_TTL = 6 * 60 * 60 * 1000;
const BACKGROUND_REFRESH_INTERVAL = 5 * 60 * 1000;
const EMPTY_RANKINGS: CollegeRankPoll[] = [];

type RankingsState = {
  league: CollegeRankingsLeague;
  rankings: CollegeRankPoll[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};

async function readCache(key: string): Promise<CollegeRankPoll[] | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;
    const { timestamp, data } = JSON.parse(cached);
    return typeof timestamp === "number" &&
      Date.now() - timestamp < CACHE_TTL &&
      Array.isArray(data)
      ? data
      : null;
  } catch {
    return null;
  }
}

function getErrorMessage(error: unknown): string {
  const apiError = error as {
    response?: { data?: { error?: unknown }; statusText?: unknown };
    message?: unknown;
  } | null;
  const message =
    apiError?.response?.data?.error ||
    apiError?.response?.statusText ||
    apiError?.message;
  return typeof message === "string" ? message : "Failed to fetch rankings";
}

export function useCollegeRankings(league: CollegeRankingsLeague) {
  const [state, setState] = useState<RankingsState>({
    league,
    rankings: EMPTY_RANKINGS,
    loading: true,
    refreshing: false,
    error: null,
  });
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(
    async (force = false) => {
      const requestId = ++generation.current;
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      const isCurrent = () =>
        generation.current === requestId && !abort.signal.aborted;
      const cacheKey = `college_basketball_rankings_cache_${league}_v3`;
      const lastRefreshKey = `college_basketball_rankings_last_refresh_${league}_v3`;
      const useCache = league !== "cfb";

      setState((previous) => ({
        league,
        rankings:
          previous.league === league ? previous.rankings : EMPTY_RANKINGS,
        loading: !force,
        refreshing: force,
        error: null,
      }));

      try {
        if (useCache && !force) {
          const cached = await readCache(cacheKey);
          if (!isCurrent()) return;
          if (cached) {
            setState((previous) => ({
              ...previous,
              rankings: cached,
              loading: false,
            }));
            let lastRefresh: string | null = null;
            try {
              lastRefresh = await AsyncStorage.getItem(lastRefreshKey);
            } catch {
              // Storage failures must not prevent a network request.
            }
            if (!isCurrent()) return;
            if (
              lastRefresh &&
              Date.now() - Number(lastRefresh) < BACKGROUND_REFRESH_INTERVAL
            )
              return;
          }
        }
        if (!isCurrent()) return;

        const response = await apiClient.get<unknown>(
          `/api/standings/${league}/rankings`,
          { signal: abort.signal },
        );
        if (!isCurrent()) return;
        const rankings = getCollegeRankingPolls(response.data, league);
        setState({
          league,
          rankings,
          loading: false,
          refreshing: false,
          error: null,
        });

        if (useCache) {
          try {
            await AsyncStorage.setItem(
              cacheKey,
              JSON.stringify({ timestamp: Date.now(), data: rankings }),
            );
            await AsyncStorage.setItem(lastRefreshKey, String(Date.now()));
          } catch (error) {
            console.warn(`Failed to cache ${league} rankings:`, error);
          }
        }
      } catch (error: unknown) {
        if (isCurrent()) {
          setState((previous) => ({
            ...previous,
            error: getErrorMessage(error),
          }));
        }
      } finally {
        if (isCurrent()) {
          setState((previous) => ({
            ...previous,
            loading: false,
            refreshing: false,
          }));
        }
      }
    },
    [league],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
      generation.current += 1;
      controller.current?.abort();
    };
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);
  const rankings = state.league === league ? state.rankings : EMPTY_RANKINGS;
  const rankedTeamIds = useMemo(() => {
    const ids = new Set<string>();
    for (const poll of rankings) {
      for (const rank of poll.ranks) {
        if (rank.current > 0 && rank.current <= 25 && rank.team?.id != null) {
          ids.add(String(rank.team.id));
        }
      }
    }
    return ids;
  }, [rankings]);

  return {
    rankings,
    loading: state.league !== league || state.loading,
    refreshing: state.league === league && state.refreshing,
    error: state.league === league ? state.error : null,
    refresh,
    rankedTeamIds,
  };
}
