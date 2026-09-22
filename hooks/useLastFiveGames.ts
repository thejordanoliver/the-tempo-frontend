import { useEffect, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { apiClient } from "utils/apiClient";

export type LastFiveGamesSport =
  | "basketball"
  | "baseball"
  | "football"
  | "hockey"
  | "soccer";

export type LastFiveGameResult = {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  won: boolean;
  teamLogo: string | ImageSourcePropType | null;
  opponentId: number;
  opponent: string;
  opponentLogo: string | ImageSourcePropType | null;
  opponentLogoLight?: string | ImageSourcePropType | null;
};

export function useLastFiveGames(
  teamId: number,
  sport: LastFiveGamesSport,
  league: string,
) {
  const requestKey = teamId ? `${sport}:${league}:${teamId}` : null;
  const [result, setResult] = useState<{
    requestKey: string;
    games: LastFiveGameResult[];
    error: Error | null;
  } | null>(null);

  useEffect(() => {
    if (!requestKey) return;

    let cancelled = false;

    const fetchLastGames = async () => {
      try {
        const response = await apiClient.get(
          `api/games/${sport}/team/last-five/${league}/${teamId}`,
        );

        if (!cancelled) {
          setResult({ requestKey, games: response.data.games, error: null });
        }
      } catch (requestError: unknown) {
        if (cancelled) return;
        console.error("Error fetching last five games", requestError);
        setResult({
          requestKey,
          games: [],
          error:
            requestError instanceof Error
              ? requestError
              : new Error("Failed to fetch last five games"),
        });
      }
    };

    void fetchLastGames();

    return () => {
      cancelled = true;
    };
  }, [teamId, sport, league, requestKey]);

  const isCurrentResult = requestKey !== null && result?.requestKey === requestKey;
  const games = isCurrentResult ? result.games : [];
  const loading = requestKey !== null && !isCurrentResult;
  const error = isCurrentResult ? result.error : null;

  return { games, loading, error };
}
