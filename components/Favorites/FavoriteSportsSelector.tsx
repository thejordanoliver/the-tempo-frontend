import {
  FAVORITE_SPORT_OPTIONS,
  type FavoriteSportId,
} from "constants/leagues";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useMemo } from "react";
import { Animated, FlatList } from "react-native";

import SearchBar from "../Explore/SearchBar";
import FavoriteTeamsSelectorSkeleton from "../Skeletons/FavoriteTeamsSelectorSkeleton";
import { FavoritesSelectorStyles } from "./FavoriteTeamsSelector";
import SelectionCard from "./SelectionCard";

type FavoriteSportOption = (typeof FAVORITE_SPORT_OPTIONS)[number];

type Props = {
  favorites: FavoriteSportId[];
  loading: boolean;
  ready: boolean;
  isGridView: boolean;
  saving: boolean;
  error: string | null;
  onRetry: () => void;
  toggleFavorite: (league: FavoriteSportId) => void;
  fadeAnim: Animated.Value;
  search: string;
  setSearch: (t: string) => void;
  itemWidth: number;
};

export default function FavoriteSportsSelector({
  favorites,
  toggleFavorite,
  isGridView,
  fadeAnim,
  search,
  itemWidth,
  setSearch,
  loading,
  saving,
}: Props) {
  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";

  const styles = useMemo(
    () => FavoritesSelectorStyles(isGridView, itemWidth),
    [isGridView, itemWidth],
  );

  const favoritesSet = useMemo(
    () => new Set<FavoriteSportId>(favorites),
    [favorites],
  );

  const filteredSports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return FAVORITE_SPORT_OPTIONS;
    }

    return FAVORITE_SPORT_OPTIONS.filter(
      (item) =>
        item.id.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        item.league.toLowerCase().includes(query),
    );
  }, [search]);

  const handleToggle = useCallback(
    (league: string, _id: string) => {
      if (saving) {
        return;
      }

      const sport = FAVORITE_SPORT_OPTIONS.find(
        (option) => option.id === league,
      );

      if (!sport) {
        return;
      }

      toggleFavorite(sport.id);
    },
    [saving, toggleFavorite],
  );

  const renderItem = useCallback(
    ({ item }: { item: FavoriteSportOption }) => {
      const isSelected = favoritesSet.has(item.id);
      const logo = isDark || isSelected ? item.logoLight : item.logo;

      return (
        <SelectionCard
          item={{
            id: item.id,
            league: item.id,
            name: item.label,
            fullName: item.label,
            color: item.color,
          }}
          logo={logo}
          isSelected={isSelected}
          onPress={handleToggle}
          isGridView={isGridView}
          itemWidth={itemWidth}
        />
      );
    },
    [favoritesSet, handleToggle, isDark, isGridView, itemWidth],
  );

  const keyExtractor = useCallback((item: FavoriteSportOption) => item.id, []);

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
      <SearchBar
        visible
        value={search}
        onFocus={() => {}}
        onBlur={() => {}}
        onChangeText={setSearch}
        placeholder="Search leagues..."
      />

      <FlatList
        key={isGridView ? "sports-grid" : "sports-list"}
        data={filteredSports}
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </Animated.View>
  );
}
