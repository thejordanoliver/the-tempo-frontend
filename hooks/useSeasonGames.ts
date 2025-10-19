import { APIGame } from "types/types";
import axios from "axios";
import rateLimit from "axios-rate-limit";
import { useEffect, useRef, useState } from "react";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "";

if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
  console.warn("RapidAPI credentials are missing. Ensure they're set in .env");
}

const http = rateLimit(axios.create({}), {
  maxRequests: 2,
  perMilliseconds: 1000,
});

export function useSeasonGames(season: string) {
  const [games, setGames] = useState<APIGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, APIGame[]>>(new Map());

  const refreshGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Return cached games if available
      if (cacheRef.current.has(season)) {
        setGames(cacheRef.current.get(season)!);
        return;
      }

      // Fetch games directly from API
      const res = await http.get<{ response: APIGame[] }>(
        `https://${RAPIDAPI_HOST}/games`,
        {
          params: { season, league: "standard" },
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST,
          },
        }
      );

      const seasonGames = res.data.response;

console.log(res.data.response)

      cacheRef.current.set(season, seasonGames);
      setGames(seasonGames);
    } catch (err: any) {
      console.error("Error fetching season games:", err);
      setError(err.message || "Failed to fetch games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGames();
  }, [season]);

  return { games, loading, error, refreshGames };
}
