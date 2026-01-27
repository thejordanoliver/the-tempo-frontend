import axios from "axios";
import { teams } from "constants/teamsCFB";
import { useCallback, useEffect, useState } from "react";
import { Game } from "types/cfb";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface UseCFBTeamGamesReturn {
  games: Game[];
  loading: boolean;
  error: string | null;
  season: string; // backend-determined season
  refreshGames: () => Promise<string>;
}

export function useCFBTeamGames(
  teamId: string | number,
  league = "2",
  fetchAll = false
): UseCFBTeamGamesReturn {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState<string>(""); // backend season

  // --- Fetch games ---
  const fetchGames = useCallback(async (): Promise<string> => {
    if (!teamId) return season;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/gamesCFB/team/${teamId}`, {
        params: { league, all: fetchAll ? 1 : 0, season },
      });

      const rawGames: Game[] = res.data.response || [];
      const backendSeason: string = res.data.season || "";

      const enrichedGames = rawGames.map((game) => {
        const homeTeam =
          teams.find((t) => t.id === Number(game.teams.home.id)) ||
          game.teams.home;
        const awayTeam =
          teams.find((t) => t.id === Number(game.teams.away.id)) ||
          game.teams.away;

        return {
          ...game,
          season: backendSeason,
          teams: {
            home: { ...game.teams.home, ...homeTeam },
            away: { ...game.teams.away, ...awayTeam },
          },
        };
      });

      setGames(enrichedGames);
      setSeason(backendSeason);
 
      // console.log(JSON.stringify(res.data.response, null, 2))
      return backendSeason; // ✅ backend season returned
    } catch (err: any) {
      console.error("Error fetching CFB team games:", err.message);
      setError("Failed to load team games");
      return season; // fallback to current state
    } finally {
      setLoading(false);
    }
  }, [teamId, league, fetchAll, season]);

  // --- Initial fetch ---
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // --- Refresh handler ---
  const refreshGames = useCallback<() => Promise<string>>(
    () => fetchGames(),
    [fetchGames]
  );

  return { games, loading, error, season, refreshGames };
}
