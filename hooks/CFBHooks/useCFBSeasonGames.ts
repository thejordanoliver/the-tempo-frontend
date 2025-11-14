// hooks/CFBHooks/useCFBSeasonGames.ts
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import type { Game } from "types/cfb";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useCFBSeasonGames(season = "2025", league = "2") {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeasonGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/gamesCFB`, {
        params: { season, league },
      });

      const apiGames = res.data.response || [];

      const normalized: Game[] = apiGames.map((g: any) => ({
        game: {
          id: Number(g.game?.id),
          stage: g.game?.stage ?? "regular",
          week: g.game?.week ?? "1",
          date: {
            timezone: g.game?.date?.timezone ?? "UTC",
            date: g.game?.date?.date ?? "",
            time: g.game?.date?.time ?? "",
            timestamp: g.game?.date?.timestamp ?? 0,
          },
          venue: g.game?.venue || { name: "Unknown", city: "Unknown" },
          status: {
            short: g.game?.status?.short ?? "",
            long: g.game?.status?.long ?? "",
            timer: g.game?.status?.timer ?? null,
          },
        },
        league: {
          id: Number(g.league?.id ?? 0),
          name: g.league?.name ?? "CFB",
          season: g.league?.season ?? season,
          logo: g.league?.logo ?? "",
        },
        teams: g.teams,
        scores: g.scores,
      }));

      setGames(normalized);
    } catch (err: any) {
      console.error("Error fetching CFB season games:", err.message);
      setError(err.message || "Failed to fetch CFB season games");
    } finally {
      setLoading(false);
    }
  }, [season, league]);

  useEffect(() => {
    fetchSeasonGames();
  }, [fetchSeasonGames]);

  return { games, loading, error, refetch: fetchSeasonGames };
}
