import { getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { getNBATeamLogo } from "constants/teams";
import { getCBTeamLogo } from "constants/teamsCB";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getSBTeamLogo } from "constants/teamsSB";
import { getSOCCTeamLogo } from "constants/teamsSOCC";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useMemo } from "react";
import type { ImageSourcePropType } from "react-native";
import { FlatList, StyleSheet, View } from "react-native";
import { buildFavoriteTeamKey } from "types/favorites";
import type { Team } from "types/team";

import FavoriteTeamsSelectorSkeleton from "../Skeletons/FavoriteTeamsSelectorSkeleton";
import SelectionCard from "./SelectionCard";

type Props = {
  teams: Team[];
  favorites: string[];
  toggleFavorite: (league: string, id: string) => void;
  itemWidth: number;
  loading?: boolean;
};

const COLLEGE_LEAGUES = new Set(["cfb", "cbb", "wcbb", "cb", "sb"]);

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

    case "socc":
      return getSOCCTeamLogo(id, useAltLogo);

    default:
      return undefined;
  }
};

const FavoriteTeamsSelector = ({
  teams,
  favorites,
  toggleFavorite,
  itemWidth,
  loading = false,
}: Props) => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => FavoritesSelectorStyles(itemWidth), [itemWidth]);
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
          itemWidth={itemWidth}
          showSportTag={COLLEGE_LEAGUES.has(item.league)}
        />
      );
    },
    [favoritesSet, handleToggle, isDark, itemWidth],
  );

  const keyExtractor = useCallback(
    (item: Team) => `${item.league}-${item.id}`,
    [],
  );

  if (loading) {
    return <FavoriteTeamsSelectorSkeleton itemWidth={itemWidth} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        key={"teams-grid"}
        data={teams}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
  );
};

export const FavoritesSelectorStyles = (itemWidth: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    contentContainer: {
      flexGrow: 1,
      alignItems: "center",
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
