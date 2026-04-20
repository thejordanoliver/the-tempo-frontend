import { useCallback, useEffect, useRef, useState } from "react";
import { MLBGame } from "types/baseball";
import { apiClient } from "utils/apiClient";
import { getMLBSeason } from "utils/dateUtils";

type RawGamesMap = Record<string, MLBGame | null>;
type UseLastTeamGameOptions = {
  teamIds: (string | number)[];
  season?: string;
};

export function useMultipleMLBTeamGames({
  teamIds,
  season = getMLBSeason(),
}: UseLastTeamGameOptions) {
  const [lastGames, setLastGames] = useState<RawGamesMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, MLBGame | null>>(new Map());

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
              `api/games/mlb/team/${teamId}/last`,
              { params: { season } },
            );

            // Backend returns { league, results, response }
            const game: MLBGame | null = res.data?.response ?? null;

            cacheRef.current.set(cacheKey, game);
            return [teamId, game] as const;
          } catch (teamErr) {
            console.error(
              `Failed to fetch MLB game for team ${teamId}`,
              teamErr,
            );
            return [teamId, null] as const;
          }
        }),
      );

      setLastGames(Object.fromEntries(results));
    } catch (err: any) {
      console.error("Error fetching MLB games:", err);
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
