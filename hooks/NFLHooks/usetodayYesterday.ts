import axios from "axios";
import { teams } from "constants/teamsNFL";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Game } from "types/nfl";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function usetodayYesterday(season = "2025", league = "1") {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/gamesNFL/todayYesterday`, {
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
      console.error("Error fetching weekly games:", err.message);
      setError(err.message || "Failed to fetch weekly games");
    } finally {
      setLoading(false);
    }
  }, [season, league]);

  useEffect(() => {
    fetchWeeklyGames();
  }, [fetchWeeklyGames]);

  // ✅ Updated helper to detect live games
  const isLiveGame = (game: Game) => {
    const status = game.game?.status?.short ?? "";
    return ["Q1", "Q2", "Q3", "Q4", "OT", "HT"].includes(status);
  };

  // Sorted games with live games first
  const sortedGames = useMemo(() => {
    return [...games].sort(
      (a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a))
    );
  }, [games]);

  return { games: sortedGames, loading, error, refetch: fetchWeeklyGames };
}
