import { Ionicons } from "@expo/vector-icons";
import type {
  ExploreCollegePollLeague,
  ExploreCollegePollType,
  ExploreStandingsLeague,
  ExploreWidgetConfig,
  ExploreWidgetLeague,
  ExploreWidgetSize,
  ExploreWidgetType,
} from "types/widgets";
import {
  EXPLORE_COLLEGE_POLL_LEAGUES,
  EXPLORE_COLLEGE_POLL_TYPES,
  EXPLORE_STANDINGS_LEAGUES,
} from "types/widgets";

type ExploreWidgetRegistryEntry = {
  title: string;
  description: string;
  badge?: string;
  icon: keyof typeof Ionicons.glyphMap;
  league?: ExploreWidgetLeague;
  defaultSize: ExploreWidgetSize;
  sizes: readonly ExploreWidgetSize[];
  emptyCopy: string;
  allowDuplicates?: boolean;
};

export type ExploreWidgetOption = ExploreWidgetRegistryEntry & {
  type: ExploreWidgetType;
};

export const EXPLORE_WIDGET_SIZES = [
  "small",
  "medium",
  "large",
] as const satisfies readonly ExploreWidgetSize[];

export const EXPLORE_WIDGET_REGISTRY: Record<
  ExploreWidgetType,
  ExploreWidgetRegistryEntry
> = {
  my_picks: {
    title: "My Picks",
    description: "Your prediction record and recent picks with results.",
    badge: "Predictions",
    icon: "checkmark-circle-outline",
    defaultSize: "medium",
    sizes: EXPLORE_WIDGET_SIZES,
    emptyCopy: "Pick a winner before a game starts to track your predictions here.",
  },
  favorite_games: {
    title: "Favorite Games",
    description: "Combine all favorite-team games into one slider.",
    badge: "Games",
    icon: "albums-outline",
    defaultSize: "medium",
    sizes: EXPLORE_WIDGET_SIZES,
    emptyCopy: "Add favorite teams to see all of their games in one slider.",
  },

  favorite_teams: {
    title: "Favorite Teams",
    description: "Quick access to your saved teams and leagues.",
    badge: "Teams",
    icon: "heart-outline",
    defaultSize: "medium",
    sizes: EXPLORE_WIDGET_SIZES,
    emptyCopy: "Add favorite teams to show shortcuts here.",
  },

  create_post: {
    title: "Create Post",
    description: "Start a new conversation with the Tempo community.",
    badge: "Community",
    icon: "create-outline",
    defaultSize: "small",
    sizes: ["small"],
    emptyCopy: "Create a post and join the conversation.",
  },

  standings: {
    title: "Standings",
    description: "Follow conference standings from your Explore board.",
    badge: "Tables",
    icon: "podium-outline",
    defaultSize: "medium",
    sizes: EXPLORE_WIDGET_SIZES,
    emptyCopy: "Standings are not available for this league right now.",
  },

  college_polls: {
    title: "College Polls",
    description: "Follow the latest college football and basketball polls.",
    badge: "Top 25",
    icon: "school-outline",
    defaultSize: "medium",
    sizes: EXPLORE_WIDGET_SIZES,
    emptyCopy: "College rankings are not available right now.",
  },

};
export const EXPLORE_WIDGET_TYPES = Object.keys(
  EXPLORE_WIDGET_REGISTRY,
) as ExploreWidgetType[];

export const EXPLORE_WIDGET_OPTIONS: ExploreWidgetOption[] =
  EXPLORE_WIDGET_TYPES.map((type) => ({
    type,
    ...EXPLORE_WIDGET_REGISTRY[type],
  }));

export const EXPLORE_WIDGET_EMPTY_COPY: Record<ExploreWidgetType, string> =
  EXPLORE_WIDGET_TYPES.reduce(
    (copy, type) => ({
      ...copy,
      [type]: EXPLORE_WIDGET_REGISTRY[type].emptyCopy,
    }),
    {} as Record<ExploreWidgetType, string>,
  );

export const EXPLORE_GAME_WIDGET_TYPES = [
  "favorite_games",
] as const satisfies readonly ExploreWidgetType[];

export type ExploreGameWidgetType = (typeof EXPLORE_GAME_WIDGET_TYPES)[number];

const widgetTypeSet = new Set<string>(EXPLORE_WIDGET_TYPES);
const widgetSizeSet = new Set<string>(EXPLORE_WIDGET_SIZES);
const standingsLeagueSet = new Set<string>(EXPLORE_STANDINGS_LEAGUES);
const collegePollLeagueSet = new Set<string>(EXPLORE_COLLEGE_POLL_LEAGUES);
const collegePollTypeSet = new Set<string>(EXPLORE_COLLEGE_POLL_TYPES);

export function isExploreWidgetType(
  value: unknown,
): value is ExploreWidgetType {
  return typeof value === "string" && widgetTypeSet.has(value);
}

export function isExploreWidgetSize(
  value: unknown,
): value is ExploreWidgetSize {
  return typeof value === "string" && widgetSizeSet.has(value);
}

export function isExploreStandingsLeague(
  value: unknown,
): value is ExploreStandingsLeague {
  return typeof value === "string" && standingsLeagueSet.has(value);
}

export function isExploreCollegePollLeague(
  value: unknown,
): value is ExploreCollegePollLeague {
  return typeof value === "string" && collegePollLeagueSet.has(value);
}

export function isExploreCollegePollType(
  value: unknown,
): value is ExploreCollegePollType {
  return typeof value === "string" && collegePollTypeSet.has(value);
}

export function getDefaultWidgetSize(
  type: ExploreWidgetType,
): ExploreWidgetSize {
  return EXPLORE_WIDGET_REGISTRY[type].defaultSize;
}

export function getWidgetOption(type: ExploreWidgetType) {
  return EXPLORE_WIDGET_REGISTRY[type]
    ? ({ type, ...EXPLORE_WIDGET_REGISTRY[type] } satisfies ExploreWidgetOption)
    : undefined;
}

export function widgetAllowsDuplicates(type: ExploreWidgetType) {
  return EXPLORE_WIDGET_REGISTRY[type].allowDuplicates === true;
}

export function getWidgetTitle(type: ExploreWidgetType) {
  return EXPLORE_WIDGET_REGISTRY[type].title;
}

export function getWidgetSizeOptions(type: ExploreWidgetType) {
  return EXPLORE_WIDGET_REGISTRY[type].sizes;
}

export function isGameWidgetType(
  type: ExploreWidgetConfig["type"],
): type is ExploreGameWidgetType {
  return (EXPLORE_GAME_WIDGET_TYPES as readonly string[]).includes(type);
}
