import { useScreenActivity } from "hooks/useScreenActivity";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  LeagueTransaction,
  TransactionsResponse,
} from "types/transactions";
import { apiClient } from "utils/apiClient";

type FetchMode = "initial" | "refresh" | "more";
type Options = {
  /** Calendar year for transactions, independent of the league playing season. */
  season?: number;
  enabled?: boolean;
  limit?: number;
};
type State = {
  key: string;
  data: TransactionsResponse | null;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  failedMode: FetchMode | null;
};

export const getTransactionKey = (transaction: LeagueTransaction) =>
  JSON.stringify([
    transaction.teamId,
    transaction.date,
    transaction.description,
  ]);

export function useTransactions(
  league: string,
  { season, enabled = true, limit = 25 }: Options = {},
) {
  const { active: screenActive, activeRef } = useScreenActivity();
  const active = screenActive && enabled;
  const year = season ?? new Date().getUTCFullYear();
  const pageSize = Math.min(100, Math.max(1, Math.trunc(limit) || 25));
  const key = JSON.stringify([league, year, pageSize]);
  const initial: State = {
    key,
    data: null,
    loading: enabled,
    refreshing: false,
    loadingMore: false,
    error: null,
    failedMode: null,
  };
  const [state, setState] = useState<State>(initial);
  const current = state.key === key ? state : initial;
  const requestRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  const fetchPage = useCallback(
    async (mode: FetchMode, page = 1) => {
      if (!active || !activeRef.current) return;
      if (mode === "more" && requestRef.current) return;
      cancel();
      const controller = new AbortController();
      requestRef.current = controller;
      setState((previous) => {
        const value =
          previous.key === key ? previous : { ...previous, key, data: null };
        return {
          ...value,
          loading: mode === "initial" && !value.data,
          refreshing: mode === "refresh",
          loadingMore: mode === "more",
          error: null,
          failedMode: null,
        };
      });
      try {
        const { data } = await apiClient.get<TransactionsResponse>(
          `/api/transactions/${league}`,
          {
            params: { season: year, page, limit: pageSize },
            signal: controller.signal,
          },
        );
        if (controller.signal.aborted || !activeRef.current) return;
        setState((previous) => {
          if (previous.key !== key) return previous;
          const transactions =
            mode === "more"
              ? [...(previous.data?.transactions ?? []), ...data.transactions]
              : data.transactions;
          const unique = new Map(
            transactions.map((item) => [getTransactionKey(item), item]),
          );
          return {
            ...previous,
            data: { ...data, transactions: [...unique.values()] },
          };
        });
      } catch {
        if (controller.signal.aborted || !activeRef.current) return;
        setState((previous) =>
          previous.key !== key
            ? previous
            : {
                ...previous,
                error: "Couldn’t load transactions. Please try again.",
                failedMode: mode,
              },
        );
      } finally {
        if (requestRef.current === controller) requestRef.current = null;
        if (!controller.signal.aborted) {
          setState((previous) =>
            previous.key !== key
              ? previous
              : {
                  ...previous,
                  loading: false,
                  refreshing: false,
                  loadingMore: false,
                },
          );
        }
      }
    },
    [active, activeRef, cancel, key, league, pageSize, year],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchPage("initial");
    });
    return () => {
      cancelled = true;
      cancel();
    };
  }, [cancel, fetchPage]);

  const hasMore =
    !!current.data && current.data.pageIndex < current.data.pageCount;
  const loadMore = useCallback(() => {
    if (!hasMore || current.error || !current.data) return;
    void fetchPage("more", current.data.pageIndex + 1);
  }, [current.data, current.error, fetchPage, hasMore]);
  const onRefresh = useCallback(() => {
    void fetchPage("refresh");
  }, [fetchPage]);
  const retry = useCallback(() => {
    const mode = current.failedMode ?? "initial";
    void fetchPage(
      mode,
      mode === "more" ? (current.data?.pageIndex ?? 0) + 1 : 1,
    );
  }, [current.data, current.failedMode, fetchPage]);

  return {
    data: current.data,
    transactions: current.data?.transactions ?? [],
    hasMore,
    isActive: active,
    loading: current.loading,
    refreshing: active && current.refreshing,
    loadingMore: active && current.loadingMore,
    error: current.error,
    loadMore,
    onRefresh,
    retry,
  };
}
