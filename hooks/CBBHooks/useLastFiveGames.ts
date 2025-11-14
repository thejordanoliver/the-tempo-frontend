import axios from "axios";
import { teams } from "constants/teamsCBB"; // adjust path if needed
import { useEffect, useMemo, useState } from "react";
import { CBBGame } from "types/types";

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
  opponentLogoLight?: any; // added light logo here
};

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_BASKETBALL_RAPIDAPI_HOST;

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
        code: t.code ?? "",
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
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5)
          .map((g) => {
            const isHome = g.teams.home.id === teamId;

            const homePoints = g.scores?.home?.total ?? 0; // use total points
            const awayPoints = g.scores?.away?.total ?? 0;

            const won =
              (isHome && homePoints > awayPoints) ||
              (!isHome && awayPoints > homePoints);

            const opponentId = isHome
              ? Number(g.teams.away.id)
              : Number(g.teams.home.id);
            const opponentCode = isHome ? g.teams.away.name : g.teams.home.name;

            const teamData = teamsMap.get(teamId);
            const opponentData = teamsMap.get(Number(opponentId));

            return {
              id: g.id,
              date: formatDate(g.date),
              homeTeam: g.teams.home.name,
              awayTeam: g.teams.away.name,
              homeScore: homePoints,
              awayScore: awayPoints,
              isHome,
              won,
              teamLogo: teamData?.logo || fallbackLogo,
              opponentId,
              opponent: opponentData?.code || opponentCode || "UNK",
              opponentLogo:
                opponentData?.logo || g.teams.away.logo || fallbackLogo,
              opponentLogoLight: opponentData?.logoLight,
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
  }, [teamId, teamsMap]);

  return { games, loading, error };
};
