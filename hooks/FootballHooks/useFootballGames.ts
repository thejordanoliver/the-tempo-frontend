import { useSportsRequestScope } from "hooks/Sports/useSportsRequestScope";
import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import type { OnScoreboardCalendar } from "hooks/LeagueHooks/useScoreboardCalendar";
import { FootballGame } from "@/types/football/football";
import dayjs from "dayjs";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

type UseFootballGamesParams = {
  date?: Date;
  week?: number | string | null;
  season?: number | string | null;
  seasontype?: number | string | null;
  league?: string;
  conferenceId?: number | string | null;

  enabled?: boolean;
  scopeKey?: string;
  onScoreboardCalendar?: OnScoreboardCalendar;
};

type FetchGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

export type FootballGameGroup = {
  key: string;
  label: string;

  season: {
    year: number | null;
    type: number | null;
    slug: string | null;
  };

  week: {
    number: number | null;
  };

  count: number;
  games: FootballGame[];
};

type FootballGamesResponse = {
  calendar?: unknown[] | null;
  calendarStartDate?: string | null;
  calendarEndDate?: string | null;
  league?: string;

  season?: {
    year?: number | null;
    type?: number | null;
    slug?: string | null;
  } | null;

  week?: {
    number?: number | null;
  } | null;

  date?: string | null;
  count?: number;
  games?: FootballGame[];
  groups?: FootballGameGroup[];
};

function getEndpoint(league: string): string {
  return `/api/games/football/${league}`;
}

function normalizeGroups(data: FootballGamesResponse): FootballGameGroup[] {
  if (Array.isArray(data?.groups)) {
    return data.groups.map((group) => {
      const games = Array.isArray(group.games) ? group.games : [];

      return {
        key:
          group.key ||
          `${group.season?.slug ?? "season"}-week-${
            group.week?.number ?? "unknown"
          }`,

        label:
          group.label ||
          (group.week?.number ? `Week ${group.week.number}` : "Games"),

        season: {
          year: group.season?.year ?? null,
          type: group.season?.type ?? null,
          slug: group.season?.slug ?? null,
        },

        week: {
          number: group.week?.number ?? null,
        },

        count: games.length,
        games,
      };
    });
  }

  if (Array.isArray(data?.games)) {
    return [
      {
        key: "all-games",

        label: data.week?.number ? `Week ${data.week.number}` : "All Games",

        season: {
          year: data.season?.year ?? null,
          type: data.season?.type ?? null,
          slug: data.season?.slug ?? null,
        },

        week: {
          number: data.week?.number ?? null,
        },

        count: data.games.length,
        games: data.games,
      },
    ];
  }

  return [];
}

export function useFootballGames({
  date,
  week = null,
  season = null,
  seasontype = null,
  league = "nfl",
  conferenceId = null,
  enabled = true,
  scopeKey,
  onScoreboardCalendar,
}: UseFootballGamesParams = {}) {
  const [groups, setGroups] = useState<FootballGameGroup[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const scope = useSportsRequestScope(
    JSON.stringify([
      league,
      date ? dayjs(date).format("YYYYMMDD") : null,
      week,
      season,
      seasontype,
      conferenceId,
    ]),
    { enabled, scopeKey },
  );
  const { begin, isCurrent, accept, finish } = scope;

  const games = useMemo(() => {
    return scope.hasData ? groups.flatMap((group) => group.games) : [];
  }, [groups, scope.hasData]);

  const fetchGames = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchGamesOptions = {}) => {
      const request = begin();
      if (!request) return;

      const endpoint = getEndpoint(league);

      const params: Record<string, string | number> = {};

      if (week != null && week !== "") {
        params.week = week;

        if (season != null && season !== "") {
          params.season = season;
        }

        if (seasontype != null && seasontype !== "") {
          params.seasontype = seasontype;
        }
      } else if (date) {
        params.date = dayjs(date).format("YYYYMMDD");

        if (season != null && season !== "") {
          params.season = season;
        }

        if (seasontype != null && seasontype !== "") {
          params.seasontype = seasontype;
        }
      }

      if (league === "cfb" && conferenceId != null && conferenceId !== "") {
        params.conferenceId = conferenceId;
      }

      try {
        setError(null);

        if (forceRefresh) {
          setRefreshing(true);
        } else if (!silent) {
          setLoading(!request.hasData);
        }

        const { data } = await apiClient.get<FootballGamesResponse>(endpoint, {
          params,
          signal: request.controller.signal,
        });

        if (accept(request)) {
          onScoreboardCalendar?.(data);
          setGroups(normalizeGroups(data));
        }
      } catch (err) {
        if (!isCurrent(request)) return;
        onScoreboardCalendar?.(null);
        console.error(err);

        setError(new Error(`Failed to fetch ${league.toUpperCase()} games`));

        // Preserve existing games if a background refresh
        // temporarily fails.
        if (!forceRefresh && !silent) {
          setGroups([]);
        }
      } finally {
        if (finish(request)) {
          setRefreshing(false);
          setLoading(false);
        }
      }
    },
    [
      date,
      week,
      season,
      seasontype,
      league,
      conferenceId,
      onScoreboardCalendar,
      begin,
      accept,
      finish,
      isCurrent,
    ],
  );

  const refreshGames = useCallback(async () => {
    if (!enabled) {
      return;
    }

    await fetchGames({
      forceRefresh: true,
    });
  }, [enabled, fetchGames]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (!enabled) {
        setLoading(false);
        return;
      }

      void fetchGames();
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, fetchGames]);

  const hasActiveGame = useMemo(() => {
    return games.some(shouldTrackGameUpdates);
  }, [games]);

  const scoreboardDate = useMemo(
    () => (date ? dayjs(date).format("YYYYMMDD") : undefined),
    [date],
  );

  useLiveSportsSubscription<FootballGamesResponse>({
    enabled: enabled && scope.hasData && !loading && hasActiveGame,

    kind: "scoreboard",

    payload: {
      sport: "football",
      league,
      date: scoreboardDate,
      week,
      season,
      seasontype,
      conferenceId,
    },

    onUpdate: (payload: FootballGamesResponse) => {
      if (!accept()) return;
      setLoading(false);
      setRefreshing(false);
      setGroups(normalizeGroups(payload));
    },
  });

  return {
    games,
    groups: scope.hasData ? groups : [],
    loading: enabled && !scope.hasData && (!scope.settled || loading),
    refreshing: enabled && refreshing,
    error: enabled && scope.settled ? error : null,
    refreshGames,
  };
}
