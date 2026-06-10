import { BaseballGame } from "@/types/baseball";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

type League = "mlb" | "cb" | "sb";

type RawGamesMap = Record<string, BaseballGame | null>;

type UseBaseballTeamGamesOptions = {
  teamIds: (string | number)[];
  league?: League;
};

type LastBaseballTeamGameResponse = {
  success?: boolean;
  league?: string;
  count?: number;
  results?: number;
  game?: BaseballGame | null;
  games?: BaseballGame[];
  response?: BaseballGame | BaseballGame[] | null;
};

const LIVE_STATES = new Set(["in", "live", "half"]);

function isLiveBaseballGame(game: BaseballGame | null | undefined) {
  const status = game?.status as any;

  const state = String(status?.state || "").toLowerCase();
  const description = String(status?.description || "").toLowerCase();
  const detail = String(status?.detail || "").toLowerCase();
  const shortDetail = String(status?.shortDetail || "").toLowerCase();

  return (
    LIVE_STATES.has(state) ||
    description.includes("in progress") ||
    detail.includes("in progress") ||
    shortDetail.includes("in progress") ||
    detail.includes("top") ||
    detail.includes("bottom") ||
    shortDetail.includes("top") ||
    shortDetail.includes("bottom")
  );
}

function pickBestGame(games: BaseballGame[]) {
  if (!games.length) return null;

  const liveGame = games.find((game) => isLiveBaseballGame(game));
  return liveGame ?? games[0];
}

function normalizeBaseballGameResponse(
  data: LastBaseballTeamGameResponse,
): BaseballGame | null {
  /**
   * Your backend response:
   * {
   *   success: true,
   *   count: 1,
   *   game: {...}
   * }
   */
  if (data.game) {
    return data.game;
  }

  if (Array.isArray(data.games)) {
    return pickBestGame(data.games);
  }

  /**
   * Older/alternate API shape:
   * {
   *   response: [...]
   * }
   */
  if (Array.isArray(data.response)) {
    return pickBestGame(data.response);
  }

  if (data.response) {
    return data.response;
  }

  return null;
}

export function useMultipleBaseballTeamGames({
  teamIds,
  league = "mlb",
}: UseBaseballTeamGamesOptions) {
  const [lastGames, setLastGames] = useState<RawGamesMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, BaseballGame | null>>(new Map());

  const teamIdsKey = useMemo(() => {
    return Array.from(new Set(teamIds.map(String).filter(Boolean)))
      .sort()
      .join(",");
  }, [teamIds]);

  const fetchLastGames = useCallback(
    async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
      const ids = teamIdsKey ? teamIdsKey.split(",") : [];

      if (!ids.length) {
        setLastGames({});
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all(
          ids.map(async (teamId: string) => {
            const cacheKey = `${league}-${teamId}`;

            if (!forceRefresh && cacheRef.current.has(cacheKey)) {
              return [teamId, cacheRef.current.get(cacheKey) ?? null] as const;
            }

            try {
              const res = await apiClient.get<LastBaseballTeamGameResponse>(
                `api/games/baseball/team/last/${league}/${teamId}`,
              );

              if (res.data?.success === false) {
                throw new Error(
                  `Failed to fetch ${league.toUpperCase()} last game for team ${teamId}`,
                );
              }

              const game = normalizeBaseballGameResponse(res.data);

              cacheRef.current.set(cacheKey, game);

              return [teamId, game] as const;
            } catch (teamErr) {
              console.error(
                `Failed to fetch ${league.toUpperCase()} last game for team ${teamId}`,
                teamErr,
              );

              return [teamId, null] as const;
            }
          }),
        );

        setLastGames(Object.fromEntries(results));
      } catch (err: any) {
        console.error(`Error fetching ${league.toUpperCase()} team games:`, err);
        setError(err?.message || "Failed to fetch last games");
      } finally {
        setLoading(false);
      }
    },
    [teamIdsKey, league],
  );

  useEffect(() => {
    fetchLastGames();
  }, [fetchLastGames]);

  const refresh = useCallback(() => {
    fetchLastGames({ forceRefresh: true });
  }, [fetchLastGames]);

  return {
    lastGames,
    loading,
    error,
    refresh,
  };
}

export default useMultipleBaseballTeamGames;