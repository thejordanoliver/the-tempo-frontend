import axios from "axios";
import { getNHLTeam } from "constants/teamsNHL";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { NHLGame } from "types/nhl";
import { apiClient } from "utils/apiClient";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export function useNHLSeasonGames(season: string | number) {
  const [games, setGames] = useState<NHLGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheRef = useRef<Map<string | number, NHLGame[]>>(new Map());

  /* ---------------------------------- */
  /* Normalize NHL Games               */
  /* ---------------------------------- */
  const normalizeGames = (rawGames: any[]): NHLGame[] => {
    return rawGames.map((game) => {
      const homeTeam = getNHLTeam(game.teams?.home?.id);
      const awayTeam = getNHLTeam(game.teams?.away?.id);

      const date = dayjs(game.date);

      return {
        ...game,
        date: date.toDate(),
        dateString: date.isValid() ? date.format("YYYY-MM-DD") : "",
        time: date.isValid() ? date.format("h:mm A") : "",
        home: homeTeam,
        away: awayTeam,
      };
    });
  };

  /* ---------------------------------- */
  /* Fetch + Cache                     */
  /* ---------------------------------- */
  const refreshGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use cache if available
      if (cacheRef.current.has(season)) {
        setGames(cacheRef.current.get(season)!);
        return;
      }

      const res = await apiClient.get(`api/games/nhl/season/${season}`);

      const seasonGames = Array.isArray(res.data) ? res.data : [];

      const normalized = normalizeGames(seasonGames);

      cacheRef.current.set(season, normalized);
      setGames(normalized);
    } catch (err: any) {
      console.error("[useNHLSeasonGames] error:", err);
      const message = err?.message || "Failed to load NHL games";
      setError(new Error(message));
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!season) return;
    refreshGames();
  }, [season]);

  return {
    games,
    loading,
    error,
    refreshGames,
  };
}
