import { Ionicons } from "@expo/vector-icons";
import FavoritesScrollSkeleton from "components/Skeletons/FavoritesScrollSkeleton";
import { LEAGUE_CONFIG } from "constants/leagues";
import { Colors } from "constants/styles";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import DraggableFlatList, {
  type DragEndParams,
} from "react-native-draggable-flatlist";
import { favoritesScrollStyles } from "styles/HomeStyles/FavoritesScrollStyles";
import type {
  FavoriteItem,
  FavoriteLeagueItem,
  FavoriteTeamItem,
} from "types/favorites";
import { isFavoriteLeague } from "types/favorites";
import { getFavoriteBaseTeam } from "utils/favoriteTeams";
import { FavoritesTab } from "./FavoritesTab";

type Props = {
  favoriteTeamIds: string[];
  onFavoritesChange?: (ids: string[]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDark: boolean;
};

export default function FavoritesScroll({
  favoriteTeamIds,
  onFavoritesChange,
  onDragStart,
  onDragEnd,
  isDark,
}: Props) {
  const router = useRouter();
  const styles = favoritesScrollStyles(isDark);
  const lastPlaceholderHapticRef = useRef(0);

  const {
    syncFavorites,
    setFavorites,
    isLoading,
    favoriteSports,
    favoriteSportsLoading,
    favoriteSportsReady,
    userId,
  } = useFavoriteTeamsContext();

  const [railOrder, setRailOrder] = useState<{
    userId: number | null;
    keys: string[];
  }>({ userId, keys: [] });

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

  const leagueData = useMemo<FavoriteLeagueItem[]>(
    () =>
      favoriteSports.map((sport) => {
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
      }),
    [favoriteSports, isDark],
  );

  const availableData = useMemo<FavoriteItem[]>(
    () => [...leagueData, ...teamData],
    [leagueData, teamData],
  );

  const data = useMemo<FavoriteItem[]>(() => {
    const itemsByKey = new Map(availableData.map((item) => [item.key, item]));
    const activeKeys = railOrder.userId === userId ? railOrder.keys : [];
    const ordered = activeKeys.flatMap((key) => {
      const item = itemsByKey.get(key);

      if (!item) {
        return [];
      }

      itemsByKey.delete(key);
      return [item];
    });

    return [...ordered, ...itemsByKey.values()];
  }, [availableData, railOrder, userId]);

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

      setRailOrder({
        userId,
        keys: reordered.map((item) => item.key),
      });

      const orderedTeamFavorites = reordered.flatMap((item) =>
        item.kind === "team" ? [`${item.league}:${item.id}`] : [],
      );
      const teamOrderChanged = orderedTeamFavorites.some(
        (favorite, index) => favorite !== favoriteTeamIds[index],
      ) || orderedTeamFavorites.length !== favoriteTeamIds.length;

      if (teamOrderChanged) {
        setFavorites(orderedTeamFavorites);
        onFavoritesChange?.(orderedTeamFavorites);
        void syncFavorites(orderedTeamFavorites);
      }

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [
      favoriteTeamIds,
      onDragEnd,
      onFavoritesChange,
      setFavorites,
      syncFavorites,
      userId,
    ],
  );

  const favoritesLoading =
    isLoading || (favoriteSportsLoading && !favoriteSportsReady);

  if (favoritesLoading) {
    return <FavoritesScrollSkeleton isDark={isDark} />;
  }

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
      renderItem={FavoritesTab}
      onDragBegin={handleDragBegin}
      onPlaceholderIndexChange={handlePlaceholderChange}
      onDragEnd={handleDragEnd}
      renderPlaceholder={() => (
        <View style={styles.dragPlaceholder}>
          <View style={styles.dragPlaceholderCircle} />
        </View>
      )}
      ListFooterComponent={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit favorites"
          onPress={() => {
            void Haptics.selectionAsync();

            router.push("/edit-favorites");
          }}
          style={styles.tabContainer}
        >
          <View style={styles.editIcon}>
            <Ionicons
              name={data.length === 0 ? "add" : "create"}
              size={28}
              color={isDark ? Colors.dark.background : Colors.light.background}
            />
          </View>

          <View style={styles.labelContainer}>
            <Text style={styles.tabLabel}>
              {data.length === 0 ? "Add favorites" : "Edit"}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}
