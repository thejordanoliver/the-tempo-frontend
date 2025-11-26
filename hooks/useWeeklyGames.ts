import axios from "axios";
import rateLimit from "axios-rate-limit";
import { useEffect, useState, useMemo } from "react";
import { Game } from "types/types";
import { teams } from "../constants/teams";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_APISPORTS_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "";

// Rate-limited axios
const http = rateLimit(axios.create({}), {
  maxRequests: 2,
  perMilliseconds: 1000,
});

// 🕒 Convert UTC date string to Eastern Time
function convertToEastern(dateString: string): Date {
  const utcDate = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const parts = new Intl.DateTimeFormat("en-US", options)
    .formatToParts(utcDate)
    .reduce((acc: any, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return new Date(
    `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`
  );
}

export function useWeeklyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const dateStrings: string[] = Array.from({ length: 2 }).map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date.toISOString().split("T")[0];
      });

      const allGames: Game[] = [];

      for (const date of dateStrings) {
        const res = await http.get<{ response: any[] }>(
          `https://${RAPIDAPI_HOST}/games`,
          {
            params: { date },
            headers: {
              "X-RapidAPI-Key": RAPIDAPI_KEY,
              "X-RapidAPI-Host": RAPIDAPI_HOST,
            },
          }
        );

        const rawGames = res.data.response || [];

        const normalizedGames: Game[] = rawGames.map((game) => {
          const homeLocal = teams.find(
            (t) => String(t.id) === String(game.teams.home.id)
          );
          const awayLocal = teams.find(
            (t) => String(t.id) === String(game.teams.visitors.id)
          );

          const etDateObj = convertToEastern(game.date.start);
          const etDateString = etDateObj.toISOString();

          return {
            id: parseInt(game.id, 10),
            date: etDateString,
            time: etDateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: {
              short: game.status?.short ?? "",
              long: game.status?.long ?? "",
              clock: game.status?.clock ?? "0.0",
              halftime: game.status?.halftime,
            },
            statusText: game.status?.long ?? "",
            periods: game.periods ?? [],
            home: {
              id: String(game.teams.home.id),
              espnID: homeLocal?.espnID ?? "",
              name: homeLocal?.name ?? game.teams.home.name ?? "",
              logo: homeLocal?.logo ?? game.teams.home.logo ?? "",
            },
            away: {
              id: String(game.teams.visitors.id),
              espnID: awayLocal?.espnID ?? "",
              name: awayLocal?.name ?? game.teams.visitors.name ?? "",
              logo: awayLocal?.logo ?? game.teams.visitors.logo ?? "",
            },
            scores: {
              home: {
                points:
                  typeof game.scores?.home?.points === "number"
                    ? game.scores.home.points
                    : 0,
              },
              visitors: {
                points:
                  typeof game.scores?.visitors?.points === "number"
                    ? game.scores.visitors.points
                    : 0,
              },
            },
            year: etDateObj.getFullYear(),
            month: etDateObj.getMonth(),
          };
        });

        allGames.push(...normalizedGames);
      }

      setGames(allGames);
    } catch (err) {
      console.error("Error fetching weekly games:", err);
      setError("Failed to fetch games");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGames();
  }, []);

  // ✅ Live games first
  const isLiveGame = (game: Game) => game.status.long === "Live";

  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)));
  }, [games]);

  return { games: sortedGames, loading, error, refreshGames };
}
