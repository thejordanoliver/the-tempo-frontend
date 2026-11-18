import { useNavigation } from "expo-router";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import React, { useCallback } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { CustomHeader } from "components/CustomHeader";
import FavoritesScroll from "components/Favorites/FavoritesScroll";
import ForYouFeed from "components/Home/ForYouFeed";
import LeagueGamesList from "components/League/Games/LeagueGamesList";
import { Colors } from "constants/styles";
import { useNotifications } from "contexts/NotificationContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useHomeData } from "hooks/useHomeData";
import { homeStyles } from "styles/HomeStyles/HomeStyles";

export default function HomeScreen() {
  const router = useScopedRouter();
  const { resolvedColorScheme, viewMode } = usePreferences();
  const { unreadNotificationCount } = useNotifications();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = homeStyles(isDark);

  const {
    refreshing,
    handleRefresh,
    homeGameSections,
    forYouArticles,
    forYouPosts,
    forYouPredictions,
    favoriteLeagues,
    currentUserId,
    forYouError,
    forYouLoading,
    loading: gamesLoading,
  } = useHomeData("scores");

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Home"
          onNotificationsCenter={() => router.navigate("/notification-center")}
          unreadNotificationCount={unreadNotificationCount}
        />
      ),
    });
  }, [navigation, router, unreadNotificationCount]);

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
      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={navigationContentStyle()}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl()}
      >
        <FavoritesScroll isDark={isDark} />

        <LeagueGamesList
          sections={homeGameSections}
          loading={gamesLoading}
          isDark={isDark}
          viewMode={viewMode}
        />

        <Text style={styles.feedTitle}>For You</Text>
        <ForYouFeed
          articles={forYouArticles}
          posts={forYouPosts}
          predictions={forYouPredictions}
          favoriteLeagues={favoriteLeagues}
          currentUserId={currentUserId}
          isDark={isDark}
          loading={forYouLoading}
          error={forYouError}
        />
      </ScrollView>
    </View>
  );
}
