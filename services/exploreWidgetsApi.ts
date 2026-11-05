import { isExploreWidgetType } from "constants/exploreWidgets";
import { CanceledError } from "axios";
import { normalizeStoredWidgets } from "utils/widgets/exploreWidgetStorage";
import type { WidgetSettings } from "utils/widgets/exploreWidgetSync";
import type {
  ExploreWidgetConfig,
  ExploreWidgetGame,
  ExploreWidgetLeague,
  ExploreWidgetsResponse,
} from "types/widgets";
import { apiClient } from "utils/apiClient";
import { selectExploreFavoriteGames } from "utils/widgets/exploreFavoriteGames";

type GetExploreWidgetsOptions = {
  forceRefresh?: boolean;
  leagues: readonly ExploreWidgetLeague[];
  signal?: AbortSignal;
};

const EXPLORE_WIDGET_REQUEST_TIMEOUT_MS = 20_000;
const SCHEDULE_REQUEST_TIMEOUT_MS = 8_000;
const SCHEDULE_CONCURRENCY = 6;
const WIDGET_SPORTS: Record<ExploreWidgetLeague, ExploreWidgetGame["sport"]> = {
  nba: "basketball",
  wnba: "basketball",
  mcbb: "basketball",
  wcbb: "basketball",
  mlb: "baseball",
  cb: "baseball",
  nfl: "football",
  cfb: "football",
  ufl: "football",
  nhl: "hockey",
  mcvb: "volleyball",
  wcvb: "volleyball",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isWidgetGame(value: unknown): value is ExploreWidgetGame["game"] {
  return (
    isRecord(value) &&
    (typeof value.id === "string" || typeof value.id === "number") &&
    isRecord(value.status) &&
    isRecord(value.home) &&
    isRecord(value.away)
  );
}

async function selectFavoriteScheduleGames(
  response: ExploreWidgetsResponse,
  signal?: AbortSignal,
): Promise<ExploreWidgetsResponse> {
  const favorites = Array.from(new Set(response.favoriteTeamKeys));
  const results = new Map<string, ExploreWidgetGame[]>();
  const failures = new Map(
    response.failures.map((failure) => [failure.favoriteTeamKey, failure]),
  );
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < favorites.length) {
      if (signal?.aborted) throw new CanceledError();
      const favoriteTeamKey = favorites[nextIndex++];
      const [leagueValue, teamId] = favoriteTeamKey.split(":");
      const league = response.requestedLeagues.find(
        (value) => value === leagueValue,
      );
      if (!league || !teamId) continue;
      const sport = WIDGET_SPORTS[league];

      try {
        const schedule = await apiClient.get<unknown>(
          `/api/games/${sport}/team/${league}/${encodeURIComponent(teamId)}`,
          { signal, timeout: SCHEDULE_REQUEST_TIMEOUT_MS },
        );
        if (
          !isRecord(schedule.data) ||
          !Array.isArray(schedule.data.games) ||
          !schedule.data.games.every(isWidgetGame)
        ) {
          throw new Error("Invalid team schedule response");
        }

        results.set(
          favoriteTeamKey,
          schedule.data.games.map(
            (game) =>
              ({
                key: `${sport}:${league}:${game.id}`,
                gameId: String(game.id),
                favoriteTeamKeys: [favoriteTeamKey],
                sport,
                league,
                game,
              }) as ExploreWidgetGame,
          ),
        );
        failures.delete(favoriteTeamKey);
      } catch {
        if (signal?.aborted) throw new CanceledError();
        // Retain the aggregate game's fallback if this team's schedule fails.
        results.set(
          favoriteTeamKey,
          response.games
            .filter((envelope) =>
              envelope.favoriteTeamKeys.includes(favoriteTeamKey),
            )
            .map((envelope) => ({
              ...envelope,
              favoriteTeamKeys: [favoriteTeamKey],
            })),
        );
        failures.set(favoriteTeamKey, {
          favoriteTeamKey,
          code: "upstream_unavailable",
        });
      }
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(SCHEDULE_CONCURRENCY, favorites.length) },
      worker,
    ),
  );
  if (signal?.aborted) throw new CanceledError();

  return {
    ...response,
    games: selectExploreFavoriteGames(Array.from(results.values()).flat()),
    failures: Array.from(failures.values()),
  };
}

function isExploreWidgetsResponse(
  value: unknown,
): value is ExploreWidgetsResponse {
  if (!isRecord(value)) return false;

  return (
    value.version === 1 &&
    typeof value.generatedAt === "string" &&
    Array.isArray(value.requestedLeagues) &&
    Array.isArray(value.favoriteTeamKeys) &&
    Array.isArray(value.failures) &&
    Array.isArray(value.games) &&
    value.games.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.key === "string" &&
        typeof entry.gameId === "string" &&
        typeof entry.sport === "string" &&
        typeof entry.league === "string" &&
        Array.isArray(entry.favoriteTeamKeys) &&
        isRecord(entry.game) &&
        (typeof entry.game.id === "string" ||
          typeof entry.game.id === "number") &&
        isRecord(entry.game.status) &&
        isRecord(entry.game.home) &&
        isRecord(entry.game.away),
    )
  );
}

export async function getExploreWidgets({
  forceRefresh = false,
  leagues,
  signal,
}: GetExploreWidgetsOptions): Promise<ExploreWidgetsResponse> {
  const response = await apiClient.get<unknown>("/api/widgets/explore", {
    params: {
      leagues: leagues.join(","),
      refresh: forceRefresh ? 1 : undefined,
    },
    signal,
    timeout: EXPLORE_WIDGET_REQUEST_TIMEOUT_MS,
  });

  if (!isExploreWidgetsResponse(response.data)) {
    throw new Error("The widget service returned an invalid response.");
  }

  return selectFavoriteScheduleGames(response.data, signal);
}

const WIDGET_SETTINGS_ENDPOINT = "/api/widgets/explore/settings";

function parseWidgetSettingsResponse(value: unknown): WidgetSettings | null {
  if (!isRecord(value) || !("settings" in value))
    throw new Error("Invalid widget settings response");
  if (value.settings === null) return null;
  const settings = value.settings;
  if (
    !isRecord(settings) ||
    settings.schemaVersion !== 2 ||
    !Number.isSafeInteger(settings.revision) ||
    Number(settings.revision) <= 0 ||
    typeof settings.updatedAt !== "string" ||
    !Array.isArray(settings.widgets) ||
    settings.widgets.some(
      (widget) => !isRecord(widget) || !isExploreWidgetType(widget.type),
    )
  ) {
    throw new Error(
      "Unsupported widget settings response. Update the app and try again.",
    );
  }
  return {
    schemaVersion: 2,
    revision: Number(settings.revision),
    updatedAt: settings.updatedAt,
    widgets: normalizeStoredWidgets({ version: 2, widgets: settings.widgets }),
  };
}

export async function getExploreWidgetSettings(
  userId: number,
  signal?: AbortSignal,
): Promise<WidgetSettings | null> {
  const response = await apiClient.get<unknown>(WIDGET_SETTINGS_ENDPOINT, {
    signal,
    timeout: 15000,
    headers: { "X-Tempo-User-Id": String(userId) },
  });
  return parseWidgetSettingsResponse(response.data);
}

export async function saveExploreWidgetSettings(
  userId: number,
  widgets: ExploreWidgetConfig[],
  revision: number,
  signal?: AbortSignal,
): Promise<WidgetSettings> {
  const response = await apiClient.put<unknown>(
    WIDGET_SETTINGS_ENDPOINT,
    { schemaVersion: 2, widgets, revision },
    { signal, timeout: 15000, headers: { "X-Tempo-User-Id": String(userId) } },
  );
  const settings = parseWidgetSettingsResponse(response.data);
  if (!settings) throw new Error("Missing saved widget settings");
  return settings;
}
