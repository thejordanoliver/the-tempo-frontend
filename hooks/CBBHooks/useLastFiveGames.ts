import axios from "axios";
import { useEffect, useState } from "react";
import { CBBGame } from "types/types";
import { getTeamInfo } from "constants/teamsCBB";

type ApiResponse = {
  response: CBBGame[];
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

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_BASKETBALL_RAPIDAPI_HOST;

export const useLastFiveGames = (teamId: number, isWomens = false) => {
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

  useEffect(() => {
    const fetchLastGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<ApiResponse>(
          `https://${RAPIDAPI_HOST}/games`,
          {
            params: { team: teamId, season: "2025-2026" },
            headers: {
              "X-RapidAPI-Key": RAPIDAPI_KEY,
              "X-RapidAPI-Host": RAPIDAPI_HOST,
            },
          }
        );

        const recentGames = response.data.response
          .filter((g) => g.status.long === "Game Finished")
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5)
          .map((g) => {
            const isHome = g.teams.home.id === teamId;
            const homePoints = g.scores?.home?.total ?? 0;
            const awayPoints = g.scores?.away?.total ?? 0;

            const won =
              (isHome && homePoints > awayPoints) ||
              (!isHome && awayPoints > homePoints);

            const opponentTeam = isHome ? g.teams.away : g.teams.home;

            // Resolve team + opponent via getTeamInfo
            const teamInfo = getTeamInfo(teamId, isWomens);
            const opponentInfo = getTeamInfo(opponentTeam.id, isWomens);

            return {
              id: g.id,
              date: formatDate(g.date),
              homeTeam: g.teams.home.name,
              awayTeam: g.teams.away.name,
              homeScore: homePoints,
              awayScore: awayPoints,
              isHome,
              won,
              teamLogo:
                isWomens
                  ? teamInfo?.wLogo ?? teamInfo?.logo ?? fallbackLogo
                  : teamInfo?.logo ?? fallbackLogo,
              opponentId: opponentTeam.id,
              opponent: opponentInfo?.code ?? opponentTeam.name ?? "UNK",
              opponentLogo:
                isWomens
                  ? opponentInfo?.wLogo ?? opponentInfo?.logo ?? fallbackLogo
                  : opponentInfo?.logo ?? fallbackLogo,
              opponentLogoLight:
                isWomens
                  ? opponentInfo?.wLogo ?? opponentInfo?.logoLight
                  : opponentInfo?.logoLight,
            };
          });

        setGames(recentGames);
      } catch (err) {
        console.error("Error fetching last games", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) fetchLastGames();
  }, [teamId, isWomens]);

  return { games, loading, error };
};
