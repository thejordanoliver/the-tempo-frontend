// hooks/useNFLStandings.ts
import axios from "axios";
import { useEffect, useState } from "react";

// hooks/useNFLStandings.ts

export type NFLDivisionTeam = {
  teamId: string; // ESPN ID always comes as string
  name: string;
  shortName: string;
  abbreviation: string;
  logo: string | null;
  logoDark: string | null;
  conference: string;
  division: string;

  clincher: string | null;
  wins: number | null;
  losses: number | null;
  ties: number | null;              // ✅ ADDED (your UI expects ties)
  winPercent: number | null;
  gamesBehind: number | null;
  streak: string | null;
  playoffSeed: number | null;

  overallRecord: string | null;
  conferenceRecord: string | null;
  homeRecord: string | null;
  roadRecord: string | null;
  lastTen: string | null;

  vsdiv: string | null;
  pointsFor: number | null;
  pointsAgainst: number | null;

  avgPointsFor: number | null;
  avgPointsAgainst: number | null;
  differential: number | null;
  divisionWinPercent: number | null;
  leagueWinPercent: number | null;
  pointDifferential: number | null;
};


export type NFLStandingsData = {
  season: number;
  seasonDisplayName: string;
  conferences: {
    id: string;
    name: string;
    abbreviation: string;
    standings: NFLDivisionTeam[];
  }[];
  divisions: Record<string, NFLDivisionTeam[]>;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const useNFLStandings = () => {
  const [data, setData] = useState<NFLStandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/api/standings/nfl`);
      const standingsData = res.data;

      setData(standingsData);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch NFL standings:", err);
      setError(err.message ?? "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchStandings();
  }, []);
  return {
    standings: data?.conferences ?? [],
    divisions: data?.divisions ?? {},
    season: data?.season ?? null,
    seasonDisplayName: data?.seasonDisplayName ?? null,
    loading,
    error,
    refetch: fetchStandings,
  };
};
