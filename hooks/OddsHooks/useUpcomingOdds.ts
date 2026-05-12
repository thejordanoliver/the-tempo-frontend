import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface Bookmaker {
  key: string;
  title: string;
  markets: {
    key: string;
    outcomes: {
      name: string;
      price: number;
      point?: number;
    }[];
  }[];
}

export interface GameOdds {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}
export interface EventOdds {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export type OddsLeague =
  | "nba"
  | "wnba"
  | "nfl"
  | "nhl"
  | "mlb"
  | "cbb"
  | "wcbb"
  | "mma"
  | "cfb";

const cache: Record<string, GameOdds[]> = {};

interface UseUpcomingOddsOptions {
  league?: OddsLeague;
  timestamp?: string | number;
  team1?: string;
  team2?: string;
  markets?: string;
  regions?: string;
  oddsFormat?: "american" | "decimal";
  bookmakers?: string;
  includeTimestamp?: boolean;
}

export const useUpcomingOdds = ({
  league = "nba",
  timestamp,
  team1,
  team2,
  markets,
  regions,
  oddsFormat,
  bookmakers,
  includeTimestamp = false,
}: UseUpcomingOddsOptions = {}) => {
  const [data, setData] = useState<GameOdds[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    const nextParams: Record<string, string> = {
      league,
    };

    if (includeTimestamp && timestamp) {
      const parsedTimestamp = new Date(timestamp);

      if (!Number.isNaN(parsedTimestamp.getTime())) {
        nextParams.timestamp = parsedTimestamp.toISOString();
      }
    }

    if (team1) nextParams.team1 = team1;
    if (team2) nextParams.team2 = team2;
    if (markets) nextParams.markets = markets;
    if (regions) nextParams.regions = regions;
    if (oddsFormat) nextParams.oddsFormat = oddsFormat;
    if (bookmakers) nextParams.bookmakers = bookmakers;

    return nextParams;
  }, [
    league,
    timestamp,
    team1,
    team2,
    markets,
    regions,
    oddsFormat,
    bookmakers,
    includeTimestamp,
  ]);

  useEffect(() => {
    const key = JSON.stringify(params);

    if (cache[key]) {
      setData(cache[key]);
      setError(null);
      setLoading(false);
      return;
    }

    setData([]);
    setError(null);
    setLoading(true);

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res = await apiClient.get("api/odds/upcoming", {
          params,
          signal: controller.signal,
        });

        const games: GameOdds[] = res.data?.games || [];

        cache[key] = games;
        setData(games);
      } catch (err: any) {
        if (axios.isCancel(err) || err?.name === "CanceledError") return;

        const message =
          err.response?.data?.error ||
          err.response?.data?.details?.message ||
          err.message ||
          "Failed to fetch upcoming odds";

        console.log("❌ Upcoming odds error:", err.response?.data || message);
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [params]);

  return { data, loading, error };
};
