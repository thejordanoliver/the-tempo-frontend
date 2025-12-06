import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export interface CFBTeamInfo {
  id: number;
  school: string;
  mascot: string;
  abbreviation: string;
  alternateNames: string[];
  conference: string;
  division: string | null;
  classification: string;
  color: string;
  alternateColor: string;
  logos: string[];
  twitter?: string;
  location?: any;
}

export interface CFBSeriesGame {
  season?: number;
  week?: number;
  seasonType?: string;
  date?: string;
  neutralSite?: boolean;
  team1Score?: number;
  team2Score?: number;
  team1Home?: boolean;

  // CFBD format
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  winner?: string;

  // Enriched
  homeTeamInfo?: CFBTeamInfo | null;
  awayTeamInfo?: CFBTeamInfo | null;
}

export interface CFBMatchupResponse {
  team1: string;
  team2: string;
  team1Wins: number;
  team2Wins: number;
  ties: number;
  games: CFBSeriesGame[];

  // NEW enriched fields
  team1Info: CFBTeamInfo | null;
  team2Info: CFBTeamInfo | null;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Supports: 
 *  - team names: useCFBMatchup("Florida", "FSU")
 *  - team IDs:   useCFBMatchup(undefined, undefined, 57, 52)
 */
export const useCFBMatchup = (
  team1?: string,
  team2?: string,
  team1Id?: number | string,
  team2Id?: number | string
) => {
  const [data, setData] = useState<CFBMatchupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchup = useCallback(async () => {
    // Require either names or IDs for BOTH teams
    const hasNames = team1 && team2;
    const hasIds = team1Id && team2Id;

    if (!hasNames && !hasIds) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<CFBMatchupResponse>(
        `${BASE_URL}/api/cfbd/matchup`,
        {
          params: {
            ...(team1 && { team1 }),
            ...(team2 && { team2 }),
            ...(team1Id && { team1Id }),
            ...(team2Id && { team2Id }),
          },
        }
      );

      setData(response.data);
    } catch (err: any) {
      console.log("CFB matchup error:", err?.response?.data || err.message);

      setError(
        err?.response?.data?.error ||
          err.message ||
          "Failed to load CFB matchup"
      );
    } finally {
      setLoading(false);
    }
  }, [team1, team2, team1Id, team2Id]);

  useEffect(() => {
    fetchMatchup();
  }, [fetchMatchup]);

  return {
    data,
    loading,
    error,
    refresh: fetchMatchup,
  };
};
