import { FootballGame } from "@/types/football";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

type League = "nfl" | "cfb" | "ufl";

type UseFootballGamesParams = {
  date?: Date;
  week?: number | string | null;
  season?: number | string | null;
  seasontype?: number | string | null;
  league?: League;

  // ✅ Add this
  conferenceId?: number | string | null;
};

type FetchGamesOptions = {
  forceRefresh?: boolean;
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

function getEndpoint(league: League) {
  return league === "cfb"
    ? "/api/games/football/cfb"
    : league === "nfl"
      ? "/api/games/football/nfl"
      : "/api/games/football/ufl";
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
}: UseFootballGamesParams = {}) {
  const [groups, setGroups] = useState<FootballGameGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const games = useMemo(() => {
    return groups.flatMap((group) => group.games);
  }, [groups]);

  const fetchGames = useCallback(
    async ({ forceRefresh = false }: FetchGamesOptions = {}) => {
      const endpoint = getEndpoint(league);

      const params: Record<string, string | number> = {};

      if (week) {
        params.week = week;
        params.season = season || dayjs().year();

        if (seasontype) {
          params.seasontype = seasontype;
        }
      } else if (date) {
        params.date = dayjs(date).format("YYYYMMDD");

        if (season) {
          params.season = season;
        }

        if (seasontype) {
          params.seasontype = seasontype;
        }
      }

      if (league === "cfb" && conferenceId) {
        params.conferenceId = conferenceId;
      }

      try {
        setError(null);

        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const { data } = await apiClient.get<FootballGamesResponse>(endpoint, {
          params,
        });

        setGroups(normalizeGroups(data));
      } catch (err) {
        console.error(err);
        setError(new Error(`Failed to fetch ${league.toUpperCase()} games`));
        setGroups([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [date, week, season, seasontype, league, conferenceId],
  );

  const refreshGames = useCallback(async () => {
    await fetchGames({ forceRefresh: true });
  }, [fetchGames]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    groups,
    loading,
    refreshing,
    error,
    refreshGames,
  };
}
