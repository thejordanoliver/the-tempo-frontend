import FavoriteTeamsSelectorSkeleton from "@/components/Skeletons/FavoriteTeamsSelectorSkeleton";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import Button from "../components/Buttons/Button";
import { CustomHeader } from "../components/CustomHeader";
import FavoriteTeamsSelector from "../components/Favorites/FavoriteTeamsSelector";
import { useFavoriteTeamsContext } from "../contexts/FavoriteTeamsContext";
import { usePreferences } from "../contexts/PreferencesContext";
import { editFavoritesStyles } from "../styles/EditFavoriteStyles";
export default function EditFavoritesScreen() {
  const {
    search,
    setSearch,
    favorites,
    toggleFavorite,
    isGridView,
    toggleLayout,
    fadeAnim,
    saveFavorites,
    isLoading,
    filteredTeams,
  } = useFavoriteTeamsContext();

  const { width: screenWidth } = useWindowDimensions();

  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  /**
   * 🚀 Prevent unnecessary recalculation on every render
   */
  const itemWidth = useMemo(() => {
    const numColumns = 3;
    const containerPadding = 40;
    const columnGap = 12;
    const totalSpacing = columnGap * (numColumns - 1);

    return (screenWidth - containerPadding - totalSpacing) / numColumns;
  }, [screenWidth]);

  const styles = useMemo(
    () => editFavoritesStyles(isDark, isGridView),
    [isDark, isGridView],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title="Edit Favorites"
          onBack={() => router.back()}
          onToggleLayout={toggleLayout}
          isGrid={isGridView}
        />
      ),
    });
  }, [navigation, router, toggleLayout, isGridView]);

  const handleSave = useCallback(async () => {
    const success = await saveFavorites();
    if (success) router.back();
  }, [router, saveFavorites]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <FavoriteTeamsSelectorSkeleton
          isGridView={isGridView}
          itemWidth={itemWidth}
          fadeAnim={fadeAnim}
        />
        <View style={styles.buttonContainer}>
          <Button onPress={handleSave} isDark={isDark} disabled />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FavoriteTeamsSelector
        teams={filteredTeams}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isGridView={isGridView}
        fadeAnim={fadeAnim}
        search={search}
        itemWidth={itemWidth}
        setSearch={setSearch}
      />

      <View style={styles.buttonContainer}>
        <Button onPress={handleSave} isDark={isDark} />
      </View>
    </View>
  );
}
