import axios from "axios";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { getTeamInfo } from "constants/teams";
import { Game } from "types/types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export function useSeasonGames(season: string) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheRef = useRef<Map<string, Game[]>>(new Map());

  const normalizeGames = (rawGames: any[]): Game[] => {
    return rawGames.map((game) => {
      const home = getTeamInfo(game.teams?.home.id);
      const away = getTeamInfo(game.teams?.visitors.id);

      const rawDate = game.date?.start ?? game.date;
      const date = dayjs(rawDate);

      return {
        ...game,
        date: date.toDate(),
        dateString: date.format("YYYY-MM-DD"),
        time: date.format("h:mm A"),
        home,
        away,
      };
    });
  };

  const refreshGames = async () => {
    try {
      setLoading(true);
      setError(null);

      if (cacheRef.current.has(season)) {
        setGames(cacheRef.current.get(season)!);
        return;
      }

      const res = await axios.get(`${API_BASE}/api/games/nba/season/${season}`);
      const seasonGames = res.data?.games ?? [];

      const normalized = normalizeGames(seasonGames);

      cacheRef.current.set(season, normalized);
      setGames(normalized);
    } catch (err: any) {
      console.error("[useSeasonGames] error:", err);
      const message = err?.message || "Failed to load season games";
      setError(new Error(message));
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGames();
  }, [season]);

  return { games, loading, error, refreshGames };
}
