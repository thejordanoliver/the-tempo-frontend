import SearchBar from "components/SearchBars/SearchBar";
import React, { useCallback, useDeferredValue, useMemo } from "react";
import { Animated, FlatList, StyleSheet } from "react-native";
import type { LeagueTeam, LeagueType } from "types/types";
import FavoriteTeamsSelectorSkeleton from "../Skeletons/FavoriteTeamsSelectorSkeleton";
import TeamCard from "./TeamCard";

type Props = {
  teams: LeagueTeam[];
  favorites: string[];
  toggleFavorite: (league: LeagueType, id: string) => void;
  isGridView: boolean;
  fadeAnim: Animated.Value;
  search: string;
  itemWidth: number;
  loading?: boolean;
  setSearch: (t: string) => void;
};

const FavoriteTeamsSelector = ({
  teams,
  favorites,
  toggleFavorite,
  isGridView,
  fadeAnim,
  search,
  itemWidth,
  setSearch,
  loading = false,
}: Props) => {
  const styles = useMemo(
    () => createStyles(isGridView, itemWidth),
    [isGridView, itemWidth],
  );
  const deferredSearch = useDeferredValue(search);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const filteredTeams = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();
    if (!query) return teams;

    return teams.filter((team) => {
      const name = (
        team.fullName ||
        team.name ||
        team.displayName ||
        ""
      ).toLowerCase();

      const league = team.league.toLowerCase();
      const searchTerms = ((team as any).searchTerms ?? "").toLowerCase();

      return (
        name.includes(query) ||
        league.includes(query) ||
        searchTerms.includes(query)
      );
    });
  }, [teams, deferredSearch]);

  const handleToggle = useCallback(
    (league: LeagueType, id: string) => {
      toggleFavorite(league, id);
    },
    [toggleFavorite],
  );

  const renderItem = useCallback(
    ({ item }: { item: LeagueTeam }) => {
      const key = `${item.league}:${item.id}`;

      return (
        <TeamCard
          item={item}
          isSelected={favoritesSet.has(key)}
          onPress={handleToggle}
          isGridView={isGridView}
          itemWidth={itemWidth}
        />
      );
    },
    [favoritesSet, handleToggle, isGridView, itemWidth],
  );

  const keyExtractor = useCallback(
    (item: LeagueTeam) => `${item.league}-${item.id}`,
    [],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<LeagueTeam> | null | undefined, index: number) => {
      const itemHeight = 76;
      const separatorHeight = 12;

      return {
        length: itemHeight + separatorHeight,
        offset: (itemHeight + separatorHeight) * index,
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
      />
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SearchBar
        placeholder="Search teams or leagues..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        key={isGridView ? "grid" : "list"}
        data={filteredTeams}
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

const createStyles = (isGridView: boolean, itemWidth: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      gap: 12,
    },
    contentContainer: {
      flexGrow: 1,
      alignItems: isGridView ? "center" : "stretch",
      paddingBottom: 20,
    },
    columnWrapper: {
      width: itemWidth * 3 + 24,
      justifyContent: "flex-start",
      gap: 12,
      marginBottom: 12,
    },
  });

export default FavoriteTeamsSelector;
