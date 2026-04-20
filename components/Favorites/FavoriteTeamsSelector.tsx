import SearchBar from "components/SearchBars/SearchBar";
import React, { useCallback, useMemo } from "react";
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

  const filteredTeams = useMemo(() => {
    const query = search.toLowerCase().trim();
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
  }, [teams, search]);

  const renderItem = useCallback(
    ({ item }: { item: LeagueTeam }) => {
      const displayItem = {
        ...item,
        fullName:
          item.league === "NFL" || item.league === "NBA"
            ? item.fullName
            : item.fullName || item.name,
      };

      return (
        <TeamCard
          item={displayItem}
          isSelected={favorites.includes(`${item.league}:${item.id}`)}
          onPress={() => toggleFavorite(item.league, item.id.toString())}
          isGridView={isGridView}
          itemWidth={itemWidth}
        />
      );
    },
    [favorites, isGridView, itemWidth, toggleFavorite],
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
        keyExtractor={(item) => `${item.league}-${item.id}`}
        numColumns={isGridView ? 3 : 1}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={isGridView ? styles.columnWrapper : undefined}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
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
