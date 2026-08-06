import { Ionicons } from "@expo/vector-icons";
import {
  EXPLORE_WIDGET_HEIGHTS,
  EXPLORE_WIDGET_MAX_HEIGHTS,
  EXPLORE_WIDGET_MIN_HEIGHTS,
} from "constants/exploreWidgetSizes";
import {
  EXPLORE_WIDGET_EMPTY_COPY,
  getWidgetOption,
  getWidgetSizeOptions,
  isGameWidgetType,
} from "constants/exploreWidgets";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { activeOpacity, Colors } from "constants/styles";
import { useExploreWidgetGames } from "hooks/WidgetHooks/useExploreWidgetGames";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  FlatList,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
  ShadowDecorator,
} from "react-native-draggable-flatlist";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import { widgetDashboardStyles } from "styles/ExploreStyles/WidgetDashboardStyles";
import {
  ExploreWidgetConfig,
  ExploreWidgetSize,
  ExploreWidgetType,
} from "types/widgets";
import { buildWidgetRows, DashboardWidgetRow } from "utils/exploreWidgetLayout";
import FavoriteTeamsWidget from "./Widgets/FavoriteTeamsWidget";
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
  onReorderWidgets: (widgets: ExploreWidgetConfig[]) => void;
};

type GameWidgetSection = {
  type: ExploreWidgetType;
  title: string;
  slides: WidgetSlide[];
};

type WidgetEditProps = {
  widgetId: string;
  widgetSize: ExploreWidgetSize;
  isEditing: boolean;
  availableSizeOptions: readonly ExploreWidgetSize[];
  onResizeWidget: (widgetId: string, size: ExploreWidgetSize) => void;
  onRemoveWidget: (widgetId: string) => void;
  onMoveWidget: (widgetId: string, direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  placeholderHeight?: number;
};

type WidgetFrameProps = {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  isEditing: boolean;
  isActive?: boolean;
  onDrag?: () => void;
  isDark: boolean;
};

function WidgetFrame({
  children,
  style,
  isEditing,
  isActive = false,
  onDrag,
  isDark,
}: WidgetFrameProps) {
  return (
    <View
      style={[
        style,
        isEditing && draggableFrameStyles.dragEnabled,
        isActive && draggableFrameStyles.dragActive,
      ]}
      accessibilityHint={
        isEditing ? "Long press the reorder handle to move this widget" : undefined
      }
    >
      {children}

      {isEditing && onDrag && (
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onLongPress={onDrag}
          delayLongPress={120}
          style={draggableFrameStyles.dragHandle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Reorder widget"
          accessibilityHint="Long press and drag to change this widget's position"
        >
          <Ionicons
            name="reorder-three-outline"
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ExploreWidgetDashboard({
  isDark,
  selectedWidgets,
  onAddWidget,
  onRemoveWidget,
  onResizeWidget,
  onMoveWidget,
  onReorderWidgets,
}: ExploreWidgetDashboardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const styles = exploreStyles(isDark);
  const dashboardStyles = widgetDashboardStyles(isDark);
  const dashboardWidth = Math.max(screenWidth - 24, 1);
  const gridGap = 12;
  const smallWidgetWidth = Math.max((dashboardWidth - gridGap) / 2, 1);
  const visibleWidgets = useMemo(
    () =>
      selectedWidgets
        .filter((widget) => Boolean(getWidgetOption(widget.type)))
        .slice()
        .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt),
    [selectedWidgets],
  );
  const selectedGameWidgetTypes = useMemo(
    () => visibleWidgets.map((widget) => widget.type).filter(isGameWidgetType),
    [visibleWidgets],
  );
  const {
    nbaGames,
    mlbGames,
    wnbaGames,
    cbbGames,
    wcbbGames,
    nflGames,
    cfbGames,
    nhlGames,
    loading: gameWidgetsLoading,
    error,
    refresh,
  } = useExploreWidgetGames({
    enabledWidgetTypes: selectedGameWidgetTypes,
  });

  const favoriteGameSlides: WidgetSlide[] = useMemo(
    () => [
      ...nbaGames.map((game) => ({ type: "NBA" as const, data: game })),
      ...mlbGames.map((game) => ({ type: "MLB" as const, data: game })),
      ...wnbaGames.map((game) => ({ type: "WNBA" as const, data: game })),
      ...cbbGames.map((game) => ({ type: "CBB" as const, data: game })),
      ...wcbbGames.map((game) => ({ type: "WCBB" as const, data: game })),
      ...nflGames.map((game) => ({ type: "NFL" as const, data: game })),
      ...cfbGames.map((game) => ({ type: "CFB" as const, data: game })),
      ...nhlGames.map((game) => ({ type: "NHL" as const, data: game })),
    ],
    [
      cbbGames,
      cfbGames,
      mlbGames,
      nbaGames,
      nflGames,
      nhlGames,
      wcbbGames,
      wnbaGames,
    ],
  );
  const gameSections: GameWidgetSection[] = useMemo(
    () => [
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
        type: "mlb_games",
        title: "MLB Games",
        slides: mlbGames.map((game) => ({ type: "MLB", data: game })),
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
        type: "nfl_games",
        title: "NFL Games",
        slides: nflGames.map((game) => ({ type: "NFL", data: game })),
      },
      {
        type: "cfb_games",
        title: "CFB Games",
        slides: cfbGames.map((game) => ({ type: "CFB", data: game })),
      },
      {
        type: "nhl_games",
        title: "NHL Games",
        slides: nhlGames.map((game) => ({ type: "NHL", data: game })),
      },
    ],
    [
      cbbGames,
      cfbGames,
      favoriteGameSlides,
      mlbGames,
      nbaGames,
      nflGames,
      nhlGames,
      wcbbGames,
      wnbaGames,
    ],
  );
  const widgetRows = useMemo(
    () => buildWidgetRows(visibleWidgets),
    [visibleWidgets],
  );
  const hasSelectedGameWidget = selectedGameWidgetTypes.length > 0;

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
        Add game cards and favorite-team shortcuts.
      </Text>
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onAddWidget}
        style={dashboardStyles.cta}
        accessibilityRole="button"
        accessibilityLabel="Add your first widget"
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
        {EXPLORE_WIDGET_EMPTY_COPY[type] ??
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

  const renderLoadingCard = (height: number) => (
    <View style={[dashboardStyles.loadingCard, { height }]}>
      <CustomActivityIndicator />
    </View>
  );

  if (visibleWidgets.length === 0) {
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
      availableSizeOptions: getWidgetSizeOptions(widget.type),
      onResizeWidget,
      onRemoveWidget,
      onMoveWidget,
      canMoveUp: index > 0,
      canMoveDown: index < visibleWidgets.length - 1,
    };

    if (gameSection) {
      return (
        <View style={dashboardStyles.section}>
          {gameWidgetsLoading ? (
            renderLoadingCard(widgetHeight)
          ) : gameSection.slides.length > 0 ? (
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
            <WidgetFrame
              key={cell.widget.id}
              isEditing={false}
              isDark={isDark}
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
            </WidgetFrame>
          );
        })}

        {isSmallRow && row.cells.length === 1 && (
          <View style={{ width: smallWidgetWidth }} />
        )}
      </View>
    );
  };

  const renderDraggableWidget = ({
    item: widget,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<ExploreWidgetConfig>) => {
    const index = getIndex() ?? 0;
    const isSmallWidget = widget.size === "small";
    const widgetWidth = isSmallWidget ? smallWidgetWidth : dashboardWidth;
    const widgetHeight = EXPLORE_WIDGET_HEIGHTS[widget.size];

    return (
      <ScaleDecorator activeScale={1.015}>
        <ShadowDecorator>
          <WidgetFrame
            isEditing
            isActive={isActive}
            onDrag={drag}
            isDark={isDark}
            style={[
              dashboardStyles.gridCell,
              isSmallWidget
                ? { width: smallWidgetWidth }
                : dashboardStyles.gridCellFull,
              dashboardStyles.draggableCell,
              {
                height: widgetHeight,
                minHeight: EXPLORE_WIDGET_MIN_HEIGHTS[widget.size],
                maxHeight: EXPLORE_WIDGET_MAX_HEIGHTS[widget.size],
              },
            ]}
          >
            {renderWidget({
              widget,
              index,
              widgetWidth,
              widgetHeight,
            })}
          </WidgetFrame>
        </ShadowDecorator>
      </ScaleDecorator>
    );
  };

  const renderDragPlaceholder = ({ item }: { item: ExploreWidgetConfig }) => {
    const isSmallWidget = item.size === "small";

    return (
      <View
        style={[
          dashboardStyles.dropPlaceholder,
          isSmallWidget
            ? { width: smallWidgetWidth }
            : dashboardStyles.gridCellFull,
          { height: EXPLORE_WIDGET_HEIGHTS[item.size] },
        ]}
      >
        <Ionicons
          name="download-outline"
          size={18}
          color={isDark ? Colors.dark.leafGreen : Colors.light.green}
        />
        <Text style={dashboardStyles.dropPlaceholderText}>
          Drop widget here
        </Text>
      </View>
    );
  };

  const renderDashboardHeader = () => (
    <>
      <View style={dashboardStyles.toolbar}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={onAddWidget}
          style={dashboardStyles.toolbarButton}
          accessibilityRole="button"
          accessibilityLabel="Add widget"
        >
          <Ionicons
            name="add"
            size={17}
            color={isDark ? Colors.white : Colors.black}
          />
          <Text style={dashboardStyles.toolbarButtonText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => setIsEditMode((current) => !current)}
          style={[
            dashboardStyles.toolbarButton,
            isEditMode && dashboardStyles.toolbarButtonSelected,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            isEditMode ? "Finish editing widgets" : "Edit widgets"
          }
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
          activeOpacity={activeOpacity}
          onPress={refresh}
          style={dashboardStyles.errorCard}
          accessibilityRole="button"
          accessibilityLabel="Retry loading widget games"
        >
          <Text style={dashboardStyles.placeholderTitle}>
            Unable to load widget games
          </Text>
          <Text style={dashboardStyles.placeholderText}>{error}</Text>
        </TouchableOpacity>
      )}
    </>
  );

  if (isEditMode) {
    return (
      <DraggableFlatList
        data={visibleWidgets}
        keyExtractor={(widget) => widget.id}
        style={dashboardStyles.scroll}
        containerStyle={dashboardStyles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={dashboardStyles.content}
        renderItem={renderDraggableWidget}
        renderPlaceholder={renderDragPlaceholder}
        ListHeaderComponent={renderDashboardHeader}
        activationDistance={8}
        autoscrollThreshold={96}
        autoscrollSpeed={160}
        dragItemOverflow
        onDragEnd={({ data }) => {
          onReorderWidgets(data);
        }}
      />
    );
  }

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

const draggableFrameStyles = StyleSheet.create({
  dragEnabled: {
    zIndex: 20,
  },
  dragActive: {
    opacity: 0.94,
  },
  dragHandle: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 40,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(127,127,127,0.18)",
  },
});
