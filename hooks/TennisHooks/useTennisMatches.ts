import {
  useSportsRequestScope,
  type SportsRequestOptions,
} from "hooks/Sports/useSportsRequestScope";
import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import type { OnScoreboardCalendar } from "hooks/LeagueHooks/useScoreboardCalendar";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import type {
  TennisDivision,
  TennisLeague,
  TennisMatch,
  TennisScoreboardResponse,
  TennisTournament,
} from "types/tennis/tennis";
import { apiClient } from "utils/apiClient";

type FetchOptions = {
  silent?: boolean;
};

const EMPTY_RESPONSE: Pick<
  TennisScoreboardResponse,
  "matches" | "tournaments" | "availableDivisions"
> = {
  matches: [],
  tournaments: [],
  availableDivisions: [],
};

function isCanceledRequest(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const value = error as { name?: string; code?: string };
  return value.name === "CanceledError" || value.code === "ERR_CANCELED";
}

export function useTennisMatches(
  date?: Date,
  league: TennisLeague = "atp",
  onScoreboardCalendar?: OnScoreboardCalendar,
  options: SportsRequestOptions = {},
) {
  const [matches, setMatches] = useState<TennisMatch[]>([]);
  const [tournaments, setTournaments] = useState<TennisTournament[]>([]);
  const [availableDivisions, setAvailableDivisions] = useState<
    TennisDivision[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(
    () => dayjs(date ?? new Date()).format("YYYYMMDD"),
    [date],
  );

  const scope = useSportsRequestScope(
    JSON.stringify([league, formattedDate]),
    options,
  );
  const { enabled, begin, isCurrent, accept, finish } = scope;

  const applyResponse = useCallback(
    (response?: Partial<TennisScoreboardResponse> | null) => {
      setMatches(Array.isArray(response?.matches) ? response.matches : []);
      setTournaments(
        Array.isArray(response?.tournaments) ? response.tournaments : [],
      );
      setAvailableDivisions(
        Array.isArray(response?.availableDivisions)
          ? response.availableDivisions
          : [],
      );
    },
    [],
  );

  const fetchMatches = useCallback(
    async ({ silent = false }: FetchOptions = {}) => {
      const request = begin();
      if (!request) return;

      if (!silent) setLoading(!request.hasData);
      setError(null);

      try {
        const { data } = await apiClient.get<TennisScoreboardResponse>(
          `/api/games/tennis/${league}`,
          {
            params: { date: formattedDate },
            signal: request.controller.signal,
          },
        );

        if (accept(request)) {
          onScoreboardCalendar?.(data);
          applyResponse(data);
        }
      } catch (caughtError: unknown) {
        if (!isCurrent(request) || isCanceledRequest(caughtError)) return;

        onScoreboardCalendar?.(null);
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error(`Failed to fetch ${league.toUpperCase()} matches`),
        );
        if (!silent) applyResponse(EMPTY_RESPONSE);
      } finally {
        if (finish(request)) {
          setLoading(false);
        }
      }
    },
    [
      applyResponse,
      formattedDate,
      league,
      onScoreboardCalendar,
      begin,
      accept,
      finish,
      isCurrent,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled && enabled) void fetchMatches();
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, fetchMatches]);

  const refreshMatches = useCallback(async () => {
    if (!enabled) return;
    setRefreshing(true);

    try {
      await fetchMatches({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }, [enabled, fetchMatches]);

  const hasActiveMatch = useMemo(
    () => matches.some(shouldTrackGameUpdates),
    [matches],
  );

  useLiveSportsSubscription<TennisScoreboardResponse>({
    enabled: enabled && scope.hasData && !loading && hasActiveMatch,
    kind: "scoreboard",
    payload: {
      sport: "tennis",
      league,
      date: formattedDate,
    },
    onUpdate: (data) => {
      if (!accept()) return;
      setLoading(false);
      applyResponse(data);
    },
  });

  return {
    matches: scope.hasData ? matches : [],
    tournaments: scope.hasData ? tournaments : [],
    availableDivisions: scope.hasData ? availableDivisions : [],
    loading: enabled && !scope.hasData && (!scope.settled || loading),
    refreshing: enabled && refreshing,
    error: enabled && scope.settled ? error : null,
    refreshMatches,
  };
}
