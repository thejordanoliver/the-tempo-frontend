import axios from "axios";
import { useEffect, useState } from "react";

/* -------------------------------------------------- */
/* Types                                              */
/* -------------------------------------------------- */

export type LeagueType = "cfb" | "nfl";

export interface Broadcast {
  type?: {
    id?: string;
    shortName?: "TV";
  };
  market?: {
    id?: string;
    type?: "National";
  };
  media?: {
    shortName?: string;
    name?: string;
  };
  lang?: string;
  region?: string;
  isNational?: boolean;
}

export interface GameVenue {
  name: string | null;
  city: string | null;
  state: string | null;
  address?: string | null;
  image?: string | null;
  capacity?: number | null;
  grass?: boolean | null;
  attendance?: number | null;
}

export interface GameDetailsResponse {
  league: LeagueType;
  gameId: string;
  neutralSite: boolean;
  homeRank?: number;
  awayRank?: number;
  homeRecords: {
    total: {
      name: string;
      summary: string;
      abbreviation: string | null;
    };
    home: {
      name: string;
      summary: string;
      abbreviation: string | null;
    };
    road: {
      name: string;
      summary: string;
      abbreviation: string | null;
    };
    vsconf: {
      name: string;
      summary: string;
      abbreviation: string | null;
    };
  };
  awayRecords: {
    total: {
      name: string;
      summary: string;
      abbreviation: string | null;
    };
    home: {
      name: string;
      summary: string;
      abbreviation: string | null;
    };
    road: {
      name: string;
      summary: string;
      abbreviation: string | null;
    };
    vsconf: {
      name: string;
      summary: string;
      abbreviation: string | null;
    };
  };
  headline?: string | null;
  broadcast?: string | null;
  broadcasts?: string[];
  venue?: GameVenue | null;
  officials?: any[];
  injuries?: any[];
  scoringPlays?: any[];
  highlights?: any[];
  previousDrives?: any[];
  currentDrives?: any[];
}

/* -------------------------------------------------- */
/* Hook                                               */
/* -------------------------------------------------- */

/* -------------------------------------------------- */
/* Hook                                               */
/* -------------------------------------------------- */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const useFootballGameDetails = (
  homeId?: string | null,
  awayId?: string | null,
  date?: any,
  league: LeagueType = "cfb"
): {
  data: GameDetailsResponse | null;
  loading: boolean;
} => {
  const [data, setData] = useState<GameDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!homeId || !awayId || !date || !BASE_URL) return;

    setLoading(true);

    axios
      .get(`${BASE_URL}/api/football/details/game-details`, {
        params: {
          homeId,
          awayId,
          date,
          league,
        },
      })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.warn("GameDetails error:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [homeId, awayId, date, league]);

  return { data, loading };
};
