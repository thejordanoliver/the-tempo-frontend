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

export function useStandings() {
  const [data, setData] = useState<ConferenceStandings[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/standings/nba/standings`);

    

      setData(res.data.conferences);
    } catch (err: any) {
      setError(err.message || "Failed to fetch standings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);


  return {
    data,
    loading,
    error,
    refetch: fetchStandings,
  };
}

