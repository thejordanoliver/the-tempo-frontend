import { Ionicons } from "@expo/vector-icons";
import type {
  ExploreWidgetConfig,
  ExploreWidgetSize,
  ExploreWidgetType,
} from "types/widgets";

export type ExploreWidgetOption = {
  type: ExploreWidgetType;
  title: string;
  description: string;
  badge?: string;
  icon: keyof typeof Ionicons.glyphMap;
  sizes: ExploreWidgetSize[];
  emptyCopy?: string;
  allowDuplicates?: boolean;
};

export const EXPLORE_WIDGET_TYPES = [
  "nba_games",
  "nfl_games",
  "mlb_games",
  "nhl_games",
  "wnba_games",
  "cbb_games",
  "wcbb_games",
  "cfb_games",
  "favorite_games",
  "favorite_teams",
  "trending_news",
  "player_leaders",
  "standings",
] as const satisfies readonly ExploreWidgetType[];

export const EXPLORE_WIDGET_SIZES = [
  "small",
  "medium",
  "large",
] as const satisfies readonly ExploreWidgetSize[];

export const DEFAULT_WIDGET_SIZE_BY_TYPE: Record<
  ExploreWidgetType,
  ExploreWidgetSize
> = {
  nba_games: "medium",
  nfl_games: "medium",
  mlb_games: "medium",
  nhl_games: "medium",
  wnba_games: "medium",
  cbb_games: "medium",
  wcbb_games: "medium",
  cfb_games: "medium",
  favorite_games: "medium",
  favorite_teams: "medium",
  trending_news: "medium",
  player_leaders: "medium",
  standings: "medium",
};

export const WIDGET_SIZE_OPTIONS_BY_TYPE: Record<
  ExploreWidgetType,
  ExploreWidgetSize[]
> = {
  nba_games: ["small", "medium", "large"],
  nfl_games: ["small", "medium", "large"],
  mlb_games: ["small", "medium", "large"],
  nhl_games: ["small", "medium", "large"],
  wnba_games: ["small", "medium", "large"],
  cbb_games: ["small", "medium", "large"],
  wcbb_games: ["small", "medium", "large"],
  cfb_games: ["small", "medium", "large"],
  favorite_games: ["small", "medium", "large"],
  favorite_teams: ["small", "medium", "large"],
  trending_news: ["small", "medium", "large"],
  player_leaders: ["medium"],
  standings: ["small", "medium", "large"],
};

export const EXPLORE_WIDGET_EMPTY_COPY: Record<ExploreWidgetType, string> = {
  nba_games: "Add favorite NBA teams to see their games here.",
  nfl_games: "Add favorite NFL teams to see their games here.",
  mlb_games: "Add favorite MLB teams to see their games here.",
  nhl_games: "Add favorite NHL teams to see their games here.",
  wnba_games: "Add favorite WNBA teams to see their games here.",
  cbb_games: "Add favorite CBB teams to see their games here.",
  wcbb_games: "Add favorite WCBB teams to see their games here.",
  cfb_games: "Add favorite CFB teams to see their games here.",
  favorite_games: "Add favorite teams to see all of their games in one slider.",
  favorite_teams: "Add favorite teams to show shortcuts here.",
  trending_news: "Latest stories will appear here.",
  player_leaders: "Player leader snapshots will appear here.",
  standings: "Standings snapshots will appear here.",
};

export const EXPLORE_WIDGET_OPTIONS: ExploreWidgetOption[] = [
  {
    type: "nba_games",
    title: "NBA Games",
    description: "Track recent and upcoming games for favorite NBA teams.",
    badge: "NBA",
    icon: "basketball-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.nba_games,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.nba_games,
  },
  {
    type: "nfl_games",
    title: "NFL Games",
    description: "Follow football matchups for your NFL favorites.",
    badge: "NFL",
    icon: "american-football-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.nfl_games,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.nfl_games,
  },
  {
    type: "mlb_games",
    title: "MLB Games",
    description: "Keep baseball scores close on Explore.",
    badge: "MLB",
    icon: "baseball-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.mlb_games,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.mlb_games,
  },
  {
    type: "nhl_games",
    title: "NHL Games",
    description: "Track hockey game cards from your NHL favorites.",
    badge: "NHL",
    icon: "ice-cream-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.nhl_games,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.nhl_games,
  },
  {
    type: "wnba_games",
    title: "WNBA Games",
    description: "Follow WNBA games for selected teams.",
    badge: "WNBA",
    icon: "basketball-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.wnba_games,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.wnba_games,
  },
  {
    type: "cbb_games",
    title: "CBB Games",
    description: "Track men's college basketball team games.",
    badge: "CBB",
    icon: "school-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.cbb_games,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.cbb_games,
  },
  {
    type: "wcbb_games",
    title: "WCBB Games",
    description: "Track women's college basketball team games.",
    badge: "WCBB",
    icon: "school-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.wcbb_games,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.wcbb_games,
  },
  {
    type: "cfb_games",
    title: "CFB Games",
    description: "Follow college football games from favorite teams.",
    badge: "CFB",
    icon: "american-football-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.cfb_games,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.cfb_games,
  },
  {
    type: "favorite_games",
    title: "Favorites Games",
    description: "Combine all favorite-team games into one slider.",
    badge: "Games",
    icon: "albums-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.favorite_games,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.favorite_games,
  },
  {
    type: "favorite_teams",
    title: "Favorite Teams",
    description: "Quick access to your saved teams and leagues.",
    badge: "Teams",
    icon: "star-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.favorite_teams,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.favorite_teams,
  },
  {
    type: "trending_news",
    title: "Trending News",
    description: "Surface the latest stories across your sports.",
    badge: "News",
    icon: "newspaper-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.trending_news,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.trending_news,
  },
  {
    type: "player_leaders",
    title: "Player Leaders",
    description: "Monitor leaders and standout player performances.",
    badge: "Players",
    icon: "podium-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.player_leaders,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.player_leaders,
  },
  {
    type: "standings",
    title: "Standings",
    description: "Add standings snapshots for leagues you follow.",
    badge: "Tables",
    icon: "stats-chart-outline",
    sizes: WIDGET_SIZE_OPTIONS_BY_TYPE.standings,
    emptyCopy: EXPLORE_WIDGET_EMPTY_COPY.standings,
  },
];

export const EXPLORE_GAME_WIDGET_TYPES = [
  "favorite_games",
  "nba_games",
  "nfl_games",
  "mlb_games",
  "nhl_games",
  "wnba_games",
  "cbb_games",
  "wcbb_games",
  "cfb_games",
] as const satisfies readonly ExploreWidgetType[];

export type ExploreGameWidgetType = (typeof EXPLORE_GAME_WIDGET_TYPES)[number];

const widgetTypeSet = new Set<string>(EXPLORE_WIDGET_TYPES);
const widgetSizeSet = new Set<string>(EXPLORE_WIDGET_SIZES);

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

export function getDefaultWidgetSize(
  type: ExploreWidgetType,
): ExploreWidgetSize {
  return DEFAULT_WIDGET_SIZE_BY_TYPE[type];
}

export function getWidgetOption(type: ExploreWidgetType) {
  return EXPLORE_WIDGET_OPTIONS.find((option) => option.type === type);
}

export function widgetAllowsDuplicates(type: ExploreWidgetType) {
  return getWidgetOption(type)?.allowDuplicates === true;
}

export function getWidgetTitle(type: ExploreWidgetType) {
  return getWidgetOption(type)?.title ?? type;
}

export function getWidgetSizeOptions(type: ExploreWidgetType) {
  return WIDGET_SIZE_OPTIONS_BY_TYPE[type];
}

export function isGameWidgetType(
  type: ExploreWidgetConfig["type"],
): type is ExploreGameWidgetType {
  return (EXPLORE_GAME_WIDGET_TYPES as readonly string[]).includes(type);
}
