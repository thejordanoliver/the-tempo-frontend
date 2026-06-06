import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";
import { getCBBSeason, getWNBASeason } from "utils/dateUtils";

// Leagues
const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";
const WNBA_LEAGUE = "13";

type GameResult = {
  id: number;
  date: string;
  isHome: boolean;
  won: boolean;
  home: {
    id: number;
    name: string;
  };
  homeScore: number;
  away: {
    id: number;
    name: string;
  };
  awayScore: number;
  opponent: {
    id: number;
    name: string;
  };
};

export const useLastFiveGames = (
  teamId: number,
  isWNBA = false,
  isWCBB = false,
) => {
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const season = isWNBA ? getWNBASeason() : getCBBSeason();
  const league = isWNBA
    ? WNBA_LEAGUE
    : isWCBB
      ? WOMEN_CBB_LEAGUE
      : MEN_CBB_LEAGUE;

  useEffect(() => {
    const fetchLastGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get(
          `api/games/basketball/last-five/${teamId}`,
          {
            params: {
              league,
              season,
            },
          },
        );

        setGames(res.data.games || []);
      } catch (err) {
        console.error("Error fetching last five games", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) fetchLastGames();
  }, [teamId, season, league, isWCBB, isWNBA]);

  return { games, loading, error };
};
