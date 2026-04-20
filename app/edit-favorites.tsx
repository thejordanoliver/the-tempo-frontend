import { useNavigation } from "@react-navigation/native";
import Button from "components/Button";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoriteTeamsSelector from "components/Favorites/FavoriteTeamsSelector";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { Animated, View, useWindowDimensions } from "react-native";
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
  } = useFavoriteTeamsContext();

  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 3;
  const containerPadding = 40;
  const columnGap = 12;
  const totalSpacing = columnGap * (numColumns - 1);
  const availableWidth = screenWidth - containerPadding - totalSpacing;
  const itemWidth = availableWidth / numColumns;
  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = editFavoritesStyles(isDark, isGridView);

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
  }, [navigation, isGridView]);

  const handleSave = async () => {
    const success = await saveFavorites();
    if (success) router.back();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FavoriteTeamsSelector
          teams={favoriteTeamsList}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          isGridView={isGridView}
          fadeAnim={fadeAnim}
          search={search}
          itemWidth={itemWidth}
          setSearch={setSearch}
        />
      </Animated.View>
      <View style={styles.buttonContainer}>
        <Button onPress={handleSave} isDark={isDark} />
      </View>
    </View>
  );
}
