import { useNavigation } from "@react-navigation/native";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoritesScroll from "components/Favorites/FavoritesScroll";
import CombinedGamesList from "components/League/CombinedGamesList";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import TabBar from "components/TabBar";
import { Colors } from "constants/Styles";
import { useHomeData } from "hooks/useHomeData";
import React, { useRef } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { homeStyles } from "styles/HomeStyles/HomeStyles";

export default function HomeScreen() {
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = homeStyles(isDark, insets.top);

  const [isDraggingFavorites, setIsDraggingFavorites] = React.useState(false);

  const pagerRef = useRef<PagerView>(null);

  const [selectedTab, setSelectedTab] = React.useState<"scores" | "news">(
    "scores",
  );

  const {
    favorites,
    refreshing,
    handleRefresh,
    gamesByCategory,
    combinedNewsAndHighlights,
    newsError,
    loading,
  } = useHomeData(selectedTab);

  // --------------------------------------------------
  // Header
  // --------------------------------------------------
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeaderTitle tabName="Home" />,
    });
  }, [navigation]);

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
            isDark={isDark}
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
              <FavoritesScroll
                favoriteTeamIds={favorites}
                loading={loading}
                onDragStart={() => setIsDraggingFavorites(true)}
                onDragEnd={() => setIsDraggingFavorites(false)}
              />

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
