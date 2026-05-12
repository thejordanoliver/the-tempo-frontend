import { Ionicons } from "@expo/vector-icons";
import {
  EXPLORE_WIDGET_HEIGHTS,
  EXPLORE_WIDGET_MAX_HEIGHTS,
  EXPLORE_WIDGET_MIN_HEIGHTS,
} from "constants/exploreWidgetSizes";
import { Colors } from "constants/styles";
import { useExploreWidgetGames } from "hooks/WidgetHooks/useExploreWidgetGames";
import { useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import { widgetDashboardStyles } from "styles/ExploreStyles/WidgetDashboardStyles";
import {
  ExploreWidgetConfig,
  ExploreWidgetSize,
  ExploreWidgetType,
} from "types/widgets";
import FavoriteTeamsWidget from "./Widgets/FavoriteTeamsWidget";
import NewsWidget from "./Widgets/NewsWidget";
import StandingsWidget from "./Widgets/StandingsWidget";
import WidgetSlider, {
  WidgetEditControls,
  WidgetSlide,
} from "./Widgets/WidgetSlider";

type ExploreWidgetDashboardProps = {
  isDark: boolean;
  selectedWidgets: ExploreWidgetConfig[];
  onAddWidget: () => void;
  onRemoveWidget: (widgetId: string) => void;
  onResizeWidget: (widgetId: string, size: ExploreWidgetSize) => void;
  onMoveWidget: (widgetId: string, direction: -1 | 1) => void;
};

type GameWidgetSection = {
  type: ExploreWidgetType;
  title: string;
  slides: WidgetSlide[];
};

type DashboardWidgetCell = {
  widget: ExploreWidgetConfig;
  index: number;
};

type DashboardWidgetRow = {
  id: string;
  cells: DashboardWidgetCell[];
};

type WidgetEditProps = {
  widgetId: string;
  widgetSize: ExploreWidgetSize;
  isEditing: boolean;
  availableSizeOptions: ExploreWidgetSize[];
  onResizeWidget: (widgetId: string, size: ExploreWidgetSize) => void;
  onRemoveWidget: (widgetId: string) => void;
  onMoveWidget: (widgetId: string, direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  placeholderHeight?: number;
};

const nonGameCopy: Partial<Record<ExploreWidgetType, string>> = {
  player_leaders: "Player leader snapshots will appear here.",
};

const WIDGET_SIZE_OPTIONS: ExploreWidgetSize[] = ["small", "medium", "large"];

const emptyGameCopy: Partial<Record<ExploreWidgetType, string>> = {
  nba_games: "Add favorite NBA teams to see their games here.",
  nfl_games: "Add favorite NFL teams to see their games here.",
  mlb_games: "Add favorite MLB teams to see their games here.",
  nhl_games: "Add favorite NHL teams to see their games here.",
  wnba_games: "Add favorite WNBA teams to see their games here.",
  cbb_games: "Add favorite CBB teams to see their games here.",
  wcbb_games: "Add favorite WCBB teams to see their games here.",
  cfb_games: "Add favorite CFB teams to see their games here.",
  favorite_games: "Add favorite teams to see all of their games in one slider.",
};

const buildWidgetRows = (
  widgets: ExploreWidgetConfig[],
): DashboardWidgetRow[] => {
  const rows: DashboardWidgetRow[] = [];
  let pendingSmallCells: DashboardWidgetCell[] = [];

  const flushSmallCells = () => {
    if (pendingSmallCells.length === 0) return;

    rows.push({
      id: pendingSmallCells.map((cell) => cell.widget.id).join(":"),
      cells: pendingSmallCells,
    });
    pendingSmallCells = [];
  };

  widgets.forEach((widget, index) => {
    const cell = { widget, index };

    if (widget.size === "small") {
      pendingSmallCells.push(cell);

      if (pendingSmallCells.length === 2) {
        flushSmallCells();
      }
      return;
    }

    flushSmallCells();
    rows.push({ id: widget.id, cells: [cell] });
  });

  flushSmallCells();
  return rows;
};

export default function ExploreWidgetDashboard({
  isDark,
  selectedWidgets,
  onAddWidget,
  onRemoveWidget,
  onResizeWidget,
  onMoveWidget,
}: ExploreWidgetDashboardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const styles = exploreStyles(isDark);
  const dashboardStyles = widgetDashboardStyles(isDark);
  const dashboardWidth = Math.max(screenWidth - 24, 1);
  const gridGap = 12;
  const smallWidgetWidth = Math.max((dashboardWidth - gridGap) / 2, 1);
  const {
    nbaGames,
    nflGames,
    mlbGames,
    nhlGames,
    wnbaGames,
    cbbGames,
    wcbbGames,
    cfbGames,
    favoriteTeams,
    loading,
    error,
    refresh,
  } = useExploreWidgetGames();

  const favoriteGameSlides: WidgetSlide[] = [
    ...nbaGames.map((game) => ({ type: "NBA" as const, data: game })),
    ...nflGames.map((game) => ({ type: "NFL" as const, data: game })),
    ...mlbGames.map((game) => ({ type: "MLB" as const, data: game })),
    ...nhlGames.map((game) => ({ type: "NHL" as const, data: game })),
    ...wnbaGames.map((game) => ({ type: "WNBA" as const, data: game })),
    ...cbbGames.map((game) => ({ type: "CBB" as const, data: game })),
    ...wcbbGames.map((game) => ({ type: "WCBB" as const, data: game })),
    ...cfbGames.map((game) => ({ type: "CFB" as const, data: game })),
  ];

  const gameSections: GameWidgetSection[] = [
    {
      type: "favorite_games",
      title: "Favorites Games",
      slides: favoriteGameSlides,
    },
    {
      type: "nba_games",
      title: "NBA Games",
      slides: nbaGames.map((game) => ({ type: "NBA", data: game })),
    },
    {
      type: "nfl_games",
      title: "NFL Games",
      slides: nflGames.map((game) => ({ type: "NFL", data: game })),
    },
    {
      type: "mlb_games",
      title: "MLB Games",
      slides: mlbGames.map((game) => ({ type: "MLB", data: game })),
    },
    {
      type: "nhl_games",
      title: "NHL Games",
      slides: nhlGames.map((game) => ({ type: "NHL", data: game })),
    },
    {
      type: "wnba_games",
      title: "WNBA Games",
      slides: wnbaGames.map((game) => ({ type: "WNBA", data: game })),
    },
    {
      type: "cbb_games",
      title: "CBB Games",
      slides: cbbGames.map((game) => ({ type: "CBB", data: game })),
    },
    {
      type: "wcbb_games",
      title: "WCBB Games",
      slides: wcbbGames.map((game) => ({ type: "WCBB", data: game })),
    },
    {
      type: "cfb_games",
      title: "CFB Games",
      slides: cfbGames.map((game) => ({ type: "CFB", data: game })),
    },
  ];

  const visibleWidgets = selectedWidgets
    .filter(
      (widget) =>
        gameSections.some((section) => section.type === widget.type) ||
        widget.type === "favorite_teams" ||
        widget.type === "trending_news" ||
        widget.type === "standings" ||
        Boolean(nonGameCopy[widget.type]),
    )
    .slice()
    .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
  const widgetRows = useMemo(
    () => buildWidgetRows(visibleWidgets),
    [visibleWidgets],
  );
  const favoriteLeagues = Array.from(
    new Set(favoriteTeams.map((team) => team.league)),
  );
  const hasSelectedGameWidget = visibleWidgets.some((widget) =>
    gameSections.some((section) => section.type === widget.type),
  );

  const renderEmptyBoard = () => (
    <View style={[styles.centerPrompt, dashboardStyles.emptyWrap]}>
      <View style={dashboardStyles.emptyIcon}>
        <Ionicons
          name="grid-outline"
          size={28}
          color={isDark ? Colors.white : Colors.black}
        />
      </View>
      <Text style={dashboardStyles.emptyTitle}>Build your Explore board</Text>
      <Text style={dashboardStyles.emptyText}>
        Add game cards, team shortcuts, news, leaders, and standings.
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAddWidget}
        style={dashboardStyles.cta}
      >
        <Ionicons
          name="add"
          size={18}
          color={isDark ? Colors.black : Colors.white}
        />
        <Text style={dashboardStyles.ctaText}>Add your first widget</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyCard = (
    type: ExploreWidgetType,
    title: string,
    editProps?: WidgetEditProps,
  ) => (
    <View
      style={[
        dashboardStyles.placeholderCard,
        editProps?.placeholderHeight
          ? { height: editProps.placeholderHeight }
          : null,
      ]}
    >
      <Text style={dashboardStyles.placeholderTitle}>{title}</Text>
      <Text style={dashboardStyles.placeholderText}>
        {emptyGameCopy[type] ??
          "This widget has been added to your Explore board."}
      </Text>
      {editProps?.isEditing && (
        <WidgetEditControls
          isDark={isDark}
          widgetId={editProps.widgetId}
          widgetSize={editProps.widgetSize}
          availableSizeOptions={editProps.availableSizeOptions}
          onResizeWidget={editProps.onResizeWidget}
          onRemoveWidget={editProps.onRemoveWidget}
          onMoveWidget={editProps.onMoveWidget}
          canMoveUp={editProps.canMoveUp}
          canMoveDown={editProps.canMoveDown}
          compact={editProps.widgetSize === "small"}
        />
      )}
    </View>
  );

  if (selectedWidgets.length === 0) {
    return renderEmptyBoard();
  }

  const renderWidget = ({
    widget,
    index,
    widgetWidth,
    widgetHeight,
  }: {
    widget: ExploreWidgetConfig;
    index: number;
    widgetWidth: number;
    widgetHeight: number;
  }) => {
    const gameSection = gameSections.find(
      (section) => section.type === widget.type,
    );
    const editProps = {
      widgetId: widget.id,
      widgetSize: widget.size,
      isEditing: isEditMode,
      availableSizeOptions: WIDGET_SIZE_OPTIONS,
      onResizeWidget,
      onRemoveWidget,
      onMoveWidget,
      canMoveUp: index > 0,
      canMoveDown: index < visibleWidgets.length - 1,
    };

    if (gameSection) {
      return (
        <View style={dashboardStyles.section}>
          {gameSection.slides.length > 0 ? (
            <WidgetSlider
              games={gameSection.slides}
              initialHeight={widgetHeight}
              initialWidth={widgetWidth}
              isDark={isDark}
              dashboardMode
              orientation="horizontal"
              {...editProps}
            />
          ) : (
            renderEmptyCard(gameSection.type, gameSection.title, {
              ...editProps,
              placeholderHeight: widgetHeight,
            })
          )}
        </View>
      );
    }

    if (widget.type === "favorite_teams") {
      return (
        <View style={dashboardStyles.section}>
          <FavoriteTeamsWidget
            isDark={isDark}
            size={widget.size}
            width={widgetWidth}
            height={widgetHeight}
            containerWidth={widgetWidth}
            containerHeight={widgetHeight}
            {...editProps}
          />
        </View>
      );
    }

    if (widget.type === "trending_news") {
      return (
        <NewsWidget
          isDark={isDark}
          size={widget.size}
          containerWidth={widgetWidth}
          containerHeight={widgetHeight}
          {...editProps}
        />
      );
    }

    if (widget.type === "standings") {
      return (
        <StandingsWidget
          isDark={isDark}
          size={widget.size}
          containerWidth={widgetWidth}
          containerHeight={widgetHeight}
          favoriteLeagues={favoriteLeagues}
          {...editProps}
        />
      );
    }

    return renderEmptyCard(widget.type, widget.title, {
      ...editProps,
      placeholderHeight: widgetHeight,
    });
  };

  const renderWidgetRow = ({ item: row }: { item: DashboardWidgetRow }) => {
    const isSmallRow = row.cells.every((cell) => cell.widget.size === "small");

    return (
      <View style={dashboardStyles.gridRow}>
        {row.cells.map((cell) => {
          const widgetWidth = isSmallRow ? smallWidgetWidth : dashboardWidth;
          const widgetHeight = EXPLORE_WIDGET_HEIGHTS[cell.widget.size];

          return (
            <View
              key={cell.widget.id}
              style={[
                dashboardStyles.gridCell,
                isSmallRow
                  ? { width: smallWidgetWidth }
                  : dashboardStyles.gridCellFull,
                {
                  height: widgetHeight,
                  minHeight: EXPLORE_WIDGET_MIN_HEIGHTS[cell.widget.size],
                  maxHeight: EXPLORE_WIDGET_MAX_HEIGHTS[cell.widget.size],
                },
              ]}
            >
              {renderWidget({
                widget: cell.widget,
                index: cell.index,
                widgetWidth,
                widgetHeight,
              })}
            </View>
          );
        })}

        {isSmallRow && row.cells.length === 1 && (
          <View style={{ width: smallWidgetWidth }} />
        )}
      </View>
    );
  };

  const renderDashboardHeader = () => (
    <>
      <View style={dashboardStyles.toolbar}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onAddWidget}
          style={dashboardStyles.toolbarButton}
        >
          <Ionicons
            name="add"
            size={17}
            color={isDark ? Colors.white : Colors.black}
          />
          <Text style={dashboardStyles.toolbarButtonText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsEditMode((current) => !current)}
          style={[
            dashboardStyles.toolbarButton,
            isEditMode && dashboardStyles.toolbarButtonSelected,
          ]}
        >
          <Ionicons
            name={isEditMode ? "checkmark" : "create-outline"}
            size={17}
            color={
              isEditMode
                ? isDark
                  ? Colors.black
                  : Colors.white
                : isDark
                  ? Colors.white
                  : Colors.black
            }
          />
          <Text
            style={[
              dashboardStyles.toolbarButtonText,
              isEditMode && dashboardStyles.toolbarButtonTextSelected,
            ]}
          >
            {isEditMode ? "Done" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      {error && hasSelectedGameWidget && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={refresh}
          style={dashboardStyles.errorCard}
        >
          <Text style={dashboardStyles.placeholderTitle}>
            Unable to load widget games
          </Text>
          <Text style={dashboardStyles.placeholderText}>{error}</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <FlatList
      data={widgetRows}
      keyExtractor={(row) => row.id}
      style={dashboardStyles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={dashboardStyles.content}
      renderItem={renderWidgetRow}
      ListHeaderComponent={renderDashboardHeader}
    />
  );
}
