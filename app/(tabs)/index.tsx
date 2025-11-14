// screens/HomeScreen.tsx
import { useNavigation } from "@react-navigation/native";
import CombinedGamesList from "components/CombinedGamesList";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import FavoritesScroll from "components/Favorites/FavoritesScroll";
import FavoritesScrollSkeleton from "components/Favorites/FavoritesScrollSkeleton";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import TabBar from "components/TabBar";
import { Colors } from "constants/Colors";
import { useHomeData } from "hooks/useHomeData";
import React, { useLayoutEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/indexStyles";
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);
  const navigation = useNavigation();

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

  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>
        <View style={styles.tabBarWrapper}>
          <TabBar
            tabs={["scores", "news"]}
            selected={selectedTab}
            onTabPress={setSelectedTab}
          />
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDark ? Colors.white : Colors.black}
              colors={[isDark ? Colors.white : Colors.black]}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {selectedTab === "scores" ? (
            <>
              {loading ? (
                <FavoritesScrollSkeleton />
              ) : (
                <FavoritesScroll
                  favoriteTeamIds={favorites}
                  onFavoritesChange={setFavorites}
                />
              )}
              <CombinedGamesList
                gamesByCategory={gamesByCategory}
                loading={loading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </>
          ) : newsError ? (
            <Text style={styles.emptyText}>{newsError}</Text>
          ) : (
            <NewsHighlightsList
              items={combinedNewsAndHighlights}
              loading={loading}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}
