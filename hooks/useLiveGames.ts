import axiosOriginal from "axios";
import rateLimitOriginal from "axios-rate-limit";
import { useEffect, useState } from "react";
import { Game } from "types/types";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "";

const axiosInstance = axiosOriginal.create({});
const http = rateLimitOriginal(axiosInstance, {
  maxRequests: 2,
  perMilliseconds: 1000,
});

const fetchTeamNicknames = async (): Promise<Record<number, string>> => {
  const res = await http.get<{ response: { id: number; nickname: string }[] }>(
    `https://${RAPIDAPI_HOST}/teams`,
    {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    }
  );

  const map: Record<number, string> = {};
  res.data.response.forEach((team) => {
    map[team.id] = team.nickname;
  });

  return map;
};

const fetchTeamStandings = async (): Promise<
  Record<number, { wins: number; losses: number }>
> => {
  const seasonYear = new Date().getFullYear();
  const res = await http.get<{ response: any[] }>(
    `https://${RAPIDAPI_HOST}/standings`,
    {
      params: { season: seasonYear },
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    }
  );

  const standingsMap: Record<number, { wins: number; losses: number }> = {};
  res.data.response.forEach((team) => {
    if (team.team?.id && team.win && team.loss) {
      standingsMap[team.team.id] = {
        wins: team.win.total,
        losses: team.loss.total,
      };
    }
  });

  return standingsMap;
};

export function useLiveGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teamMap, standingsMap] = await Promise.all([
        fetchTeamNicknames(),
        fetchTeamStandings(),
      ]);

      const res = await http.get<{ response: Game[] }>(
        `https://${RAPIDAPI_HOST}/games`,
        {
          params: { live: "all" },
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST,
          },
        }
      );

      const liveGames = res.data.response.map((game) => {
        if (game.home && game.away) {
          const homeId = Number(game.home.id);
          const awayId = Number(game.away.id);

          game.home.name = teamMap[homeId] || game.home.name;
          game.away.name = teamMap[awayId] || game.away.name;
        }

        return game;
      });

      setGames(liveGames);
    } catch (err) {
      console.error("Error fetching live games:", err);
      setError("Failed to fetch live games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGames();
    const interval = setInterval(refreshGames, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return { games, loading, error, refreshGames };
}
