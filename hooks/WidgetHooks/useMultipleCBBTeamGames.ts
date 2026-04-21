import { useCallback, useEffect, useRef, useState } from "react";
import { BasketballGame } from "types/basketball";
import { apiClient } from "utils/apiClient";
import { getCBBSeason } from "utils/dateUtils";

type RawGamesMap = Record<string, BasketballGame | null>;
type UseLastTeamGameOptions = {
  teamIds: (string | number)[];
  season?: string;
  isWomen?: boolean;
};

const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";

export function useMultipleCBBTeamGames({
  teamIds,
  season = getCBBSeason(),
  isWomen = false,
}: UseLastTeamGameOptions) {
  const [lastGames, setLastGames] = useState<RawGamesMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;
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
          const cacheKey = `${teamId}-${season}-${league}`;
          if (cacheRef.current.has(cacheKey)) {
            return [teamId, cacheRef.current.get(cacheKey) ?? null] as const;
          }

          try {
            const res = await apiClient.get(
              `api/games/cbb/team/${teamId}/last`,
              { params: { season, league } },
            );

            // Backend returns { league, results, response }
            const game: BasketballGame | null =
              res.data?.results > 0 ? res.data.response : null;

            cacheRef.current.set(cacheKey, game);
            return [teamId, game] as const;
          } catch (teamErr) {
            console.error(
              `Failed to fetch CBB game for team ${teamId}`,
              teamErr,
            );
            return [teamId, null] as const;
          }
        }),
      );

      setLastGames(Object.fromEntries(results));
    } catch (err: any) {
      console.error("Error fetching CBB games:", err);
      setError(err.message || "Failed to fetch last games");
    } finally {
      setLoading(false);
    }
  }, [teamIdsKey, season, league]);

  useEffect(() => {
    fetchLastGames();
  }, [fetchLastGames]);

  return { lastGames, loading, error, refresh: fetchLastGames };
}
