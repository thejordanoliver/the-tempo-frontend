import axios from "axios";
import { useEffect, useState } from "react";
import { getNBASeason } from "utils/dateUtils";

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

const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const useLastFiveGames = (teamId: number) => {
  const [games, setGames] = useState<LastFiveGamesResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLastGames = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_URL}/api/games/nba/last-five/${teamId}/${getNBASeason()}`,
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
