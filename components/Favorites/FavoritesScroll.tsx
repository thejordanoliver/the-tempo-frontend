import { Ionicons } from "@expo/vector-icons";
import FavoritesScrollSkeleton from "components/Skeletons/FavoritesScrollSkeleton";
import { LEAGUE_CONFIG } from "constants/leagues";
import { Colors } from "constants/styles";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import DraggableFlatList, {
  type DragEndParams,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import { FavoritesScrollStyles } from "styles/HomeStyles/FavoritesScrollStyles";
import type {
  FavoriteItem,
  FavoriteLeagueItem,
  FavoriteTeamKey,
  FavoriteTeamItem,
} from "types/favorites";
import {
  isFavoriteLeague,
  resolvePersistedFavoriteRailKeys,
  splitFavoriteRailOrder,
} from "types/favorites";
import { getFavoriteBaseTeam } from "utils/favoriteTeams";
import { FavoritesTab } from "./FavoritesTab";

type Props = {
  favoriteTeamIds: FavoriteTeamKey[];
  onFavoritesChange?: (ids: FavoriteTeamKey[]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDark: boolean;
};

function FavoritesScrollComponent({
  favoriteTeamIds,
  onFavoritesChange,
  onDragStart,
  onDragEnd,
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

    return [...ordered, ...itemsByKey.values()];
  }, [availableData, railOrder, userId]);

  /* -------------------------------------------------------------------------- */
  /*                                   Drag                                     */
  /* -------------------------------------------------------------------------- */

  const handleDragBegin = useCallback(() => {
    onDragStart?.();

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [onDragStart]);

  const handlePlaceholderChange = useCallback(() => {
    const now = Date.now();

    if (now - lastPlaceholderHapticRef.current < 70) {
      return;
    }

    lastPlaceholderHapticRef.current = now;

    void Haptics.selectionAsync();
  }, []);

  const handleDragEnd = useCallback(
    ({ data: reordered, from, to }: DragEndParams<FavoriteItem>) => {
      onDragEnd?.();

      if (from === to) {
        return;
      }

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
      onDragEnd,
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

  const renderItem = useCallback((props: RenderItemParams<FavoriteItem>) => {
    return <FavoritesTab {...props} />;
  }, []);

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
    <DraggableFlatList
      data={data}
      horizontal
      keyExtractor={(item) => item.key}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.favorites}
      activationDistance={8}
      autoscrollThreshold={56}
      autoscrollSpeed={180}
      dragItemOverflow
      animationConfig={{
        damping: 18,
        stiffness: 220,
        mass: 0.35,
      }}
      renderItem={renderItem}
      onDragBegin={handleDragBegin}
      onPlaceholderIndexChange={handlePlaceholderChange}
      onDragEnd={handleDragEnd}
      renderPlaceholder={renderPlaceholder}
      ListFooterComponent={renderFooter}
    />
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
    previous.onDragStart === next.onDragStart &&
    previous.onDragEnd === next.onDragEnd &&
    previous.favoriteTeamIds.length === next.favoriteTeamIds.length &&
    previous.favoriteTeamIds.every(
      (favorite, index) => favorite === next.favoriteTeamIds[index],
    )
  );
});

export default FavoritesScroll;
