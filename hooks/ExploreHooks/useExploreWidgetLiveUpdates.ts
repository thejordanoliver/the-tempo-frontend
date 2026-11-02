import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useRef } from "react";
import { subscribeSportsLive } from "services/liveSportsSocket";
import type { ExploreWidgetDataCache, ExploreWidgetGame } from "types/widgets";
import {
  mergeExploreFavoriteGameUpdate,
  selectExploreFavoriteGames,
} from "utils/widgets/exploreFavoriteGames";

type TeamLatestPayload = {
  game?: unknown;
  games?: unknown;
};

type UseExploreWidgetLiveUpdatesOptions = {
  enabled?: boolean;
  cache: ExploreWidgetDataCache | null;
  dataKey: string;
  relevantFavoriteKeySet: ReadonlySet<string>;
  setCache: Dispatch<SetStateAction<ExploreWidgetDataCache | null>>;
  userId: number | null;
};

function getFavoriteTeamId(key: string): string {
  return key.slice(key.indexOf(":") + 1);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isWidgetGame(game: unknown): game is ExploreWidgetGame["game"] {
  if (!isRecord(game)) return false;

  return (
    (typeof game.id === "string" || typeof game.id === "number") &&
    Boolean(game.status && typeof game.status === "object") &&
    Boolean(game.home && typeof game.home === "object") &&
    Boolean(game.away && typeof game.away === "object")
  );
}

function isBasketballWidgetGame(
  value: unknown,
): value is Extract<ExploreWidgetGame, { sport: "basketball" }>["game"] {
  return isWidgetGame(value);
}

function isBaseballWidgetGame(
  value: unknown,
): value is Extract<ExploreWidgetGame, { sport: "baseball" }>["game"] {
  return isWidgetGame(value);
}

function isFootballWidgetGame(
  value: unknown,
): value is Extract<ExploreWidgetGame, { sport: "football" }>["game"] {
  return isWidgetGame(value);
}

function isHockeyWidgetGame(
  value: unknown,
): value is Extract<ExploreWidgetGame, { sport: "hockey" }>["game"] {
  return isWidgetGame(value);
}

export function useExploreWidgetLiveUpdates({
  enabled = true,
  cache,
  dataKey,
  relevantFavoriteKeySet,
  setCache,
  userId,
}: UseExploreWidgetLiveUpdatesOptions) {
  const liveSubscriptionEntries = useMemo(() => {
    const entries = new Map<string, [string, ExploreWidgetGame]>();

    cache?.response.games.forEach((envelope) => {
      // Hockey only provides teamLatest; the other sports provide full schedules.
      if (envelope.sport === "hockey" && !shouldTrackGameUpdates(envelope.game))
        return;

      for (const favoriteKey of envelope.favoriteTeamKeys) {
        if (relevantFavoriteKeySet.has(favoriteKey)) {
          entries.set(favoriteKey, [favoriteKey, envelope]);
        }
      }
    });

    return Array.from(entries.values());
  }, [cache?.response.games, relevantFavoriteKeySet]);
  const liveSubscriptionKey = liveSubscriptionEntries
    .map(([favoriteKey, envelope]) => `${favoriteKey}:${envelope.key}`)
    .sort()
    .join("|");
  const liveSubscriptionEntriesRef = useRef(liveSubscriptionEntries);
  useEffect(() => {
    liveSubscriptionEntriesRef.current = liveSubscriptionEntries;
  }, [liveSubscriptionEntries]);

  useEffect(() => {
    if (!enabled || !userId || !liveSubscriptionKey) return;
    let listening = true;

    const unsubscribe = liveSubscriptionEntriesRef.current.map(
      ([favoriteKey, envelope]) =>
        subscribeSportsLive<TeamLatestPayload>({
          kind: "scoreboard",
          payload: {
            sport: envelope.sport,
            league: envelope.league,
            feed: envelope.sport === "hockey" ? "teamLatest" : "teamSchedule",
            teamId: getFavoriteTeamId(favoriteKey),
          },
          listener: ({ payload }) => {
            if (!listening) return;
            let game = payload.game;
            if (envelope.sport !== "hockey") {
              if (
                !Array.isArray(payload.games) ||
                !payload.games.every(isWidgetGame)
              )
                return;
              game = selectExploreFavoriteGames(
                payload.games.map(
                  (game) =>
                    ({
                      ...envelope,
                      key: `${envelope.sport}:${envelope.league}:${game.id}`,
                      gameId: String(game.id),
                      favoriteTeamKeys: [favoriteKey],
                      game,
                    }) as ExploreWidgetGame,
                ),
              )[0]?.game;
            }
            let updatedEnvelope: ExploreWidgetGame;

            switch (envelope.sport) {
              case "basketball":
                if (!isBasketballWidgetGame(game)) return;
                updatedEnvelope = { ...envelope, game };
                break;
              case "baseball":
                if (!isBaseballWidgetGame(game)) return;
                updatedEnvelope = { ...envelope, game };
                break;
              case "football":
                if (!isFootballWidgetGame(game)) return;
                updatedEnvelope = { ...envelope, game };
                break;
              case "volleyball":
                if (!isWidgetGame(game)) return;
                updatedEnvelope = {
                  ...envelope,
                  game: game as Extract<
                    ExploreWidgetGame,
                    { sport: "volleyball" }
                  >["game"],
                };
                break;
              case "hockey":
                if (!isHockeyWidgetGame(game)) return;
                updatedEnvelope = { ...envelope, game };
                break;
            }

            const updatedGame = updatedEnvelope.game;
            const updatedGameId = String(updatedGame.id);
            const updatedKey = `${envelope.sport}:${envelope.league}:${updatedGameId}`;

            setCache((current) => {
              if (!current || current.key !== dataKey) return current;

              const nextEnvelope: ExploreWidgetGame = {
                ...updatedEnvelope,
                key: updatedKey,
                gameId: updatedGameId,
                favoriteTeamKeys: [favoriteKey],
              };

              return {
                ...current,
                response: {
                  ...current.response,
                  games: mergeExploreFavoriteGameUpdate(
                    current.response.games,
                    nextEnvelope,
                    Date.now(),
                    { replaceTeamSelection: envelope.sport !== "hockey" },
                  ),
                },
              };
            });
          },
        }),
    );

    return () => {
      listening = false;
      unsubscribe.forEach((unsubscribeFavorite) => unsubscribeFavorite());
    };
  }, [enabled, dataKey, liveSubscriptionKey, setCache, userId]);
}
