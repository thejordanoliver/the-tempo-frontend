import axios from "axios";
import rateLimit from "axios-rate-limit";
import { teams } from "constants/teamsNFL";
import { useEffect, useRef, useState } from "react";
import type { NFLGame, NFLTeam } from "types/nfl";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_FOOTBALL_RAPIDAPI_HOST || "";

const http = rateLimit(axios.create(), {
  maxRequests: 2,
  perMilliseconds: 1000,
});

export function useLastTeamGame(teamId: string | number) {
  const [lastGame, setLastGame] = useState<NFLGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string | number, NFLGame | null>>(new Map());

  const fetchLastGame = async () => {
    setLoading(true);
    setError(null);

    if (cacheRef.current.has(teamId)) {
      setLastGame(cacheRef.current.get(teamId)!);
      setLoading(false);
      return;
    }

    try {
      const res = await http.get<{ response: any[] }>(`https://${RAPIDAPI_HOST}/games`, {
        params: { team: teamId, season: "2025" },
        headers: { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": RAPIDAPI_HOST },
      });

      const games = res.data.response;

      const completedGames = games.filter(
        (g) => g.status?.long?.toLowerCase() === "finished"
      );

      if (!completedGames.length) {
        cacheRef.current.set(teamId, null);
        setLastGame(null);
        setLoading(false);
        return;
      }

      const sorted = completedGames.sort(
        (a, b) => new Date(b.date?.start).getTime() - new Date(a.date?.start).getTime()
      );

      const last = sorted[0];

      // Map local teams and fill required fields
      const homeTeam: NFLTeam = {
        ...teams.find((t) => t.id === String(last.teams.home.id))!,
        oddsID: "",
        city: last.teams.home.city ?? "",
        venue: last.teams.home.venue ?? "",
        established: last.teams.home.established ?? 0,
        country: { name: "USA", code: "US", flag: "🇺🇸" }, // match type
      };

      const awayTeam: NFLTeam = {
        ...teams.find((t) => t.id === String(last.teams.away.id))!,
        oddsID: "",
        city: last.teams.away.city ?? "",
        venue: last.teams.away.venue ?? "",
        established: last.teams.away.established ?? 0,
        country: { name: "USA", code: "US", flag: "🇺🇸" },
      };

      const enrichedGame: NFLGame = {
        game: {
          id: String(last.id),
          date: { timestamp: new Date(last.date.start).getTime() },
          status: {
            long: last.status.long ?? "",
            short: last.status.short ?? "",
            timer: last.status.clock ?? undefined,
          },
          venue: last.venue
            ? { name: last.venue.name ?? "", city: last.venue.city ?? "" }
            : undefined,
        },
        teams: { home: homeTeam, away: awayTeam },
        scores: { home: last.scores.home ?? {}, away: last.scores.away ?? {} },
      };
console.log(games)
      cacheRef.current.set(teamId, enrichedGame);
      setLastGame(enrichedGame);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch last game");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teamId) return;
    fetchLastGame();
  }, [teamId]);

  return { lastGame, loading, error, refresh: fetchLastGame };
}
