import { Ionicons } from "@expo/vector-icons";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { EXPLORE_WIDGET_HEIGHTS } from "constants/exploreWidgetSizes";
import { Colors } from "constants/styles";
import { BlurView } from "expo-blur";
import { useFavoriteTeamsWidget } from "hooks/ExploreHooks/useFavoriteTeamsWidget";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { favoriteTeamsWidgetStyles } from "styles/ExploreStyles/FavoriteTeamsWidgetStyles";
import type { ExploreWidgetSize } from "types/widgets";
import FavoriteTeamsSettingsModal from "../FavoriteTeamsSettingsModal";
import FavoriteTeamsSlider from "./FavoriteTeamsSlider";
import { WidgetEditControls } from "./WidgetSlider";

type FavoriteTeamsWidgetProps = {
  isDark: boolean;
  autoPlay: boolean;
  onChangeAutoPlay: (autoPlay: boolean) => void;
  size?: ExploreWidgetSize;
  width?: number;
  height?: number;
  containerWidth?: number;
  containerHeight?: number;
  widgetId?: string;
  widgetSize?: ExploreWidgetSize;
  isEditing?: boolean;
  availableSizeOptions?: readonly ExploreWidgetSize[];
  onResizeWidget?: (widgetId: string, size: ExploreWidgetSize) => void;
  onRemoveWidget?: (widgetId: string) => void;
  onMoveWidget?: (widgetId: string, direction: -1 | 1) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

export default function FavoriteTeamsWidget({
  isDark,
  autoPlay,
  onChangeAutoPlay,
  size = "medium",
  width,
  height,
  containerWidth,
  containerHeight,
  widgetId,
  widgetSize = size,
  isEditing = false,
  availableSizeOptions,
  onResizeWidget,
  onRemoveWidget,
  onMoveWidget,
  canMoveUp,
  canMoveDown,
}: FavoriteTeamsWidgetProps) {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { slides, isLoading } = useFavoriteTeamsWidget(isDark);

  const resolvedWidth = Math.max(
    width ?? containerWidth ?? EXPLORE_WIDGET_HEIGHTS[size],
    1,
  );

  const resolvedHeight = Math.max(
    height ?? containerHeight ?? EXPLORE_WIDGET_HEIGHTS[size],
    1,
  );

  const compact = size === "small" || resolvedWidth < 240;

  const styles = useMemo(
    () => favoriteTeamsWidgetStyles(isDark, compact),
    [compact, isDark],
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.stateCard}>
          <CustomActivityIndicator />
        </View>
      );
    }

    if (slides.length === 0) {
      return (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle} numberOfLines={1}>
            No teams saved
          </Text>

          <Text style={styles.stateText}>
            Add favorite teams to show shortcuts here.
          </Text>
        </View>
      );
    }

    return (
      <FavoriteTeamsSlider
        teams={slides}
        width={resolvedWidth}
        height={resolvedHeight}
        isDark={isDark}
        compact={compact}
        autoPlay={autoPlay}
        disabled={isEditing}
      />
    );
  };

  const dimensions = { width: resolvedWidth, height: resolvedHeight };

  return (
    <>
      <BlurView
        style={[styles.card, dimensions]}
        intensity={100}
        tint={isDark ? "dark" : "light"}
      >
        <View style={[styles.body, dimensions]}>
          {renderContent()}

          {!isEditing && (
            <Pressable
              onPress={() => setSettingsVisible(true)}
              style={styles.settingsButton}
              accessibilityRole="button"
              accessibilityLabel="Favorite teams settings"
            >
              <BlurView intensity={100} style={StyleSheet.absoluteFill} />
              <Ionicons
                name="options-outline"
                size={17}
                color={isDark ? Colors.white : Colors.black}
              />
            </Pressable>
          )}

          {isEditing && widgetId && (
            <WidgetEditControls
              isDark={isDark}
              widgetId={widgetId}
              widgetSize={widgetSize}
              availableSizeOptions={availableSizeOptions}
              onResizeWidget={onResizeWidget}
              onRemoveWidget={onRemoveWidget}
              onMoveWidget={onMoveWidget}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              compact={compact}
            />
          )}
        </View>
      </BlurView>
      <FavoriteTeamsSettingsModal
        visible={settingsVisible}
        isDark={isDark}
        autoPlay={autoPlay}
        onChangeAutoPlay={onChangeAutoPlay}
        onClose={() => setSettingsVisible(false)}
      />
    </>
  );
}
