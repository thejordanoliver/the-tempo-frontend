import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { teams } from "constants/teamsNFL";
import { useEffect, useMemo, useState } from "react";

type ApiResponse = {
  teamId: string;
  results: number;
  response: any[];
};

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

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const useLastFiveGames = (teamId: number) => {
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fallbackLogo = require("assets/Placeholders/teamPlaceholder.png");

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });

  const teamsMap = useMemo(() => {
    const map = new Map<number, { logo: any; logoLight?: any; code: string }>();
    teams.forEach((t) =>
      map.set(Number(t.id), {
        logo: t.logo,
        logoLight: t.logoLight,
        code: t.code,
      })
    );
    return map;
  }, []);

  useEffect(() => {
    const fetchLastGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<ApiResponse>(
          `${BASE_URL}/api/gamesNFL/team/${teamId}/last-five`
        );

        const recentGames: GameResult[] = response.data.response.map((g) => {
          const isHome = g.teams.home.id === teamId;
          const homeScore = g.scores.home.total ?? 0;
          const awayScore = g.scores.away.total ?? 0;

          const won =
            (isHome && homeScore > awayScore) ||
            (!isHome && awayScore > homeScore);

          const opponentId = isHome ? g.teams.away.id : g.teams.home.id;

          const teamData = teamsMap.get(teamId);
          const opponentData = teamsMap.get(opponentId);

          return {
            id: g.game.id,
            date: formatDate(g.game.date.date),
            homeTeam: g.teams.home.name,
            awayTeam: g.teams.away.name,
            homeScore,
            awayScore,
            isHome,
            won,
            teamLogo: teamData?.logo || fallbackLogo,
            opponentId,
            opponent: opponentData?.code || "UNK",
            opponentLogo: opponentData?.logo || fallbackLogo,
            opponentLogoLight: opponentData?.logoLight,
          };
        });

        setGames(recentGames);

        await AsyncStorage.setItem(
          `lastFiveGames_${teamId}`,
          JSON.stringify({ timestamp: Date.now(), data: recentGames })
        );
      } catch (err) {
        console.error("Error fetching last five games", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) fetchLastGames();
  }, [teamId, teamsMap]);

  return { games, loading, error };
};
