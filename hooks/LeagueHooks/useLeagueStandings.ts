import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

export type StandingsTeam = {
  id: string;
  name: string;
  shortName: string | null;
  code: string;
  conference: string;
  division: string;
  wins: number;
  losses: number;
  ties: number;
  otLosses?: number | null;
  winPercent: number;
  gamesAhead?: number | null;
  gamesBehind?: number | null;
  streak: string | null;
  rank?: number | null;
  overallRecord?: string | null;
  homeRecord?: string | null;
  roadRecord?: string | null;
  lastTen?: string | null;
  vsDiv?: string | null;
  vsConf?: string | null;
  pointsFor?: number | null;
  pointsAgainst?: number | null;
  avgPointsFor?: number | null;
  avgPointsAgainst?: number | null;
  pointDifferential?: number | null;
  avgDifferential?: number | null;
  points?: number | null;
  divisionWinPercent?: number | null;
  playoffPercent?: number | null;
  leagueWinPercent?: number | null;
  clincher?: string | null;
  playoffSeed?: number | null;
};

export type ConferenceStandings = {
  id: string;
  name: string;
  abbreviation: string;
  standings: StandingsTeam[];
};

export type SeasonType = {
  id: string;
  name: string;
  abbreviation: string;
  startDate: string | null;
  endDate: string | null;
  hasStandings: boolean;
};

export type Season = {
  year: number;
  displayName: string;
  startDate: string | null;
  endDate: string | null;
  types: SeasonType[];
};

export type LeagueStandingsData = {
  season: number | null;
  seasonDisplayName: string | null;
  seasonType?: number | string | null;
  availableSeasons: Season[];
  conferences: ConferenceStandings[];
  divisions: Record<string, StandingsTeam[]>;
};

type UseLeagueStandingsOptions = {
  seasonType?: string;
};

export function useLeagueStandings(
  league: string,
  year?: string,
  options?: UseLeagueStandingsOptions,
) {
  const [data, setData] = useState<LeagueStandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const seasonType = options?.seasonType ?? "2";

  const fetchStandings = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get<LeagueStandingsData>(
        `/api/standings/${league.toLowerCase()}`,
        {
          params: {
            ...(year ? { season: year } : {}),
            seasontype: seasonType,
          },
        },
      );

      if (requestId !== requestIdRef.current) return;
      setData({
        ...res.data,
        availableSeasons: res.data.availableSeasons ?? [],
        conferences: res.data.conferences ?? [],
        divisions: res.data.divisions ?? {},
      });
    } catch (err: any) {
      if (requestId !== requestIdRef.current) return;
      console.error(`Failed to fetch ${league} standings:`, err);

      setError(
        err?.response?.data?.error ||
        err?.message ||
        `Failed to fetch ${league} standings`,
      );

      setData(null);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [league, year, seasonType]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchStandings();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [fetchStandings]);

  const availableSeasons = useMemo(() => {
    return data?.availableSeasons ?? [];
  }, [data?.availableSeasons]);

  const regularSeasonOptions = useMemo(() => {
    return availableSeasons
      .filter((season) =>
        season.types.some(
          (type) =>
            type.id === "2" && type.abbreviation === "reg" && type.hasStandings,
        ),
      )
      .map((season) => ({
        label: season.displayName,
        value: String(season.year),
      }));
  }, [availableSeasons]);

  return {
    standings: data?.conferences ?? [],
    availableSeasons,
    regularSeasonOptions,
    divisions: data?.divisions ?? {},
    season: data?.season ?? null,
    seasonDisplayName: data?.seasonDisplayName ?? null,
    seasonType: data?.seasonType ?? null,
    loading,
    error,
    refetch: fetchStandings,
  };
}
