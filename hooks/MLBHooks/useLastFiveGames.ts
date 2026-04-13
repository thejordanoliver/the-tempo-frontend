import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { getMLBSeason } from "utils/dateUtils";

type GameResult = {
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
  opponentLogoLight?: any;
};

import { apiClient } from "utils/apiClient";

export const useLastFiveGames = (teamId: number) => {
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLastGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(
          `api/games/mlb/last-five/${teamId}/${getMLBSeason()}`,
        );

        setGames(response.data.games);

        await AsyncStorage.setItem(
          `lastFiveGames_${teamId}`,
          JSON.stringify({
            timestamp: Date.now(),
            data: response.data.games,
          }),
        );
      } catch (err) {
        console.error("Error fetching last five games", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) fetchLastGames();
  }, [teamId]);
  return { games, loading, error };
};
