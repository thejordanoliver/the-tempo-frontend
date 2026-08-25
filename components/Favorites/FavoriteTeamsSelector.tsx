import { Team } from "@/types/team";
import React, { useCallback, useMemo } from "react";
import { Animated, FlatList, StyleSheet } from "react-native";
import SearchBar from "../Explore/SearchBar";
import FavoriteTeamsSelectorSkeleton from "../Skeletons/FavoriteTeamsSelectorSkeleton";
import TeamCard from "./TeamCard";

type LeagueTeamWithId = Team & { id: number };

type Props = {
  teams: Team[];
  favorites: string[];
  toggleFavorite: (league: string, id: string) => void;
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
  loading,
}: Props) => {
  const styles = useMemo(
    () => favoriteTeamsSelectorStyles(isGridView, itemWidth),
    [isGridView, itemWidth],
  );

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const handleToggle = useCallback(
    (league: string, id: string) => {
      toggleFavorite(league, id);
    },
    [toggleFavorite],
  );

  const renderItem = useCallback(
    ({ item }: { item: Team }) => {
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
    (item: LeagueTeamWithId) => `${item.league}-${item.id}`,
    [],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<LeagueTeamWithId> | null | undefined, index: number) => {
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

  if (loading)
    return (
      <FavoriteTeamsSelectorSkeleton
        isGridView={isGridView}
        itemWidth={itemWidth}
        fadeAnim={fadeAnim}
      />
    );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SearchBar
        visible
        value={search}
        onFocus={() => {}}
        onBlur={() => {}}
        onChangeText={setSearch}
        placeholder="Search teams or leagues..."
      />

      <FlatList
        key={isGridView ? "grid" : "list"}
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

const favoriteTeamsSelectorStyles = (isGridView: boolean, itemWidth: number) =>
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
