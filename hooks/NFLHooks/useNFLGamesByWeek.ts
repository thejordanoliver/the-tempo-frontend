// hooks/NFLHooks/useNFLGamesByWeek.ts
import axios from "axios";
import { getTeamInfo } from "constants/teamsNFL";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { Game } from "types/nfl";
import { NFLWeekFromGames } from "utils/nflWeeks";

type UseNFLGamesByWeekParams = {
  selectedWeek: NFLWeekFromGames | null;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface UseNFLGamesByWeekReturn {
  games: Game[];
  loading: boolean;
  error: string | null;
  season: number | null;
  refresh: () => Promise<number | null>;
}

export const useNFLGamesByWeek = ({
  selectedWeek,
}: UseNFLGamesByWeekParams): UseNFLGamesByWeekReturn => {
  const [games, setGames] = useState<Game[]>([]);
  const [season, setSeason] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async (): Promise<number | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/gamesNFL`, {
        params: { league: 1 },
      });

      const allGames: Game[] = res.data?.response || [];
      const backendSeason: number =
        res.data?.response?.[0]?.game?.season ?? null;

      setSeason(backendSeason);

      // --- Filter by week ---
      let filteredGames = allGames;

      if (selectedWeek) {
        filteredGames = allGames.filter((g) => {
          if (!g?.game) return false;

          let gameWeek = g.game.week;
          const gameStage = g.game.stage;

          // Normalize preseason week labels
          if (
            gameStage === "Pre Season" &&
            gameWeek.toLowerCase().startsWith("week")
          ) {
            gameWeek = "Pre " + gameWeek;
          }

          return (
            gameStage === selectedWeek.stage &&
            gameWeek.toLowerCase() === selectedWeek.label.toLowerCase()
          );
        });
      }

      // --- Enrich home / away teams ---
      const enrichedGames = filteredGames.map((game) => {
        const homeTeam = getTeamInfo(game.teams.home.id);
        const awayTeam = getTeamInfo(game.teams.away.id);

        return {
          ...game,
          season: backendSeason,
          teams: {
            home: { ...game.teams.home, ...homeTeam },
            away: { ...game.teams.away, ...awayTeam },
          },
        };
      });

      // --- Sort by kickoff time ---
      enrichedGames.sort((a, b) => {
        const aTime = a.game.date?.timestamp
          ? dayjs.unix(a.game.date.timestamp).valueOf()
          : 0;
        const bTime = b.game.date?.timestamp
          ? dayjs.unix(b.game.date.timestamp).valueOf()
          : 0;
        return aTime - bTime;
      });

      setGames(enrichedGames);
      return backendSeason;
    } catch (err: any) {
      console.error("Error fetching NFL games by week:", err.message || err);
      setError("Failed to load games");
      return season;
    } finally {
      setLoading(false);
    }
  }, [selectedWeek, season]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refresh = useCallback(() => fetchGames(), [fetchGames]);

  return { games, season, loading, error, refresh };
};
