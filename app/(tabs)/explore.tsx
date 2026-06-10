import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import { View } from "react-native";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import AddWidgetModal from "../../components/Explore/AddWidgetModal";
import EmptyState from "../../components/Explore/EmptyState";
import SearchBar from "../../components/Explore/SearchBar";
import SearchResultsList from "../../components/Explore/SearchResultsList";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useExplore } from "../../hooks/useExplore";
import { useExploreSearchState } from "../../hooks/useExploreSearchState";
import { useExploreWidgets } from "../../hooks/useExploreWidgets";
import { exploreStyles } from "../../styles/ExploreStyles/ExploreStyles";
import { ResultItem } from "../../types/explore";
import { getExploreRouteForResult } from "../../utils/exploreNavigation";

export default function ExplorePage() {
  const [widgetModalVisible, setWidgetModalVisible] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = exploreStyles(isDark);
  const {
    query,
    setQuery,
    results,
    recentSearches,
    loading,
    error,
    isSearching,
    saveToRecentSearches,
    deleteRecentSearch,
  } = useExplore();
  const {
    widgets,
    addWidget,
    removeWidget,
    resizeWidget,
    moveWidget,
  } = useExploreWidgets();
  const {
    searchVisible,
    selectedTab,
    showAll,
    tabs,
    searchResultsData,
    toggleSearch,
    handleChangeText,
    handleTabPress,
    handleSeeAll,
  } = useExploreSearchState({
    query,
    setQuery,
    results,
    recentSearches,
  });

  const handleSelectItem = useCallback(
    (item: ResultItem) => {
      saveToRecentSearches(item);
      router.push(getExploreRouteForResult(item) as any);
    },
    [router, saveToRecentSearches],
  );

  const openWidgetModal = useCallback(() => {
    setWidgetModalVisible(true);
  }, []);

  const closeWidgetModal = useCallback(() => {
    setWidgetModalVisible(false);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Explore"
          title="Explore"
          onSearchToggle={toggleSearch}
        />
      ),
    });
  }, [navigation, toggleSearch]);

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        placeholder="Explore Teams, Players and Accounts..."
        onChangeText={handleChangeText}
        visible={searchVisible}
        onFocus={() => {}}
        onBlur={() => {}}
        tabs={[...tabs]}
        selectedTab={selectedTab}
        onTabPress={handleTabPress}
      />

      {!searchVisible && (
        <EmptyState
          isDark={isDark}
          selectedWidgets={widgets}
          onAddWidget={openWidgetModal}
          onRemoveWidget={removeWidget}
          onResizeWidget={resizeWidget}
          onMoveWidget={moveWidget}
        />
      )}

      {searchVisible && (
        <SearchResultsList
          data={searchResultsData}
          loading={loading}
          error={error}
          onSelect={handleSelectItem}
          onDelete={deleteRecentSearch}
          query={query}
          onSeeAll={handleSeeAll}
          showAll={showAll}
          isSearching={isSearching}
        />
      )}

      <AddWidgetModal
        visible={widgetModalVisible}
        isDark={isDark}
        selectedWidgets={widgets}
        onClose={closeWidgetModal}
        onAddWidget={addWidget}
      />
    </View>
  );
}
