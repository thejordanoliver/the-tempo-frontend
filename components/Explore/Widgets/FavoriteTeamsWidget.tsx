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
  availableSizeOptions?: readonly ExploreWidgetSize[];
  onResizeWidget?: (widgetId: string, size: ExploreWidgetSize) => void;
  onRemoveWidget?: (widgetId: string) => void;
  onMoveWidget?: (widgetId: string, direction: -1 | 1) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

type FavoriteTeamsCatalog = ReturnType<
  typeof useFavoriteTeamsContext
>["allTeams"];

const sizeFallback: Record<ExploreWidgetSize, number> = {
  ...EXPLORE_WIDGET_HEIGHTS,
};

const findFavoriteTeam = (
  favorite: ExploreFavoriteTeam,
  allTeams: FavoriteTeamsCatalog,
) =>
  allTeams.find(
    (team) =>
      team.league === favorite.league && String(team.id) === favorite.id,
  );

const resolveTeamLogo = (
  favorite: ExploreFavoriteTeam,
  allTeams: FavoriteTeamsCatalog,
  isDark: boolean,
): ImageSourcePropType | undefined => {
  const team = findFavoriteTeam(favorite, allTeams);

  if (!team) {
    return undefined;
  }

  return isDark ? (team.logoLight ?? team.logo) : team.logo;
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
  const { favorites, isLoading, ready, allTeams } = useFavoriteTeamsContext();

  const resolvedWidth = Math.max(
    width ?? containerWidth ?? sizeFallback[size],
    1,
  );

  const resolvedHeight = Math.max(
    height ?? containerHeight ?? sizeFallback[size],
    1,
  );

  const compact = size === "small" || resolvedWidth < 240;
  const styles = favoriteTeamsWidgetStyles(isDark, compact);
  const showActions = isEditing && Boolean(widgetId);

  const slides = useMemo<FavoriteTeamSlide[]>(
    () =>
      favorites
        .map(normalizeExploreFavoriteTeam)
        .filter(
          (favorite): favorite is ExploreFavoriteTeam => favorite !== null,
        )
        .map((favorite) => {
          const team = findFavoriteTeam(favorite, allTeams);

          return {
            favorite,
            name: team?.name ?? team?.shortName ?? favorite.id,
            fullName:
              team?.fullName ?? team?.name ?? team?.shortName ?? favorite.id,
            logo: resolveTeamLogo(favorite, allTeams, isDark),
          };
        }),
    [allTeams, favorites, isDark],
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
        width={resolvedWidth}
        height={resolvedHeight}
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
        },
      ]}
    >
      <View
        style={[
          styles.body,
          {
            width: resolvedWidth,
            height: resolvedHeight,
          },
        ]}
      >
        {renderContent()}

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
    </View>
  );
}

const favoriteTeamsWidgetStyles = (isDark: boolean, compact: boolean) =>
  StyleSheet.create({
    card: {
      position: "relative",
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
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
      fontFamily: Fonts.MEDIUM,
      fontSize: compact ? 14 : 16,
      color: isDark ? Colors.white : Colors.black,
    },
    stateText: {
      fontFamily: Fonts.REGULAR,
      fontSize: compact ? 11 : 13,
      lineHeight: compact ? 15 : 18,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
  });
