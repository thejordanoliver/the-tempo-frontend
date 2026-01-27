// hooks/NFLHooks/useNFLSeasonGames.ts
import axios from "axios";
import { teams } from "constants/teamsNFL";
import { useCallback, useEffect, useState } from "react";
import { Game } from "types/nfl";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useNFLSeasonGames(season = "2025", league = "1") {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeasonGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/gamesNFL`, {
        params: { season, league },
      });

      const rawGames: Game[] = res.data.response || [];

      // Map each game to include full team info
      const enrichedGames = rawGames.map((game) => {
        const homeTeam =
          teams.find((t) => t.id === Number(game.teams.home.id)) ||
          game.teams.home;
        const awayTeam =
          teams.find((t) => t.id === Number(game.teams.away.id)) ||
          game.teams.away;

        return {
          ...game,
          teams: {
            home: { ...game.teams.home, ...homeTeam },
            away: { ...game.teams.away, ...awayTeam },
          },
        };
      });

      setGames(enrichedGames);
    } catch (err: any) {
      console.error("Error fetching NFL season games:", err.message);
      setError(err.message || "Failed to fetch NFL season games");
    } finally {
      setLoading(false);
    }
  }, [season, league]);

  useEffect(() => {
    fetchSeasonGames();
  }, [fetchSeasonGames]);

  return { games, loading, error, refetch: fetchSeasonGames };
}
