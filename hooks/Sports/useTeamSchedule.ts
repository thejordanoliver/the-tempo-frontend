import { useTeamMonthSelector } from "hooks/LeagueHooks/useMonthSelector";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LiveSport } from "types/liveSports";
import type { ScheduleMonthGroup } from "types/schedule";
import { apiClient } from "utils/apiClient";
import { getFirstSeasonGame } from "utils/seasonGames";
import {
  buildScheduleMonthOptions,
  getScheduleGamesForMonth,
  isScheduleOpeningMonth,
} from "utils/teamSchedule";
import { ScheduleFreshness } from "./scheduleFreshness";

type ScheduleData<TGame> = { games: TGame[] };
type RequestMode = "initial" | "refresh" | "silent";

export type TeamScheduleConfig<TGame, TResponse, TData extends ScheduleData<TGame>, TError> = {
  sport: LiveSport;
  league: string;
  teamId: string | number | null;
  season?: string | number | null;
  requireSeason?: boolean;
  endpoint: string;
  normalize: (response: TResponse) => TData;
  errorFrom: (error: unknown, mode: RequestMode) => TError;
  clearOnRefreshError?: boolean;
};

export function useTeamSchedule<TGame, TResponse, TData extends ScheduleData<TGame>, TError>({
  sport,
  league,
  teamId,
  season,
  requireSeason = false,
  endpoint,
  normalize,
  errorFrom,
  clearOnRefreshError = false,
}: TeamScheduleConfig<TGame, TResponse, TData, TError>) {
  const validTeam = teamId != null && teamId !== "";
  const validSeason = season !== null && season !== undefined && season !== "";
  const enabled = Boolean(league && validTeam && (!requireSeason || validSeason));
  const identity = `${sport}:${league}:${String(teamId ?? "")}:${String(season ?? "")}`;
  const identityRef = useRef(identity);
  identityRef.current = identity;
  const mountedRef = useRef(false);
  const freshnessRef = useRef(new ScheduleFreshness());
  const [state, setState] = useState<{
    identity: string;
    data: TData | null;
    loading: boolean;
    refreshing: boolean;
    error: TError | null;
  }>(() => ({ identity, data: null, loading: enabled, refreshing: false, error: null }));

  // A changed identity must never expose the previous team's schedule for a render.
  const current = state.identity === identity
    ? state
    : { identity, data: null, loading: enabled, refreshing: false, error: null };

  const fetchSchedule = useCallback(async (mode: RequestMode = "initial") => {
    const freshness = freshnessRef.current;
    const request = freshness.startRequest();
    const isCurrent = () => mountedRef.current && identityRef.current === identity &&
      freshnessRef.current === freshness && freshness.canComplete(request);

    if (!enabled) {
      setState({ identity, data: null, loading: false, refreshing: false, error: null });
      return;
    }

    setState((previous) => ({
      ...(previous.identity === identity ? previous : { identity, data: null, loading: true, refreshing: false, error: null }),
      loading: mode === "initial" && previous.identity !== identity ? true : previous.loading,
      refreshing: mode === "refresh",
      error: null,
    }));

    try {
      const response = await apiClient.get<TResponse>(endpoint);
      // A newer socket update makes the REST snapshot obsolete, but does not
      // prevent this request from completing its loading lifecycle.
      if (isCurrent() && freshness.canApplyResponse(request)) {
        const data = normalize(response.data);
        setState((previous) => ({ ...previous, data, error: null }));
      }
    } catch (error: unknown) {
      if (isCurrent() && freshness.canApplyResponse(request)) {
        const nextError = errorFrom(error, mode);
        if (mode !== "silent") {
          setState((previous) => ({
            ...previous,
            error: nextError,
            data: mode === "initial" || (mode === "refresh" && clearOnRefreshError)
              ? null : previous.data,
          }));
        }
      }
    } finally {
      if (isCurrent()) {
        setState((previous) => ({ ...previous, loading: false, refreshing: false }));
      }
    }
  }, [clearOnRefreshError, enabled, endpoint, errorFrom, identity, normalize]);

  useEffect(() => {
    mountedRef.current = true;
    freshnessRef.current = new ScheduleFreshness();
    setState({ identity, data: null, loading: enabled, refreshing: false, error: null });
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchSchedule();
    });
    return () => {
      cancelled = true;
      mountedRef.current = false;
      freshnessRef.current.invalidateRequests();
    };
  }, [enabled, fetchSchedule, identity]);

  useLiveSportsSubscription<TResponse>({
    enabled,
    kind: "scoreboard",
    payload: { sport, league, feed: "teamSchedule", teamId: teamId ?? "", season },
    onUpdate: (payload, envelope) => {
      const expectedSeason = validSeason ? String(season) : undefined;
      if (!mountedRef.current || identityRef.current !== identity ||
          envelope.sport !== sport || envelope.league !== league ||
          envelope.feed !== "teamSchedule" ||
          envelope.params?.teamId !== String(teamId) ||
          envelope.params?.season !== expectedSeason) return;

      const data = normalize(payload);
      freshnessRef.current.recordSocketUpdate();
      setState((previous) => ({
        ...previous,
        identity,
        data,
        error: null,
        loading: false,
        // An in-flight pull-to-refresh still completes on its own.
      }));
    },
  });

  const refresh = useCallback(() => fetchSchedule("refresh"), [fetchSchedule]);
  const silentRefresh = useCallback(() => fetchSchedule("silent"), [fetchSchedule]);

  return { ...current, refresh, silentRefresh };
}

export function useMonthlyTeamSchedule<TGame extends { date?: string | null },
  TResponse,
  TData extends ScheduleData<TGame> & { months: ScheduleMonthGroup<TGame>[] },
  TError>(config: TeamScheduleConfig<TGame, TResponse, TData, TError>) {
  const schedule = useTeamSchedule(config);
  const monthGroups = useMemo(() => schedule.data?.months ?? [], [schedule.data?.months]);
  const months = useMemo(() => buildScheduleMonthOptions(monthGroups), [monthGroups]);
  const scheduleIdentity = `${config.league}:${String(config.teamId ?? "")}:${String(config.season ?? "")}`;
  const { selectedMonthKey, selectMonth } = useTeamMonthSelector({ months, scheduleIdentity });
  const games = useMemo(() => getScheduleGamesForMonth(monthGroups, selectedMonthKey), [monthGroups, selectedMonthKey]);
  const firstSeasonGame = useMemo(() => getFirstSeasonGame(schedule.data?.games ?? []), [schedule.data?.games]);
  const showCountdown = isScheduleOpeningMonth(firstSeasonGame, selectedMonthKey);
  return { games, months, selectedMonthKey, selectMonth, firstSeasonGame, showCountdown,
    loading: schedule.loading, refreshing: schedule.refreshing, error: schedule.error, refresh: schedule.refresh };
}
