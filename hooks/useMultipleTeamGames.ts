import axios from "axios";
import rateLimit from "axios-rate-limit";
import { useEffect, useState } from "react";
import { teams } from "../constants/teams";
import { GameWithStatusText } from "./useTeamGames"; // import the type

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_APISPORTS_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "";

// Rate-limited axios instance
const http = rateLimit(axios.create({}), {
  maxRequests: 2,
  perMilliseconds: 1000,
});

export function useMultipleTeamGames(teamIds: string[]) {
  const [allGames, setAllGames] = useState<
    Record<string, GameWithStatusText[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamIds || teamIds.length === 0) return;

    const fetchGamesForTeams = async () => {
      setLoading(true);
      setError(null);

      try {
        const combined: Record<string, GameWithStatusText[]> = {};

        await Promise.all(
          teamIds.map(async (teamId) => {
            const res = await http.get<{ response: any[] }>(
              `https://${RAPIDAPI_HOST}/games`,
              {
                params: { team: teamId, season: "2025", league: "standard" },
                headers: {
                  "X-RapidAPI-Key": RAPIDAPI_KEY,
                  "X-RapidAPI-Host": RAPIDAPI_HOST,
                },
              }
            );

            const rawGames = res.data.response || [];

            const normalizedGames = (game: any): GameWithStatusText => {
              const homeLocal = teams.find(
                (t) => String(t.id) === String(game.teams.home.id)
              );
              const awayLocal = teams.find(
                (t) => String(t.id) === String(game.teams.visitors.id)
              );
              const gameDate = new Date(game.date.start);
              const statusText = mapStatus(game.status);

              return {
                id: parseInt(game.id, 10),
                date: game.date.start,
                time: gameDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                status: game.status,
                statusText,
                periods: game.periods ?? [],
                home: {
                  id: game.teams.home.id,
                  espnID: homeLocal?.espnID ?? "",
                  name: homeLocal?.name ?? game.teams.home.name ?? "",
                  code: homeLocal?.code ?? game.teams.homeLocal.code ?? "",
                  logo: homeLocal?.logo ?? game.teams.home.logo ?? "",
                  logoLight: homeLocal?.logoLight ?? homeLocal?.logo ?? "",
                },
                away: {
                  id: game.teams.visitors.id,
                  espnID: awayLocal?.espnID ?? "",
                  name: awayLocal?.name ?? game.teams.visitors.name ?? "",
                  code: awayLocal?.code ?? game.teams.visitors.code ?? "",
                  logo: awayLocal?.logo ?? game.teams.visitors.logo ?? "",
                  logoLight: awayLocal?.logoLight ?? awayLocal?.logo ?? "",
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
                year: gameDate.getFullYear(),
                month: gameDate.getMonth(),
              };
            };

            // ✅ Map raw games to array
            combined[teamId] = rawGames.map(normalizedGames);
          })
        );

        setAllGames(combined);
      } catch (err: any) {
        console.error("Error fetching multiple team games:", err);
        setError(err.message || "Failed to fetch team games");
        setAllGames({});
      } finally {
        setLoading(false);
      }
    };

    fetchGamesForTeams();
  }, [teamIds]);

  return { allGames, loading, error };
}

/* ---------- Helper to map API status ---------- */
function mapStatus(apiStatus: {
  short: number | string;
  long?: string;
}): string {
  const long = apiStatus.long?.toLowerCase();
  if (long === "in play") return "In Play";
  if (long === "finished") return "Final";
  if (long === "scheduled") return "Scheduled";
  if (long === "canceled") return "Canceled";
  if (long === "delayed") return "Delayed";
  if (long === "postponed") return "Postponed";

  const short = Number(apiStatus.short);
  switch (short) {
    case 1:
      return "Scheduled";
    case 2:
    case 3:
      return "Final";
    case 4:
      return "Postponed";
    case 5:
      return "Delayed";
    case 6:
      return "Canceled";
    default:
      return "Scheduled";
  }
}
