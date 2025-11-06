import { useMemo } from "react";
import { Animated, FlatList } from "react-native";
import type { LeagueTeam, LeagueType } from "types/types";
import FavoriteTeamsSelectorSkeleton from "./FavoriteTeamsSelectorSkeleton";
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
};

const FavoriteTeamsSelector = ({
  teams,
  favorites,
  toggleFavorite,
  isGridView,
  fadeAnim,
  search,
  itemWidth,
  loading = false,
}: Props) => {
  const filteredTeams = useMemo(() => {
    const query = search.toLowerCase();
    return teams.filter((team) => {
      const name = team.fullName || team.name || team.displayName || "";
      return name.toLowerCase().includes(query);
    });
  }, [teams, search]);

  if (loading) {
    return (
      <FavoriteTeamsSelectorSkeleton
        isGridView={isGridView}
        itemWidth={itemWidth}
      />
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, marginTop: 12 }}>
      <FlatList
        key={isGridView ? "grid" : "list"}
        data={filteredTeams}
        keyExtractor={(item) => `${item.league}-${item.id}`}
        numColumns={isGridView ? 3 : 1}
        columnWrapperStyle={
          isGridView
            ? {
                justifyContent: "flex-start",
                gap: 12,
                marginBottom: 12,
                flexWrap: "wrap",
              }
            : undefined
        }
        renderItem={({ item }) => {
          // Only use fullName for NFL and NBA
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
              isSelected={favorites.includes(
                `${item.league}:${item.id.toString()}`
              )}
              onPress={() => toggleFavorite(item.league, item.id.toString())}
              isGridView={isGridView}
              itemWidth={itemWidth}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </Animated.View>
  );
};

export default FavoriteTeamsSelector;
