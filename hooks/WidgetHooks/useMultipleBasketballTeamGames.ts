import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BasketballGame } from "types/basketball";
import { apiClient } from "utils/apiClient";

type League = "nba" | "cbb" | "wcbb" | "wnba" | "summervegas" | "summerutah";

type RawGamesMap = Record<string, BasketballGame | null>;

type UseBasketballTeamGamesOptions = {
  teamIds: (string | number)[];
  league?: League;
};

type FetchLastGamesOptions = {
  forceRefresh?: boolean;
};

const LIVE_STATES = new Set(["in", "half"]);

function isLiveBasketballGame(game: BasketballGame | null | undefined) {
  const status = game?.status as any;

  const state = String(status?.state || "").toLowerCase();
  const description = String(status?.description || "").toLowerCase();
  const detail = String(status?.detail || "").toLowerCase();
  const shortDetail = String(status?.shortDetail || "").toLowerCase();

  return (
    LIVE_STATES.has(state) ||
    description.includes("in progress") ||
    detail.includes("in progress") ||
    shortDetail.includes("in progress")
  );
}

function isBasketballGameLike(value: unknown): value is BasketballGame {
  if (!value || typeof value !== "object") return false;

  const game = value as Record<string, unknown>;

  return Boolean(
    game.id ??
      game.uid ??
      game.name ??
      game.shortName ??
      game.date ??
      game.startDate ??
      game.status,
  );
}

function getGameTimestamp(game: BasketballGame) {
  const rawDate =
    (game as any).date ??
    (game as any).startDate ??
    (game as any).timestamp ??
    null;

  if (!rawDate) return 0;

  const timestamp =
    typeof rawDate === "number" ? rawDate : new Date(rawDate).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function extractBasketballGames(
  data: unknown,
  seen = new WeakSet<object>(),
): BasketballGame[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.flatMap((item) => extractBasketballGames(item, seen));
  }

  if (typeof data !== "object") return [];

  if (seen.has(data)) return [];
  seen.add(data);

  const object = data as Record<string, unknown>;

  const nestedValues = [
    object.response,
    object.games,
    object.game,
    object.lastGame,
    object.event,
    object.events,
    object.data,
  ];

  for (const value of nestedValues) {
    const games = extractBasketballGames(value, seen);

    if (games.length) {
      return games;
    }
  }

  if (isBasketballGameLike(object)) {
    return [object as BasketballGame];
  }

  return [];
}

function normalizeBasketballGameResponse(data: unknown): BasketballGame | null {
  const games = extractBasketballGames(data);

  if (!games.length) return null;

  const sortedGames = [...games].sort(
    (a, b) => getGameTimestamp(b) - getGameTimestamp(a),
  );

  const liveGame = sortedGames.find((game) => isLiveBasketballGame(game));

  return liveGame ?? sortedGames[0] ?? null;
}

function normalizeTeamIds(teamIds: (string | number)[]) {
  return Array.from(
    new Set(
      teamIds
        .map((teamId) => String(teamId ?? "").trim())
        .filter(Boolean),
    ),
  );
}

export function useMultipleBasketballTeamGames({
  teamIds,
  league = "nba",
}: UseBasketballTeamGamesOptions) {
  const [lastGames, setLastGames] = useState<RawGamesMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, BasketballGame | null>>(new Map());
  const requestIdRef = useRef(0);

  const teamIdsKey = useMemo(() => {
    return normalizeTeamIds(teamIds).sort().join(",");
  }, [teamIds]);

  const fetchLastGames = useCallback(
    async ({ forceRefresh = false }: FetchLastGamesOptions = {}) => {
      const ids = teamIdsKey ? teamIdsKey.split(",") : [];
      const requestId = requestIdRef.current + 1;

      requestIdRef.current = requestId;

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
          ids.map(async (teamId) => {
            const cacheKey = `${league}-${teamId}`;

            if (!forceRefresh && cacheRef.current.has(cacheKey)) {
              return [teamId, cacheRef.current.get(cacheKey) ?? null] as const;
            }

            try {
              const res = await apiClient.get(
                `/api/games/basketball/team/last/${league}/${teamId}`,
              );

              const game = normalizeBasketballGameResponse(res.data);

              cacheRef.current.set(cacheKey, game);

              return [teamId, game] as const;
            } catch (teamErr) {
              console.error(
                `Failed to fetch ${league.toUpperCase()} last game for team ${teamId}`,
                teamErr,
              );

              cacheRef.current.set(cacheKey, null);

              return [teamId, null] as const;
            }
          }),
        );

        if (requestIdRef.current !== requestId) return;

        setLastGames(Object.fromEntries(results));
      } catch (err: any) {
        if (requestIdRef.current !== requestId) return;

        console.error(`Error fetching ${league.toUpperCase()} team games:`, err);
        setError(err?.message || "Failed to fetch last games");
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [teamIdsKey, league],
  );

  useEffect(() => {
    fetchLastGames();
  }, [fetchLastGames]);

  return {
    lastGames,
    loading,
    error,
    refresh: fetchLastGames,
  };
}