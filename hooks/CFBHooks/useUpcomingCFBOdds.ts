import axios, { CancelTokenSource } from "axios";
import { useEffect, useRef, useState } from "react";

export interface MarketOutcome {
  name: string;
  price: number;
  point?: number;
}

export interface Market {
  key: string;
  outcomes: MarketOutcome[];
}

export interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

export interface Moneyline {
  key: string;
  last_update?: string;
  outcomes: MarketOutcome[];
}

export interface UpcomingCFBGameOdds {
  id: string;
  commence_time: string;
  commence_time_local?: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
  moneyline?: Moneyline | null;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface UseUpcomingCFBOddsOptions {
  timestamp?: string | number;
  team1?: string;
  team2?: string;
}

const cache: Record<string, UpcomingCFBGameOdds[]> = {};

export const useUpcomingCFBOdds = ({
  timestamp,
  team1,
  team2,
}: UseUpcomingCFBOddsOptions) => {
  const [data, setData] = useState<UpcomingCFBGameOdds[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastParamsRef = useRef<string | null>(null);

  useEffect(() => {
    const normalizedTs = timestamp
      ? new Date(timestamp).toISOString()
      : undefined;

    const params: Record<string, string> = {};
    if (normalizedTs) params.timestamp = normalizedTs;
    if (team1) params.team1 = team1;
    if (team2) params.team2 = team2;
    params.markets = "h2h,spreads,totals";
    params.bookmakers = "draftkings";

    const key = JSON.stringify(params);

    if (cache[key]) {
      setData(cache[key]);
      setError(null);
      return;
    }

    if (lastParamsRef.current === key) return;
    lastParamsRef.current = key;

    let cancelSource: CancelTokenSource | null = axios.CancelToken.source();

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/cfb/upcoming`, {
          params,
          cancelToken: cancelSource?.token,
        });

        const games: UpcomingCFBGameOdds[] = (res.data.games || []).map(
          (game: UpcomingCFBGameOdds) => {
            const commence_time_local = new Date(
              game.commence_time
            ).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
            });
     

            // ✅ Ensure moneyline is valid
            const moneyline =
              game.moneyline &&
              Array.isArray(game.moneyline.outcomes) &&
              game.moneyline.outcomes.length > 0
                ? game.moneyline
                : null;
        
            return {
              ...game,
              commence_time_local,
              moneyline,
            };
          }
        );
   

     
        cache[key] = games;
        setData(games);
        setError(null);
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        setError(
          err.response?.data?.error || "Failed to fetch CFB upcoming odds"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelSource?.cancel("Component unmounted");
    };
  }, [timestamp, team1, team2]);

  return { data, loading, error };
};
