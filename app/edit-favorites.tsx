import SearchBar from "@/components/Explore/SearchBar";
import { useNavigation, useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, View, useWindowDimensions } from "react-native";
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";

import Button from "../components/Buttons/Button";
import {
  CustomHeader,
  type EditFavoritesHeaderTab,
} from "../components/CustomHeader";
import FavoriteSportsSelector from "../components/Favorites/FavoriteSportsSelector";
import FavoriteTeamsSelector from "../components/Favorites/FavoriteTeamsSelector";
import type { FavoriteSportId } from "../constants/leagues";
import { useFavoriteTeamsContext } from "../contexts/FavoriteTeamsContext";
import { useNotifications } from "../contexts/NotificationContext";
import { usePreferences } from "../contexts/PreferencesContext";
import { usePagerTabScrollProgress } from "../hooks/usePagerTabScrollProgress";
import { editFavoritesStyles } from "../styles/EditFavoriteStyles";
import { buildFavoriteTeamKey, type FavoriteTeamKey } from "../types/favorites";

type FavoritesTab = "teams" | "sports";

export default function EditFavoritesScreen() {
  const styles = editFavoritesStyles;

  const {
    favorites,
    syncFavorites,
    isLoading,
    ready: favoriteTeamsReady,
    allTeams,
    userId,
    favoriteSports,
    favoriteSportsLoading,
    favoriteSportsSaving,
    favoriteSportsReady,
    loadFavoriteSports,
    updateFavoriteSports,
  } = useFavoriteTeamsContext();

  const navigation = useNavigation();
  const router = useRouter();

  const { resolvedColorScheme } = usePreferences();
  const { unreadNotificationCount } = useNotifications();
  const { width: screenWidth } = useWindowDimensions();

  const isDark = resolvedColorScheme === "dark";

  const pagerRef = useRef<PagerView>(null);

  const {
    scrollProgress: homeTabScrollProgress,
    handlePageScroll,
    syncPageScrollProgress,
  } = usePagerTabScrollProgress();

  const [selectedTab, setSelectedTab] = useState<FavoritesTab>("teams");

  const [teamSearch, setTeamSearch] = useState("");
  const [sportSearch, setSportSearch] = useState("");

  const [draftFavoriteTeams, setDraftFavoriteTeams] = useState<
    FavoriteTeamKey[]
  >([]);

  const [favoriteTeamsDirty, setFavoriteTeamsDirty] = useState(false);

  const [draftFavoriteSports, setDraftFavoriteSports] = useState<
    FavoriteSportId[]
  >([]);

  const [favoriteSportsDirty, setFavoriteSportsDirty] = useState(false);

  const [saving, setSaving] = useState(false);

  /**
   * Load saved favorite sports.
   */
  useEffect(() => {
    void loadFavoriteSports();
  }, [loadFavoriteSports]);

  /**
   * Reset all draft/search state when the authenticated user changes.
   */
  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      setDraftFavoriteTeams([]);
      setFavoriteTeamsDirty(false);
      setDraftFavoriteSports([]);
      setFavoriteSportsDirty(false);

      setTeamSearch("");
      setSportSearch("");
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /**
   * Keep team selections local to this screen until Save is pressed. This
   * makes every exit path (Cancel, back gesture, and hardware back) discard
   * pending changes without mutating the shared favorites context.
   */
  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (!favoriteTeamsReady || favoriteTeamsDirty) {
        return;
      }

      setDraftFavoriteTeams(favorites);
    });

    return () => {
      cancelled = true;
    };
  }, [favoriteTeamsDirty, favoriteTeamsReady, favorites, userId]);

  /**
   * Keep the sports draft synchronized with the saved sports until
   * the user starts making local changes.
   */
  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (!favoriteSportsReady || favoriteSportsDirty) {
        return;
      }

      setDraftFavoriteSports(favoriteSports);
    });

    return () => {
      cancelled = true;
    };
  }, [favoriteSports, favoriteSportsDirty, favoriteSportsReady, userId]);

  /**
   * Each tab maintains its own independent search query.
   */
  const activeSearch = useMemo(
    () => (selectedTab === "teams" ? teamSearch : sportSearch),
    [selectedTab, sportSearch, teamSearch],
  );

  const filteredTeams = useMemo(() => {
    const query = teamSearch.trim().toLowerCase();

    return allTeams.filter((team) => {
      const isEligible =
        team.isAllStar !== true &&
        team.isNational !== true &&
        team.isActive !== false;

      if (!isEligible) {
        return false;
      }

      if (!query) {
        return true;
      }

      const teamName = team.fullName ?? team.name ?? "";

      return (
        teamName.toLowerCase().includes(query) ||
        team.league.toLowerCase().includes(query)
      );
    });
  }, [allTeams, teamSearch]);

  /**
   * Search state stays local so editing does not update the global favorites
   * provider (and therefore does not rerender the Home favorites rail).
   */
  const handleSearchChange = useCallback(
    (value: string) => {
      if (selectedTab === "teams") {
        setTeamSearch(value);
        return;
      }

      setSportSearch(value);
    },
    [selectedTab],
  );

  const handlePageSelected = useCallback(
    (event: PagerViewOnPageSelectedEvent) => {
      const index = event.nativeEvent.position;

      const nextTab: FavoritesTab = index === 0 ? "teams" : "sports";

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

  const handleToggleFavoriteSport = useCallback((league: FavoriteSportId) => {
    setDraftFavoriteSports((current) => {
      if (current.includes(league)) {
        return current.filter((favorite) => favorite !== league);
      }

      return [...current, league];
    });

    setFavoriteSportsDirty(true);
  }, []);

  const handleToggleFavoriteTeam = useCallback((league: string, id: string) => {
    const key = buildFavoriteTeamKey(league, id);

    if (!key) {
      return;
    }

    setDraftFavoriteTeams((current) =>
      current.includes(key)
        ? current.filter((favorite) => favorite !== key)
        : [...current, key],
    );
    setFavoriteTeamsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (saving || !favoriteTeamsReady || !favoriteSportsReady) {
      return;
    }

    setSaving(true);

    try {
      const [teamsSaved, sportsSaved] = await Promise.all([
        favoriteTeamsDirty
          ? syncFavorites(draftFavoriteTeams)
          : Promise.resolve(true),

        favoriteSportsDirty
          ? updateFavoriteSports(draftFavoriteSports)
          : Promise.resolve(true),
      ]);

      if (teamsSaved && sportsSaved) {
        router.back();
        return;
      }

      const message = !sportsSaved
        ? "Your previous favorite sports are still saved. Please try again."
        : "Your favorite sports were saved, but your teams could not be saved. Please try again.";

      Alert.alert("Couldn’t save favorites", message);
    } catch (error) {
      console.error("Failed to save favorites:", error);

      Alert.alert(
        "Couldn’t save favorites",
        "Something went wrong while saving your favorites. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }, [
    draftFavoriteSports,
    draftFavoriteTeams,
    favoriteSportsDirty,
    favoriteSportsReady,
    favoriteTeamsDirty,
    favoriteTeamsReady,
    router,
    saving,
    syncFavorites,
    updateFavoriteSports,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const screenBusy =
    isLoading || favoriteSportsLoading || favoriteSportsSaving || saving;

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
        style={{ flex: 1 }}
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
            loading={isLoading || !favoriteTeamsReady}
          />
        </View>

        <View key="sports" style={styles.selectorContainer}>
          <FavoriteSportsSelector
            favorites={draftFavoriteSports}
            loading={favoriteSportsLoading}
            saving={favoriteSportsSaving || saving}
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
          disabled={screenBusy || !favoriteTeamsReady || !favoriteSportsReady}
          variant="filled"
          style={styles.button}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </View>
    </View>
  );
}
