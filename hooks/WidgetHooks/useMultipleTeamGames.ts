import { useEffect, useRef, useState } from "react";
import { Game } from "types/nba";
import { apiClient } from "utils/apiClient";

type RawGamesMap = Record<string, Game | null>; // now typed

export function useMultipleTeamGames(
  teamIds: (string | number)[],
  season: string | number,
) {
  const [lastGames, setLastGames] = useState<RawGamesMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // cache for each team-season combination
  const cacheRef = useRef<Map<string, Game | null>>(new Map());

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

          const res = await apiClient.get<{ game?: Game }>(
            `api/games/nba/last/${teamId}/${season}`,
          );

          const game: Game | null = res.data?.game ?? null;

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
