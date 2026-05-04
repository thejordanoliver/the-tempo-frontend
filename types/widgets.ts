export type ExploreWidgetType =
  | "nba_games"
  | "nfl_games"
  | "mlb_games"
  | "nhl_games"
  | "wnba_games"
  | "cbb_games"
  | "wcbb_games"
  | "cfb_games"
  | "favorite_games"
  | "favorite_teams"
  | "trending_news"
  | "player_leaders"
  | "standings";

export type ExploreWidgetSize = "small" | "medium" | "large";

export type ExploreWidgetConfig = {
  id: string;
  type: ExploreWidgetType;
  title: string;
  createdAt: number;
  size: ExploreWidgetSize;
  order: number;
};
