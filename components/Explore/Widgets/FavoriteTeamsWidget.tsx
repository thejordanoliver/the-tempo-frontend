import CustomActivityIndicator from "components/CustomActivityIndicator";
import { EXPLORE_WIDGET_HEIGHTS } from "constants/exploreWidgetSizes";
import { Colors, Fonts } from "constants/styles";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import {
  ExploreFavoriteTeam,
  normalizeExploreFavoriteTeam,
} from "hooks/WidgetHooks/useExploreWidgetGames";
import { useMemo } from "react";
import { ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { ExploreWidgetSize } from "types/widgets";
import { favoriteTeamsList } from "utils/teams";
import FavoriteTeamsSlider, { FavoriteTeamSlide } from "./FavoriteTeamsSlider";
import { WidgetEditControls } from "./WidgetSlider";

type FavoriteTeamsWidgetProps = {
  isDark: boolean;
  size?: ExploreWidgetSize;
  width?: number;
  height?: number;
  containerWidth?: number;
  containerHeight?: number;
  widgetId?: string;
  widgetSize?: ExploreWidgetSize;
  isEditing?: boolean;
  availableSizeOptions?: ExploreWidgetSize[];
  onResizeWidget?: (widgetId: string, size: ExploreWidgetSize) => void;
  onRemoveWidget?: (widgetId: string) => void;
  onMoveWidget?: (widgetId: string, direction: -1 | 1) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

const sizeFallback: Record<ExploreWidgetSize, number> = {
  ...EXPLORE_WIDGET_HEIGHTS,
};

const resolveTeamLogo = (
  favorite: ExploreFavoriteTeam,
  isDark: boolean,
): ImageSourcePropType | undefined => {
  const team = favoriteTeamsList.find(
    (item) =>
      item.league === favorite.league && String(item.id) === favorite.id,
  );

  return isDark ? team?.logoLight || team?.logo : team?.logo;
};

export default function FavoriteTeamsWidget({
  isDark,
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
  const { favorites, isLoading, ready } = useFavoriteTeamsContext();
  const resolvedWidth = Math.max(
    width ?? containerWidth ?? sizeFallback[size],
    1,
  );
  const resolvedHeight = Math.max(
    height ?? containerHeight ?? sizeFallback[size],
    1,
  );
  const compact = size === "small" || resolvedWidth < 240;
  const verticalPadding = compact ? 10 : 14;
  const horizontalPadding = compact ? 10 : 14;
  const bodyWidth = Math.max(resolvedWidth - horizontalPadding * 2, 1);
  const bodyHeight = Math.max(resolvedHeight - verticalPadding * 2, 1);
  const styles = favoriteTeamsWidgetStyles(isDark, compact);
  const showActions = isEditing && widgetId != null;

  const slides = useMemo<FavoriteTeamSlide[]>(
    () =>
      favorites
        .map((favorite) => normalizeExploreFavoriteTeam(favorite))
        .filter((favorite): favorite is ExploreFavoriteTeam =>
          Boolean(favorite),
        )
        .map((favorite) => {
          const team = favoriteTeamsList.find(
            (item) =>
              item.league === favorite.league &&
              String(item.id) === favorite.id,
          );

          return {
            favorite,
            name: team?.name ?? favorite.id,
            fullName: team?.fullName,
            logo: resolveTeamLogo(favorite, isDark),
          };
        }),
    [favorites, isDark],
  );

  const renderContent = () => {
    if (isLoading || !ready) {
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
        width={bodyWidth}
        height={bodyHeight}
        isDark={isDark}
        compact={compact}
      />
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          width: resolvedWidth,
          height: resolvedHeight,
          paddingVertical: verticalPadding,
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      <View style={[styles.body, { width: bodyWidth, height: bodyHeight }]}>
        {renderContent()}
      </View>

      {showActions && widgetId && (
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
  );
}

const favoriteTeamsWidgetStyles = (isDark: boolean, compact: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 8,
      borderColor: Colors.midTone,
      borderWidth: 1,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
      position: "relative",
    },
    body: {
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
    },
    stateCard: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: compact ? 6 : 8,
      padding: compact ? 8 : 12,
    },
    stateTitle: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: compact ? 14 : 16,
      color: isDark ? Colors.white : Colors.black,
    },
    stateText: {
      textAlign: "center",
      fontFamily: Fonts.OSREGULAR,
      fontSize: compact ? 11 : 13,
      lineHeight: compact ? 15 : 18,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
