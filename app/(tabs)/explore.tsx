import { useNavigation } from "@react-navigation/native";
import EmptyState from "components/Explore/EmptyState";
import SearchResultsList from "components/Explore/SearchResultsList";
import { useRouter } from "expo-router";
import { useExplore } from "hooks/useExplore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Animated, Easing, useColorScheme, View } from "react-native";
import { exploreStyles } from "styles/Explore/ExploreStyles";
import { ResultItem } from "types/types";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import SearchBar from "../../components/Explore/SearchBar";

const tabs = ["All", "Teams", "Players", "Accounts"] as const;

const tabToTypeMap = {
  Teams: "team",
  Players: "player",
  Accounts: "user",
};

export default function ExplorePage() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>("All");
  const [showAll, setShowAll] = useState(false);

  const inputAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = exploreStyles(isDark);

  const {
    query,
    setQuery,
    results,
    recentSearches,
    loading,
    error,
    search,
    saveToRecentSearches,
    deleteRecentSearch,
  } = useExplore();

  useEffect(() => {
    Animated.timing(inputAnim, {
      toValue: searchVisible ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [searchVisible]);

  const filteredResults = (query.trim() ? results : recentSearches).filter(
    (item) => {
      if (selectedTab === "All") return true;
      return item.type === tabToTypeMap[selectedTab];
    }
  );

  const handleSelectItem = (item: ResultItem) => {
    saveToRecentSearches(item);

    switch (item.type) {
      case "team":
        if (item.isNFL) router.push(`/team/nfl/${item.id}`);
        else if (item.isMLB) router.push(`/team/mlb/${item.id}`);
        else if (item.isCFB) router.push(`/team/cfb/${item.id}`);
        else if (item.isCBB) router.push(`/team/cbb/${item.id}`);
        else if (item.isWCBB) router.push(`/team/wcbb/${item.wid}`);
        else router.push(`/team/${item.id}`);
        break;
      case "player":
        if (item.isNFL)
          router.push({
            pathname: "/player/nfl/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
            },
          });
        else if (item.isCFB)
          router.push({
            pathname: "/player/cfb/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
            },
          });
        else if (item.isCBB || item.isWCBB)
          router.push({
            pathname: "/player/cbb/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
              league: item.isWCBB ? "WCBB" : "CBB",
            },
          });
        else
          router.push({
            pathname: "/player/[id]",
            params: {
              id: String(item.player_id),
              teamId: String(item.team_id ?? ""),
            },
          });
        break;
      case "user":
        router.push(`/user/${item.id}`);
        break;
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="Explore"
          title="Explore"
          onSearchToggle={() => {
            setSearchVisible((prev) => {
              if (prev) {
                setQuery(""); // clear text
                setSelectedTab("All"); // reset tabs
                setIsFocused(false);
              }
              return !prev;
            });
          }}
          onAddWidget={() => {}}
        />
      ),
    });
  }, [navigation]);

  const handleChangeText = (text: string) => {
    if (!searchVisible) return;
    setQuery(text);
    search(text); // 🔹 trigger search from hook
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        placeholder="Explore Teams, Players and Accounts..."
        onChangeText={handleChangeText}
        visible={searchVisible}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          if (!query.trim()) setIsFocused(false);
        }}
        tabs={[...tabs]}
        selectedTab={selectedTab}
        onTabPress={(tab) => setSelectedTab(tab as typeof selectedTab)}
      />

      {!searchVisible && <EmptyState />}

      {searchVisible && (
        <SearchResultsList
          data={filteredResults.length ? filteredResults : recentSearches}
          loading={loading}
          error={error}
          onSelect={handleSelectItem}
          onDelete={deleteRecentSearch}
          query={query}
          onSeeAll={() => setShowAll(true)}
          showAll={showAll}
        />
      )}
    </View>
  );
}
