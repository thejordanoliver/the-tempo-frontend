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

export function useStandings(year?: string) {
  const [data, setData] = useState<ConferenceStandings[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/standings/nba`, {
        params: year ? { season: year } : undefined,
      });

      setData(res.data.conferences);
    } catch (err: any) {
      console.error("Failed to fetch NBA standings:", err);
      setError(err.message || "Failed to fetch standings");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [year]); // 🔑 add year as a dependency

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]); // fetch whenever `year` changes

  return {
    data,
    loading,
    error,
    refetch: fetchStandings,
  };
}
