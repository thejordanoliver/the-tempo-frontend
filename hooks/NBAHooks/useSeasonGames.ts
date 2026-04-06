import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Game } from "types/types";
import { apiClient } from "utils/apiClient";

export function useSeasonGames(season: string) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheRef = useRef<Map<string, Game[]>>(new Map());

  const normalizeGames = (rawGames: any[]): Game[] => {
    return rawGames.map((game) => {
      const home = game.teams?.home;
      const away = game.teams?.visitors;

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

  // New helper: sort so "In Play" first, then Scheduled, then Final
  const sortGamesByLive = (gamesArray: Game[]) => {
    return [...gamesArray].sort((a, b) => {
      const statusOrder: Record<string, number> = {
        "In Play": 0,
        Scheduled: 1,
        Final: 2,
      };

      const aStatus = statusOrder[a.status?.long] ?? 3;
      const bStatus = statusOrder[b.status?.long] ?? 3;

      if (aStatus !== bStatus) return aStatus - bStatus;

      // If same status, sort by date ascending
      return new Date(a.date).getTime() - new Date(b.date).getTime();
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

      const res = await apiClient.get(`api/games/nba/season/${season}`);
      const seasonGames = res.data?.games ?? [];

      const normalized = normalizeGames(seasonGames);

      // Sort live games first
      const sorted = sortGamesByLive(normalized);

      cacheRef.current.set(season, sorted);
      setGames(sorted);
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
