import { FootballGame } from "@/types/football/football";
import { isGameLive } from "@/utils/games";
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

  /**
   * Controls whether the hook is allowed to fetch.
   *
   * Useful when the selected week depends on calendar data that
   * has not finished resolving yet.
   */
  enabled?: boolean;
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
}: UseFootballGamesParams = {}) {
  const [groups, setGroups] = useState<FootballGameGroup[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const games = useMemo(() => {
    return groups.flatMap((group) => group.games);
  }, [groups]);

  const fetchGames = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchGamesOptions = {}) => {
      if (!enabled) {
        return;
      }

      const endpoint = getEndpoint(league);

      const params: Record<string, string | number> = {};

      /*
       * A week-based request should only be made once the
       * requested week is actually known.
       */
      if (week != null && week !== "") {
        params.week = week;

        if (season != null && season !== "") {
          params.season = season;
        } else {
          params.season = dayjs().year();
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
          setLoading(true);
        }

        const { data } = await apiClient.get<FootballGamesResponse>(endpoint, {
          params,
        });

        setGroups(normalizeGroups(data));
      } catch (err) {
        console.error(err);

        setError(new Error(`Failed to fetch ${league.toUpperCase()} games`));

        // Preserve existing games if a background refresh
        // temporarily fails.
        if (!silent) {
          setGroups([]);
        }
      } finally {
        if (forceRefresh) {
          setRefreshing(false);
        }

        if (!silent) {
          setLoading(false);
        }
      }
    },
    [enabled, date, week, season, seasontype, league, conferenceId],
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
    if (!enabled) {
      setLoading(false);
      return;
    }

    void fetchGames();
  }, [enabled, fetchGames]);

  const hasLiveGame = useMemo(() => {
    return games.some(isGameLive);
  }, [games]);

  const scoreboardDate = useMemo(
    () => (date ? dayjs(date).format("YYYYMMDD") : undefined),
    [date],
  );

  useLiveSportsSubscription<FootballGamesResponse>({
    enabled: enabled && hasLiveGame,

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
      setGroups(normalizeGroups(payload));
    },
  });

  return {
    games,
    groups,
    loading,
    refreshing,
    error,
    refreshGames,
  };
}
