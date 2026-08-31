import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Alert, View, useWindowDimensions } from "react-native";

import Button from "../components/Buttons/Button";
import { CustomHeader } from "../components/CustomHeader";
import FavoriteSportsSelector from "../components/Favorites/FavoriteSportsSelector";
import FavoriteTeamsSelector from "../components/Favorites/FavoriteTeamsSelector";
import TabBar from "../components/TabBars/TabBar";
import type { FavoriteSportId } from "../constants/leagues";
import { useFavoriteTeamsContext } from "../contexts/FavoriteTeamsContext";
import { usePreferences } from "../contexts/PreferencesContext";
import { editFavoritesStyles } from "../styles/EditFavoriteStyles";

const FAVORITES_TABS = ["teams", "leagues"] as const;

export default function EditFavoritesScreen() {
  const styles = editFavoritesStyles;
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
    userId,
    favoriteSports,
    favoriteSportsLoading,
    favoriteSportsSaving,
    favoriteSportsReady,
    favoriteSportsError,
    loadFavoriteSports,
    updateFavoriteSports,
  } = useFavoriteTeamsContext();
  const [selectedTab, setSelectedTab] = useState<"teams" | "leagues">("teams");
  const [draftFavoriteSports, setDraftFavoriteSports] = useState<
    FavoriteSportId[]
  >([]);
  const [favoriteSportsDirty, setFavoriteSportsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const { width: screenWidth } = useWindowDimensions();

  const navigation = useNavigation();
  const router = useRouter();

  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";

  useEffect(() => {
    void loadFavoriteSports();
  }, [loadFavoriteSports]);

  useEffect(() => {
    setDraftFavoriteSports([]);
    setFavoriteSportsDirty(false);
  }, [userId]);

  useEffect(() => {
    if (!favoriteSportsReady || favoriteSportsDirty) return;

    setDraftFavoriteSports(favoriteSports);
  }, [favoriteSports, favoriteSportsDirty, favoriteSportsReady, userId]);

  const itemWidth = useMemo(() => {
    const numColumns = 3;
    const containerPadding = 40;
    const columnGap = 12;
    const totalSpacing = columnGap * (numColumns - 1);

    return (screenWidth - containerPadding - totalSpacing) / numColumns;
  }, [screenWidth]);

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
  }, [isGridView, navigation, router, selectedTab, toggleLayout]);

  const handleToggleFavoriteSport = useCallback((league: FavoriteSportId) => {
    setDraftFavoriteSports((current) =>
      current.includes(league)
        ? current.filter((favorite) => favorite !== league)
        : [...current, league],
    );
    setFavoriteSportsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;

    setSaving(true);

    const [teamsSaved, sportsSaved] = await Promise.all([
      saveFavorites(),
      favoriteSportsDirty
        ? updateFavoriteSports(draftFavoriteSports)
        : Promise.resolve(favoriteSportsReady),
    ]);

    if (teamsSaved && sportsSaved) {
      router.back();
    } else {
      const message = !sportsSaved
        ? "Your previous favorite sports are still saved. Please try again."
        : "Your favorite sports were saved, but your teams could not be saved. Please try again.";

      Alert.alert("Couldn’t save favorites", message);
    }

    setSaving(false);
  }, [
    draftFavoriteSports,
    favoriteSportsDirty,
    favoriteSportsReady,
    router,
    saveFavorites,
    saving,
    updateFavoriteSports,
  ]);

  const handleTabPress = useCallback(
    (tab: (typeof FAVORITES_TABS)[number]) => {
      setSearch("");
      setSelectedTab(tab);
    },
    [setSearch],
  );

  const screenBusy =
    isLoading || favoriteSportsLoading || favoriteSportsSaving || saving;

  return (
    <View style={styles.container}>
      <TabBar
        tabs={FAVORITES_TABS}
        selected={selectedTab}
        onTabPress={handleTabPress}
        isDark={isDark}
        style={styles.tabs}
      />

      <View style={styles.selectorContainer}>
        {selectedTab === "teams" ? (
          <FavoriteTeamsSelector
            teams={filteredTeams}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            isGridView={isGridView}
            fadeAnim={fadeAnim}
            search={search}
            itemWidth={itemWidth}
            setSearch={setSearch}
            loading={isLoading}
          />
        ) : (
          <FavoriteSportsSelector
            favorites={draftFavoriteSports}
            loading={favoriteSportsLoading}
            ready={favoriteSportsReady}
            saving={favoriteSportsSaving || saving}
            error={favoriteSportsError}
            onRetry={() => void loadFavoriteSports(true)}
            toggleFavorite={handleToggleFavoriteSport}
            isGridView={isGridView}
            fadeAnim={fadeAnim}
            search={search}
            setSearch={setSearch}
            itemWidth={itemWidth}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          isDark={isDark}
          onPress={() => router.back()}
          disabled={screenBusy}
          variant="outline"
          style={styles.button}
        >
          Cancel
        </Button>

        <Button
          isDark={isDark}
          onPress={handleSave}
          disabled={screenBusy || !favoriteSportsReady}
          variant="filled"
          style={styles.button}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </View>
    </View>
  );
}
