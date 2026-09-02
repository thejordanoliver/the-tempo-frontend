import { Ionicons } from "@expo/vector-icons";
import FavoritesScrollSkeleton from "components/Skeletons/FavoritesScrollSkeleton";
import { LEAGUE_CONFIG } from "constants/leagues";
import { Colors } from "constants/styles";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import DraggableFlatList, {
  type DragEndParams,
  type DraggableFlatListProps,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  FAVORITES_RAIL_GAP,
  FAVORITES_RAIL_HORIZONTAL_PADDING,
  FAVORITES_RAIL_ITEM_WIDTH,
  FavoritesScrollStyles,
} from "styles/HomeStyles/FavoritesScrollStyles";
import type {
  FavoriteItem,
  FavoriteLeagueItem,
  FavoriteTeamKey,
  FavoriteTeamItem,
} from "types/favorites";
import {
  groupFavoriteRailItems,
  isFavoriteLeague,
  resolvePersistedFavoriteRailKeys,
  splitFavoriteRailOrder,
} from "types/favorites";
import { getFavoriteBaseTeam } from "utils/favoriteTeams";
import { FavoritesTab } from "./FavoritesTab";

type Props = {
  favoriteTeamIds: FavoriteTeamKey[];
  onFavoritesChange?: (ids: FavoriteTeamKey[]) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  isDark: boolean;
};

const FAVORITES_SNAP_ANIMATION = {
  damping: 24,
  stiffness: 320,
  mass: 0.3,
  overshootClamping: true,
  restDisplacementThreshold: 0.25,
  restSpeedThreshold: 2,
};

type FavoriteDragAnimationValues = Parameters<
  NonNullable<DraggableFlatListProps<FavoriteItem>["onAnimValInit"]>
>[0];

type FavoriteDragBoundaryProps = {
  animationValues: FavoriteDragAnimationValues;
  favoriteCount: number;
  leagueCount: number;
};

function FavoriteDragBoundary({
  animationValues,
  favoriteCount,
  leagueCount,
}: FavoriteDragBoundaryProps) {
  const {
    activeCellSize,
    activeIndexAnim,
    autoScrollDistance,
    spacerIndexAnim,
    touchTranslate,
  } = animationValues;

  useAnimatedReaction(
    () => ({
      activeIndex: activeIndexAnim.value,
      translatedDistance:
        touchTranslate.value + autoScrollDistance.value,
    }),
    ({ activeIndex, translatedDistance }) => {
      if (activeIndex < 0 || favoriteCount === 0) {
        return;
      }

      const draggingLeague = activeIndex < leagueCount;
      const minimumIndex = draggingLeague ? 0 : leagueCount;
      const maximumIndex = draggingLeague
        ? leagueCount - 1
        : favoriteCount - 1;
      const itemStep = activeCellSize.value + FAVORITES_RAIL_GAP;
      const minimumTranslation = (minimumIndex - activeIndex) * itemStep;
      const maximumTranslation = (maximumIndex - activeIndex) * itemStep;
      const boundedTranslation = Math.min(
        maximumTranslation,
        Math.max(minimumTranslation, translatedDistance),
      );

      if (spacerIndexAnim.value < minimumIndex) {
        spacerIndexAnim.value = minimumIndex;
      } else if (spacerIndexAnim.value > maximumIndex) {
        spacerIndexAnim.value = maximumIndex;
      }

      if (boundedTranslation !== translatedDistance) {
        touchTranslate.value =
          boundedTranslation - autoScrollDistance.value;
      }
    },
    [favoriteCount, leagueCount],
  );

  return null;
}

type FavoriteSectionDividerProps = {
  animationValues: FavoriteDragAnimationValues;
  leagueCount: number;
  style: StyleProp<ViewStyle>;
};

function FavoriteSectionDivider({
  animationValues,
  leagueCount,
  style,
}: FavoriteSectionDividerProps) {
  const dividerContentPosition =
    FAVORITES_RAIL_HORIZONTAL_PADDING +
    leagueCount * (FAVORITES_RAIL_ITEM_WIDTH + FAVORITES_RAIL_GAP) -
    FAVORITES_RAIL_GAP / 2;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -animationValues.scrollOffset.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { left: dividerContentPosition }, animatedStyle]}
    />
  );
}

function FavoritesScrollComponent({
  favoriteTeamIds,
  onFavoritesChange,
  onInteractionStart,
  onInteractionEnd,
  isDark,
}: Props) {
  const router = useRouter();

  /**
   * Don't recreate the entire StyleSheet object on every render.
   */
  const styles = useMemo(() => FavoritesScrollStyles(isDark), [isDark]);

  const lastPlaceholderHapticRef = useRef(0);
  const latestReorderIdRef = useRef(0);
  const reorderQueueRef = useRef<Promise<void>>(Promise.resolve());
  const interactionActiveRef = useRef(false);
  const [dragAnimationValues, setDragAnimationValues] =
    useState<FavoriteDragAnimationValues | null>(null);

  const {
    syncFavorites,
    setFavorites,
    isLoading,
    favoriteSports,
    favoriteSportsLoading,
    favoriteSportsReady,
    updateFavoriteSports,
    userId,
  } = useFavoriteTeamsContext();

  const [railOrder, setRailOrder] = useState<{
    userId: number | null;
    keys: string[];
  }>({
    userId,
    keys: [],
  });

  /* -------------------------------------------------------------------------- */
  /*                                 Team data                                  */
  /* -------------------------------------------------------------------------- */

  const teamData = useMemo<FavoriteTeamItem[]>(() => {
    return favoriteTeamIds.reduce<FavoriteTeamItem[]>((teams, favorite) => {
      const separatorIndex = favorite.indexOf(":");

      if (separatorIndex === -1) {
        return teams;
      }

      const league = favorite.slice(0, separatorIndex);

      const favoriteId = favorite.slice(separatorIndex + 1);

      if (!isFavoriteLeague(league) || !favoriteId) {
        return teams;
      }

      const baseTeam = getFavoriteBaseTeam(league, favoriteId);

      if (!baseTeam) {
        return teams;
      }

      teams.push({
        ...baseTeam,
        kind: "team",
        id: favoriteId,
        code: baseTeam.code ?? "",
        league,
        key: `${league}:${favoriteId}`,
        color: baseTeam.color ?? undefined,
        isDark,
      });

      return teams;
    }, []);
  }, [favoriteTeamIds, isDark]);

  /* -------------------------------------------------------------------------- */
  /*                                League data                                 */
  /* -------------------------------------------------------------------------- */

  const leagueData = useMemo<FavoriteLeagueItem[]>(() => {
    return favoriteSports.map((sport) => {
      const config = LEAGUE_CONFIG[sport];

      return {
        kind: "league",
        id: sport,
        league: sport,
        name: config.label,
        logo: config.logoLight,
        color: config.color,
        key: `league:${sport}`,
        isDark,
      };
    });
  }, [favoriteSports, isDark]);

  /* -------------------------------------------------------------------------- */
  /*                              Available items                               */
  /* -------------------------------------------------------------------------- */

  const availableData = useMemo<FavoriteItem[]>(
    () => [...leagueData, ...teamData],
    [leagueData, teamData],
  );

  /* -------------------------------------------------------------------------- */
  /*                                Rail order                                  */
  /* -------------------------------------------------------------------------- */

  const data = useMemo<FavoriteItem[]>(() => {
    if (!availableData.length) {
      return [];
    }

    const itemsByKey = new Map(availableData.map((item) => [item.key, item]));

    const activeKeys = railOrder.userId === userId ? railOrder.keys : [];

    const ordered: FavoriteItem[] = [];

    for (const key of activeKeys) {
      const item = itemsByKey.get(key);

      if (!item) {
        continue;
      }

      ordered.push(item);
      itemsByKey.delete(key);
    }

    return groupFavoriteRailItems([...ordered, ...itemsByKey.values()]);
  }, [availableData, railOrder, userId]);

  /* -------------------------------------------------------------------------- */
  /*                              Interaction                                   */
  /* -------------------------------------------------------------------------- */

  const handleInteractionStart = useCallback(() => {
    if (interactionActiveRef.current) {
      return;
    }

    interactionActiveRef.current = true;
    onInteractionStart?.();
  }, [onInteractionStart]);

  const handleInteractionEnd = useCallback(() => {
    if (!interactionActiveRef.current) {
      return;
    }

    interactionActiveRef.current = false;
    onInteractionEnd?.();
  }, [onInteractionEnd]);

  useEffect(() => handleInteractionEnd, [handleInteractionEnd]);

  /* -------------------------------------------------------------------------- */
  /*                                   Drag                                     */
  /* -------------------------------------------------------------------------- */

  const handleDragBegin = useCallback(() => {
    handleInteractionStart();

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [handleInteractionStart]);

  const handleAnimationValuesInit = useCallback(
    (animationValues: FavoriteDragAnimationValues) => {
      setDragAnimationValues(animationValues);
    },
    [],
  );

  const handlePlaceholderChange = useCallback(() => {
    const now = Date.now();

    if (now - lastPlaceholderHapticRef.current < 70) {
      return;
    }

    lastPlaceholderHapticRef.current = now;

    void Haptics.selectionAsync();
  }, []);

  const handleDragEnd = useCallback(
    ({ data: draggedOrder, from, to }: DragEndParams<FavoriteItem>) => {
      handleInteractionEnd();

      if (from === to) {
        return;
      }

      const reordered = groupFavoriteRailItems(draggedOrder);
      const reorderId = ++latestReorderIdRef.current;
      const orderedKeys = reordered.map((item) => item.key);

      setRailOrder({
        userId,
        keys: orderedKeys,
      });

      const {
        favoriteTeamIds: orderedTeamFavorites,
        favoriteSports: orderedFavoriteSports,
      } = splitFavoriteRailOrder(reordered);

      const teamOrderChanged =
        orderedTeamFavorites.length !== favoriteTeamIds.length ||
        orderedTeamFavorites.some(
          (favorite, index) => favorite !== favoriteTeamIds[index],
        );

      if (teamOrderChanged) {
        setFavorites(orderedTeamFavorites);

        onFavoritesChange?.(orderedTeamFavorites);
      }

      const sportOrderChanged =
        orderedFavoriteSports.length !== favoriteSports.length ||
        orderedFavoriteSports.some(
          (sport, index) => sport !== favoriteSports[index],
        );

      const persistReorder = async () => {
        const [teamOrderSaved, sportOrderSaved] = await Promise.all([
          teamOrderChanged
            ? syncFavorites(orderedTeamFavorites)
            : Promise.resolve(true),
          sportOrderChanged
            ? updateFavoriteSports(orderedFavoriteSports)
            : Promise.resolve(true),
        ]);

        if (reorderId !== latestReorderIdRef.current) {
          return;
        }

        if (teamOrderSaved && sportOrderSaved) {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          return;
        }

        const persistedKeys = resolvePersistedFavoriteRailKeys(
          orderedKeys,
          favoriteTeamIds,
          favoriteSports,
          teamOrderSaved,
          sportOrderSaved,
        );

        setRailOrder({
          userId,
          keys: persistedKeys,
        });

        if (!teamOrderSaved) {
          setFavorites(favoriteTeamIds);
          onFavoritesChange?.(favoriteTeamIds);
        }

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      };

      reorderQueueRef.current = reorderQueueRef.current.then(
        persistReorder,
        persistReorder,
      );
    },
    [
      favoriteSports,
      favoriteTeamIds,
      handleInteractionEnd,
      onFavoritesChange,
      setFavorites,
      syncFavorites,
      updateFavoriteSports,
      userId,
    ],
  );

  /* -------------------------------------------------------------------------- */
  /*                              Stable renders                                */
  /* -------------------------------------------------------------------------- */

  const renderItem = useCallback(
    (props: RenderItemParams<FavoriteItem>) => <FavoritesTab {...props} />,
    [],
  );

  const renderPlaceholder = useCallback(() => {
    return (
      <View style={styles.dragPlaceholder}>
        <View style={styles.dragPlaceholderCircle} />
      </View>
    );
  }, [styles]);

  const handleEditFavorites = useCallback(() => {
    void Haptics.selectionAsync();

    router.push("/edit-favorites");
  }, [router]);

  const renderFooter = useCallback(() => {
    const hasFavorites = data.length > 0;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit favorites"
        onPress={handleEditFavorites}
        style={styles.tabContainer}
      >
        <View style={styles.editIcon}>
          <Ionicons
            name={hasFavorites ? "create" : "add"}
            size={28}
            color={isDark ? Colors.dark.background : Colors.light.background}
          />
        </View>

        <View style={styles.labelContainer}>
          <Text style={styles.tabLabel}>
            {hasFavorites ? "Edit" : "Add favorites"}
          </Text>
        </View>
      </Pressable>
    );
  }, [data.length, handleEditFavorites, isDark, styles]);

  /* -------------------------------------------------------------------------- */
  /*                                  Loading                                   */
  /* -------------------------------------------------------------------------- */

  const favoritesLoading =
    isLoading || (favoriteSportsLoading && !favoriteSportsReady);

  if (favoritesLoading) {
    return <FavoritesScrollSkeleton isDark={isDark} />;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <View style={styles.railContainer}>
      {dragAnimationValues && (
        <FavoriteDragBoundary
          animationValues={dragAnimationValues}
          favoriteCount={data.length}
          leagueCount={leagueData.length}
        />
      )}

      {dragAnimationValues &&
        leagueData.length > 0 &&
        teamData.length > 0 && (
          <FavoriteSectionDivider
            animationValues={dragAnimationValues}
            leagueCount={leagueData.length}
            style={styles.sectionDivider}
          />
        )}

      <DraggableFlatList
        data={data}
        horizontal
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        activationDistance={8}
        autoscrollThreshold={56}
        autoscrollSpeed={180}
        dragItemOverflow={false}
        animationConfig={FAVORITES_SNAP_ANIMATION}
        renderItem={renderItem}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onTouchCancel={handleInteractionEnd}
        onScrollBeginDrag={handleInteractionStart}
        onScrollEndDrag={handleInteractionEnd}
        onDragBegin={handleDragBegin}
        onRelease={handleInteractionEnd}
        onPlaceholderIndexChange={handlePlaceholderChange}
        onDragEnd={handleDragEnd}
        onAnimValInit={handleAnimationValuesInit}
        renderPlaceholder={renderPlaceholder}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

/**
 * Prevent parent rerenders from rerendering FavoritesScroll
 * when none of its actual props changed.
 */
const FavoritesScroll = memo(FavoritesScrollComponent, (previous, next) => {
  return (
    previous.isDark === next.isDark &&
    previous.onFavoritesChange === next.onFavoritesChange &&
    previous.onInteractionStart === next.onInteractionStart &&
    previous.onInteractionEnd === next.onInteractionEnd &&
    previous.favoriteTeamIds.length === next.favoriteTeamIds.length &&
    previous.favoriteTeamIds.every(
      (favorite, index) => favorite === next.favoriteTeamIds[index],
    )
  );
});

export default FavoritesScroll;
