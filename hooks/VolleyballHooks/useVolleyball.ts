import type {
  VolleyballDirectoryTeam,
  VolleyballGameDetails,
  VolleyballSchedule,
  VolleyballScoreboard,
} from "@/types/volleyball/volleyball";
import dayjs from "dayjs";
import type { OnScoreboardCalendar } from "hooks/LeagueHooks/useScoreboardCalendar";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";
import { volleyballDirectoryTeam } from "utils/volleyball";

/** Backend responses only. Request generations also guard refreshes and live updates. */
export function useVolleyballResource<T>(path: string | null) {
  const [state, setState] = useState<{
    path: string | null;
    data: T | null;
    loading: boolean;
    refreshing: boolean;
    error: Error | null;
  }>({
    path: null,
    data: null,
    loading: false,
    refreshing: false,
    error: null,
  });
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const request = useCallback(
    async (refreshing = false) => {
      controller.current?.abort();
      const id = ++generation.current;
      if (!path) return;
      const abort = new AbortController();
      controller.current = abort;
      setState((previous) => ({
        path,
        data: previous.path === path ? previous.data : null,
        loading: !refreshing,
        refreshing,
        error: null,
      }));
      try {
        const { data } = await apiClient.get<T>(path, { signal: abort.signal });
        if (generation.current === id)
          setState({
            path,
            data,
            loading: false,
            refreshing: false,
            error: null,
          });
      } catch (error) {
        if (abort.signal.aborted || generation.current !== id) return;
        setState((previous) => ({
          ...previous,
          loading: false,
          refreshing: false,
          error:
            error instanceof Error
              ? error
              : new Error("Unable to load volleyball data."),
        }));
      }
    },
    [path],
  );
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void request();
    });
    return () => {
      cancelled = true;
      generation.current += 1;
      controller.current?.abort();
      controller.current = null;
    };
  }, [request]);
  const refresh = useCallback(() => request(true), [request]);
  const replace = useCallback(
    (data: T) => {
      generation.current += 1;
      controller.current?.abort();
      setState({ path, data, loading: false, refreshing: false, error: null });
    },
    [path],
  );
  return {
    data: state.path === path ? state.data : null,
    loading: !!path && (state.path !== path || state.loading),
    refreshing: state.path === path && state.refreshing,
    error: state.path === path ? state.error : null,
    refresh,
    replace,
  };
}

export function useVolleyballGames(
  date: Date,
  league: string,
  onCalendar?: OnScoreboardCalendar,
) {
  const day = dayjs(date).format("YYYYMMDD");
  const resource = useVolleyballResource<VolleyballScoreboard>(
    `/api/games/volleyball/${league}?date=${day}`,
  );
  useEffect(() => {
    if (resource.data || resource.error) onCalendar?.(resource.data);
  }, [onCalendar, resource.data, resource.error]);
  useLiveSportsSubscription<VolleyballScoreboard>({
    kind: "scoreboard",
    payload: { sport: "volleyball", league, date: day },
    onUpdate: resource.replace,
  });
  return {
    ...resource,
    games: resource.data?.games ?? [],
    refreshGames: resource.refresh,
  };
}

export function useVolleyballSchedule(
  league: string,
  teamId: string,
  season?: string,
) {
  const resource = useVolleyballResource<VolleyballSchedule>(
    teamId
      ? `/api/games/volleyball/team/${league}/${encodeURIComponent(teamId)}${season ? `/${encodeURIComponent(season)}` : ""}`
      : null,
  );
  useLiveSportsSubscription<VolleyballSchedule>({
    enabled: !!teamId,
    kind: "scoreboard",
    payload: {
      sport: "volleyball",
      league,
      feed: "teamSchedule",
      teamId,
      season,
    },
    onUpdate: resource.replace,
  });
  return resource;
}

export function useVolleyballGame(league: string, gameId: string) {
  const resource = useVolleyballResource<VolleyballGameDetails>(
    gameId
      ? `/api/games/volleyball/game/${league}/${encodeURIComponent(gameId)}`
      : null,
  );
  useLiveSportsSubscription<VolleyballGameDetails>({
    enabled: !!gameId,
    kind: "game",
    payload: { sport: "volleyball", league, gameId },
    onUpdate: resource.replace,
  });
  return resource;
}

export function useVolleyballDirectory() {
  const men = useVolleyballResource<{ teams: VolleyballDirectoryTeam[] }>(
    "/api/teams/mcvb",
  );
  const women = useVolleyballResource<{ teams: VolleyballDirectoryTeam[] }>(
    "/api/teams/wcvb",
  );
  const teams = useMemo(
    () => [
      ...(men.data?.teams ?? []).map((team) =>
        volleyballDirectoryTeam(team, "mcvb"),
      ),
      ...(women.data?.teams ?? []).map((team) =>
        volleyballDirectoryTeam(team, "wcvb"),
      ),
    ],
    [men.data, women.data],
  );
  const refresh = useCallback(async () => {
    await Promise.all([men.refresh(), women.refresh()]);
  }, [men, women]);
  return {
    teams,
    loading: men.loading || women.loading,
    error: men.error ?? women.error,
    refresh,
  };
}
