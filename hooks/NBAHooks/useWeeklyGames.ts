import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Game } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useWeeklyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/games/nba/weekly`);

      setGames(res.data.games ?? []);
    } catch (err) {
      console.error("Error fetching weekly games:", err);
      setError("Failed to fetch games");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGames();
  }, []);

  // Live games first
  const sortedGames = useMemo(() => {
    return [...games].sort(
      (a, b) =>
        Number(b.status.long === "Live") - Number(a.status.long === "Live")
    );
  }, [games]);

  return { games: sortedGames, loading, error, refreshGames };
}
