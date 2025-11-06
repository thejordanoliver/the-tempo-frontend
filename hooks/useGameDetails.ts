// hooks/useGameDetails.ts
import axios from "axios";
import { useEffect, useState } from "react";

type Official = {
  fullName: string;
  displayName: string;
  position?: {
    name?: string;
    displayName?: string;
    id?: string;
  };
  order?: number;
};

// Base type for a single team's injuries
export type TeamInjury = {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo?: string;
  };
  injuries: {
    status?: string;
    date?: string;
    athlete: {
      id: string;
      fullName: string;
      displayName: string;
      shortName?: string;
      jersey?: string;
      position?: {
        name?: string;
        displayName?: string;
        abbreviation?: string;
      };
      headshot?: { href: string; alt?: string };
    };
    details?: {
      type?: string;
      location?: string;
      detail?: string;
      side?: string;
      returnDate?: string;
    };
  }[];
};

// Response type
export type GameDetailsResponse = {
  gameId: string;
  league: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  status?: string;
  venue?: {
    name?: string;
    city?: string;
    state?: string;
    capacity?: number;
  };
  officials: string[] | Official[];
  injuries: TeamInjury[];
  boxScore?: any;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Fetch detailed game info (officials, injuries, box score, etc.)
 * @param date - Game date (YYYY-MM-DD or YYYYMMDD)
 * @param home - Home team code (e.g. 'lal')
 * @param away - Away team code (e.g. 'bos')
 * @param league - League (default: 'nba')
 */
export function useGameDetails(
  date: string,
  home: string,
  away: string,
  league: string = "nba"
) {
  const [data, setData] = useState<GameDetailsResponse | null>(null);
  const [detailsLoading, setLoading] = useState(true);
  const [detailsError, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !home || !away) return;

    let cancelled = false;

    async function fetchDetails() {
      setLoading(true);
      setError(null);

      try {
        // Ensure date is compact (YYYYMMDD)
        const compactDate = date.replace(/-/g, "");

        const url = `${BASE_URL}/api/espn/game-details?date=${compactDate}&home=${home.toLowerCase()}&away=${away.toLowerCase()}&league=${league.toLowerCase()}`;
        const resp = await axios.get<GameDetailsResponse>(url);

        if (!cancelled) {
          setData(resp.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("❌ useGameDetails fetch error:", err);
          setError(err.response?.data?.error || err.message || "Failed to fetch game details");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [date, home, away, league]);

  return { data, detailsLoading, detailsError };
}
