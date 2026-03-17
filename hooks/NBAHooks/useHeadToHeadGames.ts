import { useState, useEffect } from "react";
import axios from "axios";
import { Game } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export interface HeadToHead {
  success: boolean;
  series: Record<string, number> & { totalGames: number };
  games: Game[];
}

export function useHeadToHeadGames(
  team1: number,
  team2: number,
  season: number
) {
  const [data, setData] = useState<HeadToHead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!team1 || !team2 || !season) return;

    setLoading(true);
    setError(null);

    const fetchGames = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/games/nba/matchups/${team1}/${team2}/${season}`
        );

        // Return the raw API object
        setData(res.data);
      } catch (err: unknown) {
        console.error("Error fetching head-to-head games:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [team1, team2, season]);

  return { data, loading, error };
}