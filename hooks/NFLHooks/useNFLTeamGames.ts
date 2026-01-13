import { Game } from "types/nfl";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { teams } from "constants/teamsNFL";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useNFLTeamGames(
  teamId: string | number,
  season = "2025",
  league = "1",
  fetchAll = false
) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/gamesNFL/team/${teamId}`, {
        params: { season, league, all: fetchAll ? 1 : 0 },
      });

      const rawGames: Game[] = res.data.response || [];

      // Map each game to include full team info
      const enrichedGames = rawGames.map((game) => {
        const homeTeam = teams.find((t) => t.id === Number(game.teams.home.id)) || game.teams.home;
        const awayTeam = teams.find((t) => t.id === Number(game.teams.away.id)) || game.teams.away;

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
      console.error("Error fetching NFL team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, season, league, fetchAll]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refreshGames = useCallback(() => fetchGames(), [fetchGames]);

  return { games, loading, error, refreshGames };
}
