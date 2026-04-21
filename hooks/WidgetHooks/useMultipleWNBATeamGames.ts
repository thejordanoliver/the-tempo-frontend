import { useCallback, useEffect, useRef, useState } from "react";
import { BasketballGame } from "types/basketball";
import { apiClient } from "utils/apiClient";
import { getWNBASeason } from "utils/dateUtils";

type RawGamesMap = Record<string, BasketballGame | null>;
type UseLastTeamGameOptions = {
  teamIds: (string | number)[];
  season?: string;
};

export function useMultipleWNBATeamGames({
  teamIds,
  season = getWNBASeason(),
}: UseLastTeamGameOptions) {
  const [lastGames, setLastGames] = useState<RawGamesMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, BasketballGame | null>>(new Map());

  const teamIdsKey = teamIds.map(String).sort().join(",");

  const fetchLastGames = useCallback(async () => {
    const ids = teamIdsKey ? teamIdsKey.split(",") : [];
    if (!ids.length) return;

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        ids.map(async (teamId) => {
          const cacheKey = `${teamId}-${season}`;
          if (cacheRef.current.has(cacheKey)) {
            return [teamId, cacheRef.current.get(cacheKey) ?? null] as const;
          }

          try {
            const res = await apiClient.get(
              `api/games/wnba/team/${teamId}/last`,
              { params: { season } },
            );

            // Backend returns { league, results, response }
            const game: BasketballGame | null = res.data?.response ?? null;

            cacheRef.current.set(cacheKey, game);
            return [teamId, game] as const;
          } catch (teamErr) {
            console.error(
              `Failed to fetch WNBA game for team ${teamId}`,
              teamErr,
            );
            return [teamId, null] as const;
          }
        }),
      );

      setLastGames(Object.fromEntries(results));
    } catch (err: any) {
      console.error("Error fetching WNBA games:", err);
      setError(err.message || "Failed to fetch last games");
    } finally {
      setLoading(false);
    }
  }, [teamIdsKey, season]);

  useEffect(() => {
    fetchLastGames();
  }, [fetchLastGames]);

  return { lastGames, loading, error, refresh: fetchLastGames };
}
