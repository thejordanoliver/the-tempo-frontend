import { Ionicons } from "@expo/vector-icons";
import FavoritesScrollSkeleton from "components/Skeletons/FavoritesScrollSkeleton";
import { LEAGUE_CONFIG } from "constants/leagues";
import { Colors } from "constants/styles";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import {
  FAVORITES_RAIL_CELL_WIDTH,
  FavoritesScrollStyles,
} from "styles/HomeStyles/FavoritesScrollStyles";
import {
  isFavoriteLeague,
  type FavoriteItem,
  type FavoriteLeagueItem,
  type FavoriteTeamItem,
} from "types/favorites";
import {
  getFavoriteBaseTeam,
  getFavoriteTeamRoute,
} from "utils/favorites/favoriteTeams";
import { FavoritesTab } from "./FavoritesTab";

type Props = {
  isDark: boolean;
  onInteractionChange: (interacting: boolean) => void;
};

const FAVORITE_NAVIGATION_LOCK_MS = 750;

function getItemLayout(
  _: ArrayLike<FavoriteItem> | null | undefined,
  index: number,
) {
  return {
    length: FAVORITES_RAIL_CELL_WIDTH,
    offset: FAVORITES_RAIL_CELL_WIDTH * index,
    index,
  };
}

export default function FavoritesScroll({
  isDark,
  onInteractionChange,
}: Props) {
  const router = useScopedRouter();
  const styles = useMemo(() => FavoritesScrollStyles(isDark), [isDark]);
  const navigationUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const {
    favorites: favoriteTeamIds,
    allTeams,
    teamFavoritesLoading,
    directoryLoading,
    directoryError,
    refreshDirectory,
    ready: teamsReady,
    favoriteSports,
    favoriteSportsError,
    loadFavoriteSports,
    favoriteSportsReady,
    userId,
  } = useFavoriteTeamsContext();

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

      const baseTeam =
        getFavoriteBaseTeam(league, favoriteId) ??
        allTeams.find(
          (team) => team.league === league && String(team.id) === favoriteId,
        );

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
        color: baseTeam.primaryColor ?? undefined,
      });

      return teams;
    }, []);
  }, [allTeams, favoriteTeamIds]);

  const leagueData = useMemo<FavoriteLeagueItem[]>(() => {
    return favoriteSports.map((sport) => {
      const config = LEAGUE_CONFIG[sport];

      return {
        kind: "league",
        id: sport,
        league: sport,
        name: config.shortName,
        logo: config.logoLight,
        color: config.color,
        key: `league:${sport}`,
      };
    });
  }, [favoriteSports]);

  const data = useMemo(
    () => [...leagueData, ...teamData],
    [leagueData, teamData],
  );

  useEffect(
    () => () => {
      if (navigationUnlockTimer.current) {
        clearTimeout(navigationUnlockTimer.current);
        navigationUnlockTimer.current = null;
      }
    },
    [],
  );

  const pushOnce = useCallback(
    (href: Href) => {
      if (navigationUnlockTimer.current) return;

      navigationUnlockTimer.current = setTimeout(() => {
        navigationUnlockTimer.current = null;
      }, FAVORITE_NAVIGATION_LOCK_MS);

      void Haptics.selectionAsync().catch(() => {});
      router.push(href);
    },
    [router],
  );

  const handleFavoritePress = useCallback(
    (item: FavoriteItem) => {
      if (item.kind === "league") {
        const config = LEAGUE_CONFIG[item.id];
        const sport = config.route.split("/").at(-1);

        if (!sport) {
          return;
        }

        pushOnce({
          pathname: "/(tabs)/(home)/league/[sport]",
          params: {
            sport,
            league: item.id,
            leagueLabel: config.shortName,
          },
        });
        return;
      }

      const route = getFavoriteTeamRoute(item.league);

      if (route === "/league/volleyball") {
        pushOnce({
          pathname: "/(tabs)/(home)/league/[sport]",
          params: { sport: "volleyball", league: item.league },
        });
        return;
      }

      pushOnce({
        pathname: `/(tabs)/(home)${route}`,
        params: {
          teamId: item.id,
          league: item.league,
        },
      });
    },
    [pushOnce],
  );

  const renderItem = useCallback<ListRenderItem<FavoriteItem>>(
    ({ item }) => (
      <FavoritesTab
        item={item}
        onPressItem={handleFavoritePress}
        styles={styles}
      />
    ),
    [handleFavoritePress, styles],
  );

  const lastLeagueKey = leagueData.at(-1)?.key;
  const showSectionDivider = lastLeagueKey !== undefined && teamData.length > 0;
  const renderItemSeparator = useCallback(
    ({ leadingItem }: { leadingItem?: FavoriteItem }) =>
      leadingItem?.key === lastLeagueKey ? (
        <View pointerEvents="none" style={styles.sectionDividerSlot}>
          <View style={styles.sectionDivider} />
        </View>
      ) : null,
    [lastLeagueKey, styles],
  );

  const hasFavorites = favoriteTeamIds.length > 0 || favoriteSports.length > 0;
  const renderFooter = useCallback(
    () => (
      <View style={styles.cell}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hasFavorites ? "Edit favorites" : "Add favorites"}
          onPress={() => pushOnce("/(tabs)/(home)/edit-favorites")}
          style={({ pressed }) => [
            styles.tabContainer,
            pressed && styles.pressed,
          ]}
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
      </View>
    ),
    [hasFavorites, isDark, pushOnce, styles],
  );

  const favoritesLoading =
    !teamsReady ||
    (teamFavoritesLoading && favoriteTeamIds.length === 0) ||
    (userId !== null && !favoriteSportsReady && !favoriteSportsError);

  // Release the Home pager if loading replaces the list during a touch.
  useEffect(() => {
    if (!favoritesLoading) return () => onInteractionChange(false);
  }, [favoritesLoading, onInteractionChange]);

  if (favoritesLoading) {
    return <FavoritesScrollSkeleton isDark={isDark} />;
  }

  const hasMissingTeams = favoriteTeamIds.length > teamData.length;
  const sportsUnavailable = !favoriteSportsReady && !!favoriteSportsError;

  return (
    <>
      <FlatList
        data={data}
        horizontal
        keyExtractor={(item) => item.key}
        getItemLayout={getItemLayout}
        showsHorizontalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.container}
        directionalLockEnabled
        nestedScrollEnabled
        renderItem={renderItem}
        ItemSeparatorComponent={
          showSectionDivider ? renderItemSeparator : undefined
        }
        ListFooterComponent={renderFooter}
        onTouchStart={() => onInteractionChange(true)}
        onTouchEnd={() => onInteractionChange(false)}
        onTouchCancel={() => onInteractionChange(false)}
      />
      {sportsUnavailable && (
        <View style={styles.directoryStatus} accessibilityLiveRegion="polite">
          <Text style={styles.statusText}>
            Favorite sports are unavailable.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading favorite sports"
            onPress={() => void loadFavoriteSports()}
            style={styles.retryButton}
          >
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      )}
      {hasMissingTeams && (
        <View style={styles.directoryStatus} accessibilityLiveRegion="polite">
          <Text style={styles.statusText}>
            {directoryLoading
              ? "Loading some favorite teams…"
              : "Some favorite teams are unavailable."}
          </Text>
          {directoryError && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry loading favorite teams"
              onPress={() => void refreshDirectory()}
              style={styles.retryButton}
            >
              <Text style={styles.retryLabel}>Retry</Text>
            </Pressable>
          )}
        </View>
      )}
    </>
  );
}
