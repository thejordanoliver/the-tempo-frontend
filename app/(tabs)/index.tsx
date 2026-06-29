import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import FavoritesScroll from "../../components/Favorites/FavoritesScroll";
import LeagueGamesList from "../../components/League/LeagueGamesList";
import NewsList from "../../components/News/NewsList";
import TabBar from "../../components/TabBars/TabBar";
import { Colors } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useHomeData } from "../../hooks/useHomeData";
import { homeStyles } from "../../styles/HomeStyles/HomeStyles";

export default function HomeScreen() {
  const { resolvedColorScheme, viewMode } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const styles = homeStyles(isDark);
  const [isDraggingFavorites, setIsDraggingFavorites] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState<"scores" | "news">(
    "scores",
  );

  const pagerRef = useRef<PagerView>(null);

  const {
    favorites,
    refreshing,
    handleRefresh,
    gamesByCategory,
    articles,
    newsError,
    newsLoading,
    loading: gamesLoading,
  } = useHomeData(selectedTab);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeaderTitle tabName="Home" />,
    });
  }, [navigation]);

  const handleTabPress = useCallback((tab: "scores" | "news") => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tab === "scores" ? 0 : 1);
  }, []);

  const refreshControl = useCallback(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={isDark ? Colors.white : Colors.black}
        colors={[isDark ? Colors.white : Colors.black]}
      />
    ),
    [refreshing, handleRefresh, isDark],
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>
        <View style={styles.tabBarWrapper}>
          <TabBar
            tabs={["scores", "news"]}
            selected={selectedTab}
            onTabPress={handleTabPress}
            isDark={isDark}
          />
        </View>

        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={!isDraggingFavorites}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            setSelectedTab(index === 0 ? "scores" : "news");
          }}
        >
          {/* SCORES PAGE */}
          <View key="scores" style={{ flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={refreshControl()}
            >
              <FavoritesScroll
                favoriteTeamIds={favorites}
                loading={gamesLoading}
                onDragStart={() => setIsDraggingFavorites(true)}
                onDragEnd={() => setIsDraggingFavorites(false)}
                isDark={isDark}
              />

              <LeagueGamesList
                gamesByCategory={gamesByCategory}
                loading={gamesLoading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                isDark={isDark}
                viewMode={viewMode}
              />
            </ScrollView>
          </View>

          {/* NEWS */}
          <View key="news" style={{ flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={refreshControl()}
            >
              <NewsList
                items={articles}
                isDark={isDark}
                loading={newsLoading}
                error={newsError}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </ScrollView>
          </View>
        </PagerView>
      </View>
    </View>
  );
}
