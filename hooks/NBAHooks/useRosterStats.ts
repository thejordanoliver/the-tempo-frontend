import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";
import type { BasketballRosterStatsResponse } from "@/types/basketball/stats";

export type {
  BasketballRosterLeague,
  BasketballRosterPlayer as Player,
  BasketballRosterStatsResponse as RosterStats,
  BasketballSeasonStats,
  BasketballStatMap as BasketballStatGroup,
  BasketballStatValue as StatValue,
} from "@/types/basketball/stats";

type RosterStats = BasketballRosterStatsResponse;

const EMPTY_ROSTER_STATS = (teamId: string): RosterStats => ({
  teamId,
  count: 0,
  players: [],
});

const normalizeRosterStatsResponse = (
  data: Partial<RosterStats> | null | undefined,
  teamId: string,
): RosterStats => {
  const players = Array.isArray(data?.players) ? data.players : [];

  return {
    teamId: String(data?.teamId ?? teamId),
    count: typeof data?.count === "number" ? data.count : players.length,
    players,
  };
};

const getErrorObject = (err: unknown) => {
  if (err instanceof Error) return err;

  return new Error("Failed to fetch roster stats");
};

export function useRosterStats(
  teamId: string | number | null | undefined,
  league: string,
) {
  const normalizedTeamId = useMemo(() => {
    if (teamId === null || teamId === undefined) return "";

    return String(teamId).trim();
  }, [teamId]);

  const [teamRoster, setTeamRoster] = useState<RosterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchRoster = useCallback(
    async (isRefresh = false) => {
      const requestId = ++requestIdRef.current;
      if (!normalizedTeamId) {
        setTeamRoster(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const url = `/api/team/stats/${league.toLowerCase()}/roster/${normalizedTeamId}`;

        const response = await apiClient.get<RosterStats>(url);
        const normalizedRoster = normalizeRosterStatsResponse(
          response.data,
          normalizedTeamId,
        );

        if (requestId === requestIdRef.current) {
          setTeamRoster(normalizedRoster);
        }
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;
        const errorObject = getErrorObject(err);

        console.error("❌ Error fetching roster stats:", errorObject.message);
        setError(errorObject);
        setTeamRoster(EMPTY_ROSTER_STATS(normalizedTeamId));
      } finally {
        if (isRefresh && requestId === requestIdRef.current) {
          setRefreshing(false);
        } else if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [league, normalizedTeamId],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchRoster();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [fetchRoster]);

  return {
    teamRoster,
    players: teamRoster?.players ?? [],
    count: teamRoster?.count ?? 0,
    loading,
    refreshingStats,
    error,
    refetch: () => fetchRoster(true),
  };
}
