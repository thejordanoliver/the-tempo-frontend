import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FavoritesScroll from "../../components/Favorites/FavoritesScroll";
import LeagueGamesList from "../../components/League/LeagueGamesList";
import NewsList from "../../components/News/NewsList";
import TabBar from "../../components/TabBars/TabBar";
import { Colors } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useHomeData } from "../../hooks/useHomeData";
import { homeStyles } from "../../styles/HomeStyles/HomeStyles";

type HomeTab = "scores" | "news";

export default function HomeScreen() {
  const { resolvedColorScheme, viewMode } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = homeStyles(isDark);

  const [isDraggingFavorites, setIsDraggingFavorites] = useState(false);
  const [selectedTab, setSelectedTab] = useState<HomeTab>("scores");

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
      header: () => null,
    });
  }, [navigation]);

  const handleTabPress = useCallback((tab: HomeTab) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tab === "scores" ? 0 : 1);
  }, []);

  const renderRefreshControl = useCallback(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={isDark ? Colors.white : Colors.black}
        colors={[isDark ? Colors.white : Colors.black]}
      />
    ),
    [handleRefresh, isDark, refreshing],
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
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
          onPageSelected={(event) => {
            const index = event.nativeEvent.position;
            setSelectedTab(index === 0 ? "scores" : "news");
          }}
        >
          <View key="scores" style={styles.contentArea}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={renderRefreshControl()}
              contentInsetAdjustmentBehavior="never"
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

          <View key="news" style={styles.contentArea}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={renderRefreshControl()}
              contentInsetAdjustmentBehavior="never"
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