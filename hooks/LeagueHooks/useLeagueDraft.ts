import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { BASE_URL } from "utils/apiClient";

type League = "nba" | "wnba" | "nfl";

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

export function useDraft(league: League, year: number | string | undefined) {
  const [draft, setDraft] = useState<DraftProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDraft = useCallback(
    async (mode: FetchMode = "initial") => {
      if (!year || !league) return;

      try {
        if (mode === "refresh") setRefreshing(true);
        if (mode === "initial") setLoading(true);

        setError(null);

        const { data } = await axios.get<DraftProps>(
          `${BASE_URL}/api/draft/${league}/${year}`,
        );

        setDraft(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";

        console.error("Draft fetch failed:", message);
        setError("Failed to load Draft data");
      } finally {
        if (mode === "refresh") setRefreshing(false);
        if (mode === "initial") setLoading(false);
      }
    },
    [league, year],
  );

  // ---------------------------
  // INITIAL LOAD
  // ---------------------------
  useEffect(() => {
    fetchDraft("initial");
  }, [fetchDraft]);

  // ---------------------------
  // LIVE POLLING (SILENT ONLY)
  // ---------------------------
  useEffect(() => {
    const state = draft?.status?.state;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (state !== "in") return;

    intervalRef.current = setInterval(() => {
      fetchDraft("silent");
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [draft?.status?.state, fetchDraft]);

  // ---------------------------
  // MANUAL REFRESH
  // ---------------------------
  const onRefresh = useCallback(() => {
    fetchDraft("refresh");
  }, [fetchDraft]);

  return {
    draft,
    loading,
    refreshing,
    error,
    refresh: fetchDraft,
    onRefresh,
  };
}
