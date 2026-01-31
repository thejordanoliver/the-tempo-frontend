import { useNavigation } from "@react-navigation/native";
import CombinedGamesList from "components/CombinedGamesList";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoritesScroll from "components/Favorites/FavoritesScroll";
import FavoritesScrollSkeleton from "components/Favorites/FavoritesScrollSkeleton";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import TabBar from "components/TabBar";
import { Colors } from "constants/Colors";
import { useHomeData } from "hooks/useHomeData";
import React, { useLayoutEffect, useRef } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import PagerView from "react-native-pager-view";
import { homeStyles } from "styles/HomeStyles/HomeStyles";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = homeStyles(isDark);
  const navigation = useNavigation();
  const [isDraggingFavorites, setIsDraggingFavorites] = React.useState(false);

  const pagerRef = useRef<PagerView>(null);

  const [selectedTab, setSelectedTab] = React.useState<"scores" | "news">(
    "scores"
  );

  const {
    favorites,
    setFavorites,
    refreshing,
    handleRefresh,
    gamesByCategory,
    combinedNewsAndHighlights,
    newsError,
    loading,
  } = useHomeData(selectedTab);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle title="Home" tabName="Home" isTeamScreen={false} />
      ),
    });
  }, [navigation, isDark]);

  const handleTabPress = (tab: "scores" | "news") => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tab === "scores" ? 0 : 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>
        <View style={styles.tabBarWrapper}>
          <TabBar
            tabs={["scores", "news"]}
            selected={selectedTab}
            onTabPress={handleTabPress}
          />
        </View>

        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={!isDraggingFavorites} // ✅ disable swipe while dragging
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            setSelectedTab(index === 0 ? "scores" : "news");
          }}
        >
          {/* -------- SCORES PAGE -------- */}
          <View key="scores">
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={isDark ? Colors.white : Colors.black}
                  colors={[isDark ? Colors.white : Colors.black]}
                />
              }
            >
              {loading ? (
                <FavoritesScrollSkeleton />
              ) : (
                <FavoritesScroll
                  favoriteTeamIds={favorites}
                  onFavoritesChange={setFavorites}
                  onDragStart={() => setIsDraggingFavorites(true)}
                  onDragEnd={() => setIsDraggingFavorites(false)}
                />
              )}

              <CombinedGamesList
                gamesByCategory={gamesByCategory}
                loading={loading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </ScrollView>
          </View>

          {/* -------- NEWS PAGE -------- */}
          <View key="news">
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={isDark ? Colors.white : Colors.black}
                  colors={[isDark ? Colors.white : Colors.black]}
                />
              }
            >
              <NewsHighlightsList
                items={combinedNewsAndHighlights}
                loading={loading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                error={newsError}
              />
            </ScrollView>
          </View>
        </PagerView>
      </View>
    </View>
  );
}
