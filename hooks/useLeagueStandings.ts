import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { LeagueType } from "types/types";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Generic team type for any league
 */
export type StandingsTeam = {
  // Basic identifiers
  id: string;                  // internal or generated id
  teamId: string;              // ESPN team id
  name: string;                // Full team name
  abbreviation: string;        // Team abbreviation
  conference: string;          // e.g., "Eastern" | "Western" | "AFC" | "NFC"
  division: string;            // Division name

  // Record
  wins: number;
  losses: number;
  ties: number;
  otLosses?: number | null;    // For NHL OT losses
  winPercent: number;
  gamesAhead?: number | null;
  gamesBehind?: number | null;
  streak: string;

  rank: number
  // Split records
  overallRecord?: string | null;
  homeRecord?: string | null;
  roadRecord?: string | null;
  lastTen?: string | null;
  vsDiv?: string | null;
  vsConf?: string | null;

  // Points / scoring
  pointsFor?: number | null;
  pointsAgainst?: number | null;
  avgPointsFor?: number | null;
  avgPointsAgainst?: number | null;
  pointDifferential?: number | null;
  avgDifferential?: number | null;
  points?: number | null;

  // Advanced stats
  divisionWinPercent?: number | null;
  leagueWinPercent?: number | null;

  // Playoff info
  clincher?: string | null;    // e.g., "X", "Y", "E", etc.
  playoffSeed?: number | null;
};


/**
 * Conference or division grouping
 */
export type ConferenceStandings = {
  id: string;
  name: string;
  abbreviation: string;
  standings: StandingsTeam[];
};

/**
 * Generic league standings data
 */
export type LeagueStandingsData = {
  season: number;
  seasonDisplayName: string;
  conferences: ConferenceStandings[];
  divisions: Record<string, StandingsTeam[]>;
};

export function useLeagueStandings(league: LeagueType, year?: string) {
  const [data, setData] = useState<LeagueStandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${BASE_URL}/api/standings/${league.toLowerCase()}`,
        {
          params: year ? { season: year } : undefined,
        },
      );

      setData(res.data);
    } catch (err: any) {
      console.error(`Failed to fetch ${league} standings:`, err);
      setError(err.message || `Failed to fetch ${league} standings`);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [league, year]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return {
    standings: data?.conferences ?? [],
    divisions: data?.divisions ?? {},
    season: data?.season ?? null,
    seasonDisplayName: data?.seasonDisplayName ?? null,
    loading,
    error,
    refetch: fetchStandings,
  };
}
