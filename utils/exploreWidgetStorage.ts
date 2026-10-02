import type { WidgetSettingsCache } from "./exploreWidgetSync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getDefaultWidgetSize,
  getWidgetTitle,
  isExploreCollegePollLeague,
  isExploreCollegePollType,
  isExploreStandingsLeague,
  isExploreWidgetSize,
  isExploreWidgetType,
  widgetAllowsDuplicates,
} from "constants/exploreWidgets";
import {
  EXPLORE_WIDGET_LEAGUES,
  type ExploreWidgetConfig,
  type ExploreWidgetLeague,
} from "types/widgets";
import { normalizeCollegePollType } from "utils/collegePollWidget";

export const EXPLORE_WIDGETS_KEY_PREFIX = "exploreWidgets";
export const EXPLORE_WIDGETS_LEGACY_KEY = EXPLORE_WIDGETS_KEY_PREFIX;
export const EXPLORE_WIDGETS_SCHEMA_VERSION = 2;

const LEGACY_GAME_WIDGET_LEAGUES = {
  nba_games: "nba",
  nfl_games: "nfl",
  mlb_games: "mlb",
  nhl_games: "nhl",
  wnba_games: "wnba",
  cbb_games: "cbb",
  wcbb_games: "wcbb",
  cfb_games: "cfb",
} as const satisfies Record<string, ExploreWidgetLeague>;

type LegacyGameWidgetType = keyof typeof LEGACY_GAME_WIDGET_LEAGUES;

function isLegacyGameWidgetType(value: unknown): value is LegacyGameWidgetType {
  return typeof value === "string" && value in LEGACY_GAME_WIDGET_LEAGUES;
}

type StoredExploreWidgetsPayload = {
  version?: number;
  widgets?: unknown;
};

export const getExploreWidgetsKey = (userId: string | number) =>
  `${EXPLORE_WIDGETS_KEY_PREFIX}:${userId}`;

function safeParseJson(value: string | null): unknown {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const withSequentialOrder = (widgets: ExploreWidgetConfig[]) =>
  widgets
    .slice()
    .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
    .map((widget, index) => ({ ...widget, order: index }));

export function createExploreWidgetId(type: ExploreWidgetConfig["type"]) {
  const randomUuid =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${type}:${randomUuid}`;
}

export function normalizeStoredWidgets(value: unknown): ExploreWidgetConfig[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const version = (value as StoredExploreWidgetsPayload).version;
    if (version !== undefined && version !== 1 && version !== EXPLORE_WIDGETS_SCHEMA_VERSION) {
      throw new Error("Unsupported widget settings version");
    }
  }
  let rawWidgets: unknown[] = [];

  if (Array.isArray(value)) {
    rawWidgets = value;
  } else if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as StoredExploreWidgetsPayload).widgets)
  ) {
    rawWidgets = (value as { widgets: unknown[] }).widgets;
  }

  const favoriteGamesIndexes = rawWidgets.flatMap((widget, index) => {
    if (!widget || typeof widget !== "object") return [];

    const type = (widget as { type?: unknown }).type;
    return type === "favorite_games" || isLegacyGameWidgetType(type)
      ? [index]
      : [];
  });
  const storedFavoriteGamesIndex = rawWidgets.findIndex(
    (widget) =>
      Boolean(widget) &&
      typeof widget === "object" &&
      (widget as { type?: unknown }).type === "favorite_games",
  );
  const hasStoredFavoriteGames = storedFavoriteGamesIndex >= 0;
  const firstFavoriteGamesIndex = hasStoredFavoriteGames
    ? storedFavoriteGamesIndex
    : favoriteGamesIndexes[0];
  const migratedFavoriteGameLeagues = EXPLORE_WIDGET_LEAGUES.filter(
    (league) =>
      rawWidgets.some((widget) => {
        if (!widget || typeof widget !== "object") return false;

        const stored = widget as {
          type?: unknown;
          favoriteGameLeagues?: unknown;
        };
        if (isLegacyGameWidgetType(stored.type)) {
          return LEGACY_GAME_WIDGET_LEAGUES[stored.type] === league;
        }

        return (
          stored.type === "favorite_games" &&
          (!Array.isArray(stored.favoriteGameLeagues) ||
            stored.favoriteGameLeagues.includes(league))
        );
      }),
  );
  const migratedRawWidgets = rawWidgets.flatMap((widget, index) => {
    if (!widget || typeof widget !== "object") return [widget];

    const stored = widget as Record<string, unknown>;
    const isFavoriteGames = stored.type === "favorite_games";
    const isLegacyGame = isLegacyGameWidgetType(stored.type);
    if (!isFavoriteGames && !isLegacyGame) return [widget];
    if (index !== firstFavoriteGamesIndex) return [];

    return [
      {
        ...stored,
        id: isFavoriteGames ? stored.id : undefined,
        type: "favorite_games",
        title: "Favorite Games",
        favoriteGameLeagues: hasStoredFavoriteGames
          ? migratedFavoriteGameLeagues
          : EXPLORE_WIDGET_LEAGUES.filter((league) =>
              migratedFavoriteGameLeagues.includes(league),
            ),
      },
    ];
  });

  const seenSingleInstanceTypes = new Set<ExploreWidgetConfig["type"]>();

  const normalized = migratedRawWidgets
    .filter(
      (widget): widget is Partial<ExploreWidgetConfig> =>
        Boolean(widget) &&
        typeof widget === "object" &&
        isExploreWidgetType((widget as ExploreWidgetConfig).type),
    )
    .map((widget) => {
      const type = widget.type as ExploreWidgetConfig["type"];
      const createdAt =
        typeof widget.createdAt === "number" ? widget.createdAt : Date.now();
      const collegePollLeague =
        type === "college_polls" &&
        isExploreCollegePollLeague(widget.collegePollLeague)
          ? widget.collegePollLeague
          : "cfb";
      const collegePollType =
        type === "college_polls" &&
        isExploreCollegePollType(widget.collegePollType)
          ? normalizeCollegePollType(collegePollLeague, widget.collegePollType)
          : "ap";
      const favoriteGameLeagues =
        type === "favorite_games" && Array.isArray(widget.favoriteGameLeagues)
          ? EXPLORE_WIDGET_LEAGUES.filter((league) =>
              (widget.favoriteGameLeagues as unknown[]).includes(league),
            )
          : ([...EXPLORE_WIDGET_LEAGUES] as ExploreWidgetLeague[]);

      return {
        id:
          typeof widget.id === "string" && widget.id
            ? widget.id
            : createExploreWidgetId(type),
        type,
        title:
          typeof widget.title === "string" && widget.title
            ? widget.title
            : getWidgetTitle(type),
        createdAt,
        size: type === "create_post" ? "small" : isExploreWidgetSize(widget.size)
          ? widget.size
          : getDefaultWidgetSize(type),
        order:
          typeof widget.order === "number"
            ? widget.order
            : Number.MAX_SAFE_INTEGER,
        standingsLeague:
          type === "standings" &&
          isExploreStandingsLeague(widget.standingsLeague)
            ? widget.standingsLeague
            : type === "standings"
              ? "nba"
              : undefined,
        collegePollLeague:
          type === "college_polls" ? collegePollLeague : undefined,
        collegePollType:
          type === "college_polls" ? collegePollType : undefined,
        // Older stored widgets predate this field; only an explicit false
        // disables autoplay so those widgets retain the default behavior.
        collegePollAutoPlay:
          type === "college_polls"
            ? widget.collegePollAutoPlay !== false
            : undefined,
        favoriteGameLeagues:
          type === "favorite_games" ? favoriteGameLeagues : undefined,
        favoriteGamesAutoPlay:
          type === "favorite_games"
            ? widget.favoriteGamesAutoPlay !== false
            : undefined,
      };
    })
    .filter((widget) => {
      if (widgetAllowsDuplicates(widget.type)) {
        return true;
      }

      if (seenSingleInstanceTypes.has(widget.type)) {
        return false;
      }

      seenSingleInstanceTypes.add(widget.type);
      return true;
    });

  return withSequentialOrder(normalized);
}

export function serializeExploreWidgets(widgets: ExploreWidgetConfig[]) {
  return JSON.stringify({
    version: EXPLORE_WIDGETS_SCHEMA_VERSION,
    widgets: withSequentialOrder(widgets),
  });
}

export async function loadExploreWidgetsForUser(userId: string) {
  const storedWidgets = await AsyncStorage.getItem(getExploreWidgetsKey(userId));
  return normalizeStoredWidgets(safeParseJson(storedWidgets));
}

export async function saveExploreWidgetsForUser(
  userId: string,
  widgets: ExploreWidgetConfig[],
) {
  await AsyncStorage.setItem(
    getExploreWidgetsKey(userId),
    serializeExploreWidgets(widgets),
  );
}

export async function cleanupLegacyExploreWidgetsKey() {
  await AsyncStorage.removeItem(EXPLORE_WIDGETS_LEGACY_KEY);
}

export async function loadExploreWidgetSettingsCache(userId: string): Promise<WidgetSettingsCache | null> {
  const stored = await AsyncStorage.getItem(getExploreWidgetsKey(userId));
  if (stored === null) return null;
  const value: unknown = JSON.parse(stored);
  if (!value || typeof value !== "object" || (!Array.isArray(value) && !Array.isArray((value as { widgets?: unknown }).widgets))) {
    throw new Error("Invalid saved widget settings");
  }
  const metadata = value as Partial<WidgetSettingsCache>;
  if (metadata.revision !== undefined && metadata.revision !== null &&
    (!Number.isSafeInteger(metadata.revision) || metadata.revision < 0)) throw new Error("Invalid saved revision");
  return { version: 2, widgets: normalizeStoredWidgets(value), revision: metadata.revision ?? null, pending: metadata.pending === true };
}

export async function saveExploreWidgetSettingsCache(userId: string, cache: WidgetSettingsCache) {
  await AsyncStorage.setItem(getExploreWidgetsKey(userId), JSON.stringify(cache));
}
