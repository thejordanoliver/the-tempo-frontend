import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Animated, View, useWindowDimensions } from "react-native";

import PagerView, { PagerViewOnPageScrollEvent } from "react-native-pager-view";
import Button from "../components/Buttons/Button";
import {
  CustomHeader,
  EditFavoritesHeaderTab,
} from "../components/CustomHeader";
import FavoriteSportsSelector from "../components/Favorites/FavoriteSportsSelector";
import FavoriteTeamsSelector from "../components/Favorites/FavoriteTeamsSelector";
import type { FavoriteSportId } from "../constants/leagues";
import { useFavoriteTeamsContext } from "../contexts/FavoriteTeamsContext";
import { usePreferences } from "../contexts/PreferencesContext";
import { editFavoritesStyles } from "../styles/EditFavoriteStyles";

export default function EditFavoritesScreen() {
  const styles = editFavoritesStyles;
  const {
    search,
    setSearch,
    favorites,
    toggleFavorite,
    isGridView,
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
  const [selectedTab, setSelectedTab] = useState<"teams" | "sports">("teams");
  const homeTabScrollProgress = useRef(new Animated.Value(0)).current;
  const handlePageScroll = useCallback(
    (event: PagerViewOnPageScrollEvent) => {
      const { offset, position } = event.nativeEvent;
      homeTabScrollProgress.setValue(position + offset);
    },
    [homeTabScrollProgress],
  );
  const pagerRef = useRef<PagerView>(null);
  const handleHeaderTabPress = useCallback((tab: EditFavoritesHeaderTab) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tab === "teams" ? 0 : 1);
  }, []);
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
          tabName="Edit Favorites"
          editFavoritesSelectedTab={selectedTab}
          onEditTabPress={handleHeaderTabPress}
          homeScrollProgress={homeTabScrollProgress}
          unreadNotificationCount={10}
        />
      ),
    });
  }, [handleHeaderTabPress, homeTabScrollProgress, navigation, selectedTab]);

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

  const screenBusy =
    isLoading || favoriteSportsLoading || favoriteSportsSaving || saving;

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageScroll={handlePageScroll}
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          homeTabScrollProgress.setValue(index);
          setSelectedTab(index === 0 ? "teams" : "sports");
        }}
      >
        <View key={"teams"} style={styles.selectorContainer}>
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

        <View key={"sports"} style={styles.selectorContainer}>
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
      </PagerView>
    </View>
  );
}
