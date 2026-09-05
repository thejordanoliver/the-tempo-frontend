import { getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { getNBATeamLogo } from "constants/teams";
import { getCBTeamLogo } from "constants/teamsCB";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getSBTeamLogo } from "constants/teamsSB";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useMemo } from "react";
import type { ImageSourcePropType } from "react-native";
import { Animated, FlatList, StyleSheet } from "react-native";
import { buildFavoriteTeamKey } from "types/favorites";
import type { Team } from "types/team";

import FavoriteTeamsSelectorSkeleton from "../Skeletons/FavoriteTeamsSelectorSkeleton";
import SelectionCard from "./SelectionCard";

type Props = {
  teams: Team[];
  favorites: string[];
  toggleFavorite: (league: string, id: string) => void;
  isGridView: boolean;
  fadeAnim: Animated.Value;
  itemWidth: number;
  loading?: boolean;
};

const COLLEGE_LEAGUES = new Set(["cfb", "cbb", "wcbb", "cb", "sb"]);

const LIST_ITEM_HEIGHT = 76;
const LIST_ITEM_GAP = 12;

const getTeamLogo = (
  league: string,
  id: number,
  useAltLogo: boolean,
): ImageSourcePropType | undefined => {
  switch (league) {
    case "cfb":
      return getCFBTeamLogo(id, useAltLogo);

    case "cbb":
      return getCBBTeamLogo(id, useAltLogo);

    case "wcbb":
      return getWCBBTeamLogo(id, useAltLogo);

    case "mlb":
      return getMLBTeamLogo(id, useAltLogo);

    case "cb":
      return getCBTeamLogo(id, useAltLogo);

    case "sb":
      return getSBTeamLogo(id, useAltLogo);

    case "nba":
      return getNBATeamLogo(id, useAltLogo);

    case "wnba":
      return getWNBATeamLogo(id, useAltLogo);

    case "nfl":
      return getNFLTeamLogo(id, useAltLogo);

    case "nhl":
      return getNHLTeamLogo(id, useAltLogo);

    default:
      return undefined;
  }
};

const FavoriteTeamsSelector = ({
  teams,
  favorites,
  toggleFavorite,
  isGridView,
  fadeAnim,
  itemWidth,
  loading = false,
}: Props) => {
  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";

  const styles = useMemo(
    () => FavoritesSelectorStyles(isGridView, itemWidth),
    [isGridView, itemWidth],
  );

  /**
   * O(1) favorite lookup for each rendered item.
   */
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const handleToggle = useCallback(
    (league: string, id: string) => {
      toggleFavorite(league, id);
    },
    [toggleFavorite],
  );

  const renderItem = useCallback(
    ({ item }: { item: Team }) => {
      const favoriteKey = buildFavoriteTeamKey(item.league, item.id);

      const isSelected = favoriteKey ? favoritesSet.has(favoriteKey) : false;

      const useAltLogo = isDark || isSelected;

      const logo = getTeamLogo(item.league, Number(item.id), useAltLogo);

      return (
        <SelectionCard
          item={item}
          logo={logo}
          isSelected={isSelected}
          onPress={handleToggle}
          isGridView={isGridView}
          itemWidth={itemWidth}
          showSportTag={COLLEGE_LEAGUES.has(item.league)}
        />
      );
    },
    [favoritesSet, handleToggle, isDark, isGridView, itemWidth],
  );

  const keyExtractor = useCallback(
    (item: Team) => `${item.league}-${item.id}`,
    [],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<Team> | null | undefined, index: number) => {
      const length = LIST_ITEM_HEIGHT + LIST_ITEM_GAP;

      return {
        length,
        offset: length * index,
        index,
      };
    },
    [],
  );

  if (loading) {
    return (
      <FavoriteTeamsSelectorSkeleton
        isGridView={isGridView}
        itemWidth={itemWidth}
        fadeAnim={fadeAnim}
      />
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <FlatList
        key={isGridView ? "teams-grid" : "teams-list"}
        data={teams}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={isGridView ? 3 : 1}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={isGridView ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        getItemLayout={isGridView ? undefined : getItemLayout}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </Animated.View>
  );
};

export const FavoritesSelectorStyles = (
  isGridView: boolean,
  itemWidth: number,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    contentContainer: {
      flexGrow: 1,
      alignItems: isGridView ? "center" : "stretch",
      paddingBottom: 20,
    },

    columnWrapper: {
      justifyContent: "flex-start",
      gap: 12,
      width: itemWidth * 3 + 24,
      marginBottom: 12,
    },
  });

export default FavoriteTeamsSelector;
