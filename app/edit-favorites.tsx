import { useNavigation } from "@react-navigation/native";
import Button from "components/Button";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoriteTeamsSelector from "components/Favorites/FavoriteTeamsSelector";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { editFavoritesStyles } from "styles/EditFavoriteStyles";
import { favoriteTeamsList } from "utils/teams";

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
    [isDark, isGridView]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
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

  return (
    <View style={styles.container}>
      <FavoriteTeamsSelector
        teams={favoriteTeamsList}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isGridView={isGridView}
        fadeAnim={fadeAnim}
        search={search}
        itemWidth={itemWidth}
        setSearch={setSearch}
        loading={isLoading}
      />

      <View style={styles.buttonContainer}>
        <Button onPress={handleSave} isDark={isDark} />
      </View>
    </View>
  );
}
