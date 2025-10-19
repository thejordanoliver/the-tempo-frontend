import { useEffect, useRef, useState } from "react";
import axios from "axios";
import rateLimit from "axios-rate-limit";
import { teams } from "constants/teams";
import type { Game, APIGame } from "types/types";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "";

// Limit requests to avoid rate limiting
const http = rateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1000 });

export function useLastTeamGame(teamId: string | number) {
  const [lastGame, setLastGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple in-memory cache to avoid duplicate requests
  const cacheRef = useRef<Map<string | number, Game | null>>(new Map());

  const fetchLastGame = async () => {
    setLoading(true);
    setError(null);

    // Return cached game if available
    if (cacheRef.current.has(teamId)) {
      setLastGame(cacheRef.current.get(teamId)!);
      setLoading(false);
      return;
    }

    try {
      const res = await http.get<{ response: APIGame[] }>(`https://${RAPIDAPI_HOST}/games`, {
        params: { team: teamId, season: "2024" },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
      });

      const games = res.data.response;

      // Only keep finished games
      const completedGames = games.filter(
        (g) => g.status.long?.toLowerCase() === "finished"
      );

      if (!completedGames.length) {
        setLastGame(null);
        cacheRef.current.set(teamId, null);
        return;
      }

      // Sort descending by game date
      const sorted = completedGames.sort(
        (a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime()
      );

      const last = sorted[0];

      // Map to local team info
      const homeTeamLocal = teams.find((t) => t.id === String(last.teams.home.id));
      const awayTeamLocal = teams.find((t) => t.id === String(last.teams.visitors.id));

      if (!homeTeamLocal || !awayTeamLocal) throw new Error("Local team info missing");

      // Build enriched Game object
      const enrichedGame: Game = {
        id: last.id,
        date: last.date.start,
        time: new Date(last.date.start).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        status:
          last.status.long?.toLowerCase() === "finished"
            ? "Final"
            : "Scheduled",
        home: { ...homeTeamLocal },
        away: { ...awayTeamLocal },
        homeScore: last.scores.home.points ?? undefined,
        awayScore: last.scores.visitors.points ?? undefined,
        isPlayoff: false,
        stage: 1,
      };

      // Cache and set state
      cacheRef.current.set(teamId, enrichedGame);
      setLastGame(enrichedGame);
    } catch (err: any) {
      console.error("Error fetching last team game:", err);
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
