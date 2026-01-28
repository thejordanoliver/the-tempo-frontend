import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export type StandingsTeam = {
  id: string;
  teamId: string;
  name: string;
  abbreviation: string;
  conference: string; // "Eastern" | "Western"
  division: string;
  wins: number;
  losses: number;
  winPercent: number;
  gamesBehind: number;
  homeRecord: string;
  roadRecord: string;
  conferenceRecord: string;
  vsdiv: string;
  streak: string;
  pointsFor: number;
  pointsAgainst: number;
};


export type ConferenceStandings = {
  id: string;
  name: string;
  abbreviation: string;
  standings: StandingsTeam[];
};

export type MLBStandingsData = {
  season: number;
  seasonDisplayName: string;
  conferences: ConferenceStandings[];
  divisions: Record<string, StandingsTeam[]>;
};

export function useMLBStandings(year?: string) {
  const [data, setData] = useState<MLBStandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/standings/mlb`, {
        params: year ? { season: year } : undefined,
      });

      setData(res.data);
    } catch (err: any) {
      console.error("Failed to fetch MLB standings:", err);
      setError(err.message || "Failed to fetch MLB standings");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [year]);

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
