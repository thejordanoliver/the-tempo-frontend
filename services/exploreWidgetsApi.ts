import { isExploreWidgetType } from "constants/exploreWidgets";
import { normalizeStoredWidgets } from "utils/exploreWidgetStorage";
import type { WidgetSettings } from "utils/exploreWidgetSync";
import type { ExploreWidgetConfig } from "types/widgets";
import type {
  ExploreWidgetLeague,
  ExploreWidgetsResponse,
} from "types/widgets";
import { apiClient } from "utils/apiClient";

type GetExploreWidgetsOptions = {
  forceRefresh?: boolean;
  leagues: readonly ExploreWidgetLeague[];
  signal?: AbortSignal;
};

const EXPLORE_WIDGET_REQUEST_TIMEOUT_MS = 20_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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

  return response.data;
}


const WIDGET_SETTINGS_ENDPOINT = "/api/widgets/explore/settings";

function parseWidgetSettingsResponse(value: unknown): WidgetSettings | null {
  if (!isRecord(value) || !("settings" in value)) throw new Error("Invalid widget settings response");
  if (value.settings === null) return null;
  const settings = value.settings;
  if (!isRecord(settings) || settings.schemaVersion !== 2 ||
    !Number.isSafeInteger(settings.revision) || Number(settings.revision) <= 0 ||
    typeof settings.updatedAt !== "string" || !Array.isArray(settings.widgets) ||
    settings.widgets.some((widget) => !isRecord(widget) || !isExploreWidgetType(widget.type))) {
    throw new Error("Unsupported widget settings response. Update the app and try again.");
  }
  return { schemaVersion: 2, revision: Number(settings.revision), updatedAt: settings.updatedAt,
    widgets: normalizeStoredWidgets({ version: 2, widgets: settings.widgets }) };
}

export async function getExploreWidgetSettings(userId: number, signal?: AbortSignal): Promise<WidgetSettings | null> {
  const response = await apiClient.get<unknown>(WIDGET_SETTINGS_ENDPOINT, { signal, timeout: 15000, headers: { "X-Tempo-User-Id": String(userId) } });
  return parseWidgetSettingsResponse(response.data);
}

export async function saveExploreWidgetSettings(userId: number, widgets: ExploreWidgetConfig[], revision: number, signal?: AbortSignal): Promise<WidgetSettings> {
  const response = await apiClient.put<unknown>(WIDGET_SETTINGS_ENDPOINT, { schemaVersion: 2, widgets, revision }, { signal, timeout: 15000, headers: { "X-Tempo-User-Id": String(userId) } });
  const settings = parseWidgetSettingsResponse(response.data);
  if (!settings) throw new Error("Missing saved widget settings");
  return settings;
}
