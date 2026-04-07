import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Game } from "types/football";

import { BASE_URL } from "utils/apiClient";

type UseMultipleFootballTeamGamesOptions = {
  season?: string | number;
  fetchAll?: boolean;
};

export function useMultipleFootballTeamGames(
  teamIds: (string | number)[],
  { season }: UseMultipleFootballTeamGamesOptions = {},
) {
  const [allGames, setAllGames] = useState<Record<string, Game[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable, sorted team IDs
  const stableTeamIds = useMemo(() => teamIds.map(String).sort(), [teamIds]);

  // Helper to normalize date for NFL or CFB
  const getGameDate = useCallback((g: any) => {
    if (!g?.game?.date) return null;
    if (typeof g.game.date === "string") return g.game.date; // NFL string date
    if (g.game.date?.utc) return g.game.date.utc; // CFB nested
    return null;
  }, []);

  // Fetch games for all teams
  const fetchGames = useCallback(async () => {
    if (!stableTeamIds.length || !season) {
      setAllGames({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result: Record<string, Game[]> = {};

      await Promise.all(
        stableTeamIds.map(async (teamId) => {
          try {
            const res = await axios.get(
              `${BASE_URL}/api/games/football/team/${teamId}/${season}`,
              { params: { season, teamId } },
            );

            // Normalize response: check multiple possible structures
            const rawGames: Game[] =
              res.data?.games || res.data?.response || res.data?.events || [];

            // Ensure each game has a proper date field
            result[teamId] = rawGames.map((g) => ({
              ...g,
              date: getGameDate(g) || new Date().toISOString(), // fallback to now
            }));
          } catch (teamErr: any) {
            console.error(`Failed to fetch games for team ${teamId}`, teamErr);
            result[teamId] = [];
          }
        }),
      );

      setAllGames(result);
    } catch (err: any) {
      console.error("Error fetching multiple Football team games:", err);
      setError("Failed to load Football games");
      setAllGames({});
    } finally {
      setLoading(false);
    }
  }, [stableTeamIds, season, getGameDate]);

  // Auto-fetch on mount / when team IDs or season change
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Manual refresh function
  const refreshGames = useCallback(async () => {
    await fetchGames();
  }, [fetchGames]);

  return { allGames, loading, error, refreshGames };
}
