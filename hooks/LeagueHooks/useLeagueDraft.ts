import { useScreenActivity } from "hooks/useScreenActivity";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

type FetchMode = "initial" | "refresh" | "silent";

type DraftPick = {
  pick: number;
  overall: number;
  round: number;
  traded: boolean;
  status: "ON_THE_CLOCK" | "SELECTION_MADE" | "PICK_IS_IN";
  tradeNote: string;
  teamId: string;
  athlete: any | null;
};

type DraftTeam = {
  id: string;
  name: string;
  displayName: string;
  needs: {
    positionId: string;
    met: boolean;
  }[];
};

export type BreakingNews = {
  id: string;
  headline: string;
  title: string;
  timestamp: string;
  payload: string;
};

export type DraftProps = {
  year: number;
  displayName: string;
  status: {
    state: "pre" | "in" | "post";
    round: number;
    label: "Scheduled" | "In Progress" | "Completed";
  };
  isLive: boolean;
  isComplete: boolean;
  current: {
    pickId: number;
    bestAvailablePicks: any[];
    bestAvailable: Record<string, any>;
    bestFit: Record<string, any>;
  };
  next: number;
  picks: DraftPick[];
  teams: DraftTeam[];
  breakingNews: BreakingNews[];
};

export function useDraft(
  league: string,
  year: number | string | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { active: screenActive, activeRef } = useScreenActivity();
  const active = screenActive && enabled;
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  const key = JSON.stringify([league, year]);
  const [stored, setStored] = useState<{
    key: string;
    data: DraftProps;
  } | null>(null);
  const draft = stored?.key === key ? stored.data : null;
  const requestRef = useRef<AbortController | null>(null);
  const loadedKey = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const requestInFlightRef = useRef(false);

  const fetchDraft = useCallback(
    async (mode: FetchMode = "initial") => {
      if (!year || !league || !activeRef.current || !enabledRef.current) return;
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      const requestId = ++requestIdRef.current;
      requestInFlightRef.current = true;

      try {
        if (mode === "refresh") setRefreshing(true);
        if (mode === "initial") {
          setLoading(loadedKey.current !== key);
          setRefreshing(false);
        }

        setError(null);

        const { data } = await apiClient.get<DraftProps>(
          `api/draft/${league}/${year}`,
          { signal: controller.signal },
        );

        if (
          requestId === requestIdRef.current &&
          !controller.signal.aborted &&
          activeRef.current &&
          enabledRef.current
        ) {
          loadedKey.current = key;
          setStored({ key, data });
        }
      } catch (err: unknown) {
        if (
          requestId !== requestIdRef.current ||
          controller.signal.aborted ||
          !activeRef.current ||
          !enabledRef.current
        )
          return;
        const message = err instanceof Error ? err.message : "Unknown error";

        console.error("Draft fetch failed:", message);
        setError("Failed to load Draft data");
      } finally {
        if (requestId === requestIdRef.current) {
          requestInFlightRef.current = false;
          setSettledKey(key);
          if (mode === "refresh") setRefreshing(false);
          if (mode === "initial") setLoading(false);
        }
      }
    },
    [league, year, key, activeRef],
  );

  // INITIAL LOAD

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled && active) void fetchDraft("initial");
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
      requestRef.current?.abort();
      requestInFlightRef.current = false;
    };
  }, [fetchDraft, active]);

  // LIVE POLLING (SILENT ONLY)

  useEffect(() => {
    const state = draft?.status?.state;

    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (!active || state !== "in") return;

    let cancelled = false;

    const poll = async () => {
      if (requestInFlightRef.current) {
        if (!cancelled) {
          pollTimerRef.current = setTimeout(() => void poll(), 10000);
        }
        return;
      }

      await fetchDraft("silent");
      if (!cancelled) {
        pollTimerRef.current = setTimeout(() => void poll(), 10000);
      }
    };

    pollTimerRef.current = setTimeout(() => void poll(), 10000);

    return () => {
      cancelled = true;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [active, draft?.status?.state, fetchDraft]);

  // MANUAL REFRESH

  const onRefresh = useCallback(() => {
    fetchDraft("refresh");
  }, [fetchDraft]);

  return {
    draft,
    isActive: active,
    loading:
      Boolean(year && league) && (loading || (!draft && settledKey !== key)),
    refreshing: active && refreshing,
    error: settledKey === key ? error : null,
    refresh: fetchDraft,
    onRefresh,
  };
}
