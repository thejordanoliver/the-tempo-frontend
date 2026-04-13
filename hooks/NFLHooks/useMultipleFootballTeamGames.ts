import { useEffect, useRef, useState } from "react";
import { FootballGame } from "types/football";
import { apiClient } from "utils/apiClient";

type RawGamesMap = Record<string, FootballGame | null>; // now typed

export function useMultipleFootballTeamGames(
  teamIds: (string | number)[],
  season: string | number,
) {
  const [lastGames, setLastGames] = useState<RawGamesMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // cache for each team-season combination
  const cacheRef = useRef<Map<string, FootballGame | null>>(new Map());

  const fetchLastGames = async () => {
    if (!teamIds || teamIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        teamIds.map(async (teamId) => {
          const cacheKey = `${teamId}-${season}`;

          const cached = cacheRef.current.get(cacheKey);
          if (cached !== undefined) {
            return [teamId, cached ?? null] as const; // <-- ensure null instead of undefined
          }

          const res = await apiClient.get<{ game?: FootballGame }>(
            `api/games/football/last/${teamId}/${season}`,
          );

          const game: FootballGame | null = res.data?.game ?? null;

          cacheRef.current.set(cacheKey, game);
          return [teamId, game] as const;
        }),
      );

      setLastGames(Object.fromEntries(results));
    } catch (err: any) {
      console.error("Error fetching last team games:", err);
      setError(err.message || "Failed to fetch last games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teamIds || teamIds.length === 0) return;
    fetchLastGames();
  }, [teamIds, season]);

  return { lastGames, loading, error, refresh: fetchLastGames };
}
