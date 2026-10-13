import SearchBar from "@/components/Explore/SearchBar";
import Button from "components/Buttons/Button";
import {
  CustomHeader,
  type EditFavoritesHeaderTab,
} from "components/CustomHeader";
import FavoriteSportsSelector from "components/Favorites/FavoriteSportsSelector";
import FavoriteTeamsSelector from "components/Favorites/FavoriteTeamsSelector";
import { useNotifications } from "contexts/NotificationContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { useEditFavorites } from "hooks/UserHooks/useEditFavorites";
import { usePagerTabScrollProgress } from "hooks/usePagerTabScrollProgress";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { EditFavoritesStyles as styles } from "styles/EditFavoriteStyles";

export default function EditFavoritesScreen() {
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const { unreadNotificationCount } = useNotifications();
  const { width: screenWidth } = useWindowDimensions();
  const isDark = resolvedColorScheme === "dark";
  const pagerRef = useRef<PagerView>(null);
  const [selectedTab, setSelectedTab] =
    useState<EditFavoritesHeaderTab>("teams");
  const {
    scrollProgress: homeTabScrollProgress,
    handlePageScroll,
    syncPageScrollProgress,
  } = usePagerTabScrollProgress();
  const {
    activeSearch,
    sportSearch,
    filteredTeams,
    draftFavoriteTeams,
    draftFavoriteSports,
    teamsLoading,
    sportsLoading,
    sportsSaving,
    saving,
    screenBusy,
    saveDisabled,
    handleSearchChange,
    handleToggleFavoriteTeam,
    handleToggleFavoriteSport,
    handleSave,
    handleCancel,
  } = useEditFavorites(selectedTab);

  const handlePageSelected = useCallback(
    (event: PagerViewOnPageSelectedEvent) => {
      const index = event.nativeEvent.position;

      const nextTab: EditFavoritesHeaderTab = index === 0 ? "teams" : "sports";

      syncPageScrollProgress(index);
      setSelectedTab(nextTab);
    },
    [syncPageScrollProgress],
  );

  const handleHeaderTabPress = useCallback((tab: EditFavoritesHeaderTab) => {
    setSelectedTab(tab);

    pagerRef.current?.setPage(tab === "teams" ? 0 : 1);
  }, []);

  /**
   * 3-column phone layout.
   */
  const itemWidth = (screenWidth - 40 - 12 * (3 - 1)) / 3;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Edit Favorites"
          editFavoritesSelectedTab={selectedTab}
          onEditTabPress={handleHeaderTabPress}
          homeScrollProgress={homeTabScrollProgress}
          unreadNotificationCount={unreadNotificationCount}
        />
      ),
    });
  }, [
    handleHeaderTabPress,
    homeTabScrollProgress,
    navigation,
    selectedTab,
    unreadNotificationCount,
  ]);

  return (
    <View style={styles.container}>
      <SearchBar
        visible
        value={activeSearch}
        onFocus={() => {}}
        onBlur={() => {}}
        onChangeText={handleSearchChange}
        placeholder={
          selectedTab === "teams" ? "Search teams..." : "Search sports..."
        }
      />

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageScroll={handlePageScroll}
        onPageSelected={handlePageSelected}
      >
        <View key="teams" style={styles.selectorContainer}>
          <FavoriteTeamsSelector
            teams={filteredTeams}
            favorites={draftFavoriteTeams}
            toggleFavorite={handleToggleFavoriteTeam}
            itemWidth={itemWidth}
            loading={teamsLoading}
          />
        </View>

        <View key="sports" style={styles.selectorContainer}>
          <FavoriteSportsSelector
            favorites={draftFavoriteSports}
            loading={sportsLoading}
            saving={sportsSaving}
            toggleFavorite={handleToggleFavoriteSport}
            itemWidth={itemWidth}
            search={sportSearch}
          />
        </View>
      </PagerView>

      <View style={styles.buttonContainer}>
        <Button
          isDark={isDark}
          onPress={handleCancel}
          disabled={screenBusy}
          variant="outline"
          style={styles.button}
        >
          Cancel
        </Button>

        <Button
          isDark={isDark}
          onPress={handleSave}
          disabled={saveDisabled}
          variant="filled"
          style={styles.button}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </View>
    </View>
  );
}
