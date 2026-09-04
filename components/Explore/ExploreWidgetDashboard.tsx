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
import { activeOpacity, Colors } from "constants/styles";
import { useExploreWidgetGames } from "hooks/WidgetHooks/useExploreWidgetGames";
import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  type GestureResponderHandlers,
  PanResponder,
  type PanResponderGestureState,
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
import {
  EXPLORE_WIDGET_GRID_GAP,
  EXPLORE_WIDGET_ROW_GAP,
  WidgetDashboardStyles,
} from "styles/ExploreStyles/WidgetDashboardStyles";
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

const getWidgetGameTimestamp = (slide: WidgetSlide) => {
  const { date, startDate, timestamp } = slide.data;
  const dateTimestamp = Date.parse(startDate || date);

  if (Number.isFinite(dateTimestamp)) {
    return dateTimestamp;
  }

  const numericTimestamp = Number(timestamp);

  if (!Number.isFinite(numericTimestamp)) {
    return 0;
  }

  return numericTimestamp < 1_000_000_000_000
    ? numericTimestamp * 1000
    : numericTimestamp;
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
  dragHandlePanHandlers?: GestureResponderHandlers;
  isDark: boolean;
};

type RenderWidgetGridRowOptions = {
  isEditing: boolean;
  drag?: () => void;
  isActive?: boolean;
};

type SmallGridDragState = {
  widgetId: string;
  fromIndex: number;
  targetIndex: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function WidgetFrame({
  children,
  style,
  isEditing,
  isActive = false,
  onDrag,
  dragHandlePanHandlers,
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
        isEditing ? "Use the reorder handle to move this widget" : undefined
      }
    >
      {children}

      {isEditing && dragHandlePanHandlers && (
        <View
          {...dragHandlePanHandlers}
          accessible
          style={draggableFrameStyles.dragHandle}
          accessibilityRole="button"
          accessibilityLabel="Reorder widget"
          accessibilityHint="Drag to change this widget's position"
        >
          <Ionicons
            name="reorder-three-outline"
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>
      )}

      {isEditing && !dragHandlePanHandlers && onDrag && (
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
  const [smallGridDragState, setSmallGridDragState] =
    useState<SmallGridDragState | null>(null);
  const smallGridDragStateRef = useRef<SmallGridDragState | null>(null);
  const smallGridDragOffset = useRef(new Animated.ValueXY()).current;
  const { width: screenWidth } = useWindowDimensions();
  const styles = exploreStyles(isDark);
  const dashboardStyles = WidgetDashboardStyles(isDark);
  const dashboardWidth = Math.max(screenWidth - 24, 1);
  const gridGap = EXPLORE_WIDGET_GRID_GAP;
  const rowGap = EXPLORE_WIDGET_ROW_GAP;
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
    () =>
      [
        ...nbaGames.map((game) => ({ type: "nba" as const, data: game })),
        ...mlbGames.map((game) => ({ type: "mlb" as const, data: game })),
        ...wnbaGames.map((game) => ({ type: "wnba" as const, data: game })),
        ...cbbGames.map((game) => ({ type: "cbb" as const, data: game })),
        ...wcbbGames.map((game) => ({ type: "wcbb" as const, data: game })),
        ...nflGames.map((game) => ({ type: "nfl" as const, data: game })),
        ...cfbGames.map((game) => ({ type: "cfb" as const, data: game })),
        ...nhlGames.map((game) => ({ type: "nhl" as const, data: game })),
      ].sort(
        (firstGame, secondGame) =>
          getWidgetGameTimestamp(secondGame) -
          getWidgetGameTimestamp(firstGame),
      ),
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
        slides: nbaGames.map((game) => ({ type: "nba", data: game })),
      },
      {
        type: "mlb_games",
        title: "MLB Games",
        slides: mlbGames.map((game) => ({ type: "mlb", data: game })),
      },
      {
        type: "wnba_games",
        title: "WNBA Games",
        slides: wnbaGames.map((game) => ({ type: "wnba", data: game })),
      },
      {
        type: "cbb_games",
        title: "CBB Games",
        slides: cbbGames.map((game) => ({ type: "cbb", data: game })),
      },
      {
        type: "wcbb_games",
        title: "WCBB Games",
        slides: wcbbGames.map((game) => ({ type: "wcbb", data: game })),
      },
      {
        type: "nfl_games",
        title: "NFL Games",
        slides: nflGames.map((game) => ({ type: "nfl", data: game })),
      },
      {
        type: "cfb_games",
        title: "CFB Games",
        slides: cfbGames.map((game) => ({ type: "cfb", data: game })),
      },
      {
        type: "nhl_games",
        title: "NHL Games",
        slides: nhlGames.map((game) => ({ type: "nhl", data: game })),
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
  const canUseSmallWidgetGridDrag = visibleWidgets.every(
    (widget) => widget.size === "small",
  );

  const updateSmallGridDragState = useCallback(
    (nextState: SmallGridDragState | null) => {
      smallGridDragStateRef.current = nextState;
      setSmallGridDragState(nextState);
    },
    [],
  );

  const getSmallGridTargetIndex = useCallback(
    (fromIndex: number, gestureState: PanResponderGestureState) => {
      const rowCount = Math.max(Math.ceil(visibleWidgets.length / 2), 1);
      const rowStride = EXPLORE_WIDGET_HEIGHTS.small + rowGap;
      const startRow = Math.floor(fromIndex / 2);
      const startColumn = fromIndex % 2;
      const startCenterX =
        startColumn === 0
          ? smallWidgetWidth / 2
          : smallWidgetWidth + gridGap + smallWidgetWidth / 2;
      const startCenterY =
        startRow * rowStride + EXPLORE_WIDGET_HEIGHTS.small / 2;
      const movedCenterX = startCenterX + gestureState.dx;
      const movedCenterY = startCenterY + gestureState.dy;
      const targetRow = clamp(
        Math.floor(Math.max(movedCenterY, 0) / rowStride),
        0,
        rowCount - 1,
      );
      const targetColumn = movedCenterX < dashboardWidth / 2 ? 0 : 1;

      return Math.min(targetRow * 2 + targetColumn, visibleWidgets.length - 1);
    },
    [dashboardWidth, gridGap, rowGap, smallWidgetWidth, visibleWidgets.length],
  );

  const finishSmallGridDrag = useCallback(() => {
    const dragState = smallGridDragStateRef.current;

    updateSmallGridDragState(null);
    smallGridDragOffset.setValue({ x: 0, y: 0 });

    if (!dragState || dragState.targetIndex === dragState.fromIndex) return;

    const nextWidgets = visibleWidgets.slice();
    const [movedWidget] = nextWidgets.splice(dragState.fromIndex, 1);

    if (!movedWidget) return;

    nextWidgets.splice(dragState.targetIndex, 0, movedWidget);
    onReorderWidgets(nextWidgets);
  }, [
    onReorderWidgets,
    smallGridDragOffset,
    updateSmallGridDragState,
    visibleWidgets,
  ]);

  const createSmallGridDragHandlers = useCallback(
    (widgetId: string, fromIndex: number) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          smallGridDragOffset.stopAnimation();
          smallGridDragOffset.setValue({ x: 0, y: 0 });
          updateSmallGridDragState({
            widgetId,
            fromIndex,
            targetIndex: fromIndex,
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const currentDragState = smallGridDragStateRef.current;

          if (!currentDragState) return;

          smallGridDragOffset.setValue({
            x: gestureState.dx,
            y: gestureState.dy,
          });

          const targetIndex = getSmallGridTargetIndex(
            currentDragState.fromIndex,
            gestureState,
          );

          if (targetIndex === currentDragState.targetIndex) return;

          updateSmallGridDragState({
            ...currentDragState,
            targetIndex,
          });
        },
        onPanResponderRelease: finishSmallGridDrag,
        onPanResponderTerminate: finishSmallGridDrag,
        onPanResponderTerminationRequest: () => false,
      }).panHandlers,
    [
      finishSmallGridDrag,
      getSmallGridTargetIndex,
      smallGridDragOffset,
      updateSmallGridDragState,
    ],
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
          <WidgetSlider
            games={gameSection.slides}
            loading={gameWidgetsLoading}
            initialHeight={widgetHeight}
            initialWidth={widgetWidth}
            isDark={isDark}
            dashboardMode
            orientation="horizontal"
            {...editProps}
          />
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

  const renderWidgetGridRow = (
    row: DashboardWidgetRow,
    { isEditing, drag, isActive }: RenderWidgetGridRowOptions,
  ) => {
    const isSmallRow = row.cells.every((cell) => cell.widget.size === "small");

    return (
      <View style={dashboardStyles.gridRow}>
        {row.cells.map((cell) => {
          const widgetWidth = isSmallRow ? smallWidgetWidth : dashboardWidth;
          const widgetHeight = EXPLORE_WIDGET_HEIGHTS[cell.widget.size];

          return (
            <WidgetFrame
              key={cell.widget.id}
              isEditing={isEditing}
              isActive={isActive}
              onDrag={drag}
              isDark={isDark}
              style={[
                dashboardStyles.gridCell,
                isSmallRow
                  ? { width: smallWidgetWidth }
                  : dashboardStyles.gridCellFull,
                isEditing && dashboardStyles.draggableCell,
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

  const renderWidgetRow = ({ item: row }: { item: DashboardWidgetRow }) =>
    renderWidgetGridRow(row, { isEditing: false });

  const renderSmallManualGridRow = ({
    item: row,
  }: {
    item: DashboardWidgetRow;
  }) => {
    const isSmallRow = row.cells.every((cell) => cell.widget.size === "small");

    return (
      <View style={dashboardStyles.gridRow}>
        {row.cells.map((cell) => {
          const isActive = smallGridDragState?.widgetId === cell.widget.id;
          const isDropTarget =
            smallGridDragState?.targetIndex === cell.index && !isActive;
          const widgetHeight = EXPLORE_WIDGET_HEIGHTS[cell.widget.size];
          const frame = (
            <WidgetFrame
              key={cell.widget.id}
              isEditing
              isActive={isActive}
              dragHandlePanHandlers={createSmallGridDragHandlers(
                cell.widget.id,
                cell.index,
              )}
              isDark={isDark}
              style={[
                dashboardStyles.gridCell,
                { width: smallWidgetWidth },
                dashboardStyles.draggableCell,
                isDropTarget && draggableFrameStyles.manualDropTarget,
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
                widgetWidth: smallWidgetWidth,
                widgetHeight,
              })}
            </WidgetFrame>
          );

          if (!isActive) return frame;

          return (
            <Animated.View
              key={cell.widget.id}
              style={[
                draggableFrameStyles.manualDragItem,
                { transform: smallGridDragOffset.getTranslateTransform() },
              ]}
            >
              {frame}
            </Animated.View>
          );
        })}

        {isSmallRow && row.cells.length === 1 && (
          <View style={{ width: smallWidgetWidth }} />
        )}
      </View>
    );
  };

  const renderDraggableWidgetRow = ({
    item: row,
    drag,
    isActive,
  }: RenderItemParams<DashboardWidgetRow>) => (
    <ScaleDecorator activeScale={1.015}>
      <ShadowDecorator>
        {renderWidgetGridRow(row, { isEditing: true, drag, isActive })}
      </ShadowDecorator>
    </ScaleDecorator>
  );

  const renderDragPlaceholder = ({
    item: row,
  }: {
    item: DashboardWidgetRow;
  }) => {
    const isSmallRow = row.cells.every((cell) => cell.widget.size === "small");

    return (
      <View style={dashboardStyles.gridRow}>
        {row.cells.map((cell) => (
          <View
            key={cell.widget.id}
            style={[
              dashboardStyles.dropPlaceholder,
              isSmallRow
                ? { width: smallWidgetWidth }
                : dashboardStyles.gridCellFull,
              { height: EXPLORE_WIDGET_HEIGHTS[cell.widget.size] },
            ]}
          >
            <Ionicons
              name="download-outline"
              size={18}
              color={isDark ? Colors.dark.leafGreen : Colors.light.green}
            />
            <Text style={dashboardStyles.dropPlaceholderText}>
              {isSmallRow ? "Drop here" : "Drop widget here"}
            </Text>
          </View>
        ))}

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
    if (canUseSmallWidgetGridDrag) {
      return (
        <FlatList
          key="small-widget-grid"
          data={widgetRows}
          keyExtractor={(row) => row.id}
          style={dashboardStyles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={dashboardStyles.content}
          renderItem={renderSmallManualGridRow}
          ListHeaderComponent={renderDashboardHeader}
          scrollEnabled={!smallGridDragState}
        />
      );
    }

    return (
      <DraggableFlatList
        key="widget-row-grid"
        data={widgetRows}
        keyExtractor={(row) => row.id}
        style={dashboardStyles.scroll}
        containerStyle={dashboardStyles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={dashboardStyles.content}
        renderItem={renderDraggableWidgetRow}
        renderPlaceholder={renderDragPlaceholder}
        ListHeaderComponent={renderDashboardHeader}
        activationDistance={8}
        autoscrollThreshold={96}
        autoscrollSpeed={160}
        dragItemOverflow
        onDragEnd={({ data, from, to }) => {
          if (from === to) return;

          onReorderWidgets(
            data.flatMap((row) => row.cells.map((cell) => cell.widget)),
          );
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
  manualDragItem: {
    zIndex: 80,
  },
  manualDropTarget: {
    opacity: 0.48,
  },
  dragHandle: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 40,
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(127,127,127,0.18)",
  },
});
