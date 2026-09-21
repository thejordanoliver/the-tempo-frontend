import { BasketballGame } from "@/types/basketball/basketball";
import { useTeamMonthSelector } from "hooks/LeagueHooks/useMonthSelector";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import type {
  ScheduleMonthGroup,
  ScheduleMonthKey,
  ScheduleMonthOption,
} from "types/schedule";
import { apiClient } from "utils/apiClient";
import { getFirstSeasonGame } from "utils/seasonGames";
import {
  buildScheduleMonthOptions,
  getScheduleGamesForMonth,
  isScheduleOpeningMonth,
} from "utils/teamSchedule";

export type BasketballTeamScheduleLeague = "nba" | "wnba" | "cbb" | "wcbb";

export type BasketballScheduleMonth = ScheduleMonthGroup<BasketballGame>;

export type BasketballTeamScheduleTeam = {
  id?: string;
  code?: string;
  location?: string;
  name?: string;
  displayName?: string;
  logo?: string;
  recordSummary?: string;
  seasonSummary?: string;
  standingSummary?: string;
  groups?: any;
};

type Season = {
  year: number;
  type: number;
  name: string;
  displayName: string;
  half: number;
};

export type BasketballTeamScheduleResponse = {
  league: string;
  team: BasketballTeamScheduleTeam | null;
  season: Season;
  games: BasketballGame[];
  months: BasketballScheduleMonth[];
};

type FetchScheduleOptions = {
  isRefresh?: boolean;
  silent?: boolean;
};

export interface UseBasketballTeamGamesResult {
  games: BasketballGame[];
  months: ScheduleMonthOption[];
  selectedMonthKey: ScheduleMonthKey | null;
  selectMonth: (key: ScheduleMonthKey) => void;
  firstSeasonGame: BasketballGame | null;
  showCountdown: boolean;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

function hasValidValue(
  value: string | number | null | undefined,
): value is string | number {
  return value !== null && value !== undefined && value !== "";
}

export function useBasketballTeamGames(
  league: BasketballTeamScheduleLeague,
  teamId: string | number | null,
  season: string | number | null,
): UseBasketballTeamGamesResult {
  const [data, setData] = useState<BasketballTeamScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchSchedule = useCallback(
    async ({
      isRefresh = false,
      silent = false,
    }: FetchScheduleOptions = {}) => {
      const requestId = ++requestIdRef.current;
      if (!league || !hasValidValue(teamId) || !hasValidValue(season)) {
        setData(null);
        setLoading(false);
        setRefreshing(false);
        setError(null);
        return;
      }

      try {
        setError(null);

        if (isRefresh) {
          setRefreshing(true);
        } else if (!silent) {
          setLoading(true);
        }

        const response = await apiClient.get<BasketballTeamScheduleResponse>(
          `api/games/basketball/team/${league}/${teamId}/${season}`,
        );

        const responseGames = response.data.games ?? [];
        const responseMonths = response.data.months ?? [];

        const nextData: BasketballTeamScheduleResponse = {
          league: response.data.league,
          team: response.data.team ?? null,
          season: response.data.season,
          games: responseGames,
          months: responseMonths,
        };

        if (requestId === requestIdRef.current) setData(nextData);
      } catch (err: any) {
        if (requestId !== requestIdRef.current) return;
        const message =
          err?.response?.data?.error ??
          err?.message ??
          `Failed to fetch ${league} basketball team schedule`;

        if (silent) {
          console.warn("BASKETBALL SCHEDULE POLLING ERROR:", message);
        } else {
          console.error("BASKETBALL TEAM SCHEDULE ERROR:", err);
          setError(new Error(message));

          if (!isRefresh) {
            setData(null);
          }
        }
      } finally {
        if (isRefresh && requestId === requestIdRef.current) {
          setRefreshing(false);
        }

        if (!silent && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [league, teamId, season],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchSchedule();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [fetchSchedule]);

  const allGames = useMemo(() => data?.games ?? [], [data?.games]);
  const monthGroups = useMemo(() => data?.months ?? [], [data?.months]);
  const months = useMemo(
    () => buildScheduleMonthOptions(monthGroups),
    [monthGroups],
  );
  const scheduleIdentity = `${league}:${String(teamId ?? "")}:${String(
    season ?? "",
  )}`;
  const { selectedMonthKey, selectMonth } = useTeamMonthSelector({
    months,
    scheduleIdentity,
  });
  const games = useMemo(
    () => getScheduleGamesForMonth(monthGroups, selectedMonthKey),
    [monthGroups, selectedMonthKey],
  );
  const firstSeasonGame = useMemo(
    () => getFirstSeasonGame(allGames),
    [allGames],
  );
  const showCountdown = isScheduleOpeningMonth(
    firstSeasonGame,
    selectedMonthKey,
  );

  useLiveSportsSubscription<BasketballTeamScheduleResponse>({
    enabled: Boolean(league && hasValidValue(teamId) && hasValidValue(season)),
    kind: "scoreboard",
    payload: {
      sport: "basketball",
      league,
      feed: "teamSchedule",
      teamId: teamId || "",
      season: season || "",
    },
    onUpdate: (payload, envelope) => {
      const isCurrentSchedule =
        envelope.sport === "basketball" &&
        envelope.league === league &&
        envelope.feed === "teamSchedule" &&
        envelope.params?.teamId === String(teamId) &&
        envelope.params?.season === String(season);

      if (!isCurrentSchedule) return;

      requestIdRef.current += 1;
      const nextData: BasketballTeamScheduleResponse = {
        league: payload.league,
        team: payload.team ?? null,
        season: payload.season,
        games: payload.games ?? [],
        months: payload.months ?? [],
      };

      setError(null);
      setData(nextData);
      setLoading(false);
      setRefreshing(false);
    },
  });

  const refresh = useCallback(async () => {
    await fetchSchedule({ isRefresh: true });
  }, [fetchSchedule]);

  return useMemo(
    () => ({
      games,
      months,
      selectedMonthKey,
      selectMonth,
      firstSeasonGame,
      showCountdown,
      loading,
      refreshing,
      error,
      refresh,
    }),
    [
      games,
      months,
      selectedMonthKey,
      selectMonth,
      firstSeasonGame,
      showCountdown,
      loading,
      refreshing,
      error,
      refresh,
    ],
  );
}
