import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";
import { getFootballSeason } from "utils/dateUtils";

export type LastFiveGamesResult = {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  won: boolean;
  teamLogo: any;
  opponentId: number;
  opponent: string;
  opponentLogo: any;
  opponentLogoLight?: any; // added light logo here
};

export const useLastFiveGames = (teamId: number) => {
  const [games, setGames] = useState<LastFiveGamesResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const season = getFootballSeason();
  useEffect(() => {
    const fetchLastGames = async () => {
      try {
        setLoading(true);

        const res = await apiClient.get(
          `api/games/football/last-five/${teamId}/${season}`,
        );

        setGames(res.data.games);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) fetchLastGames();
  }, [teamId]);

  return { games, loading, error };
};
