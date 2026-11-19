import { CustomHeader } from "components/CustomHeader";
import FavoritesScroll from "components/Favorites/FavoritesScroll";
import ForYouFeed from "components/Home/ForYouFeed";
import LeagueGamesList from "components/League/Games/LeagueGamesList";
import { Colors } from "constants/styles";
import { useNotifications } from "contexts/NotificationContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation, useScrollToTop } from "expo-router";
import type { ForYouPage } from "hooks/useForYouFeed";
import { useHomeData } from "hooks/useHomeData";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { homeStyles } from "styles/HomeStyles/HomeStyles";

export default function HomeScreen() {
  const router = useScopedRouter();
  const { resolvedColorScheme, viewMode } = usePreferences();
  const { unreadNotificationCount } = useNotifications();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = homeStyles(isDark);
  const homeListRef = React.useRef<FlatList<ForYouPage>>(null);

  // Re-tapping the active Home tab scrolls the entire feed to its beginning.
  useScrollToTop(homeListRef);

  const [showPersonalizedFeed, setShowPersonalizedFeed] = React.useState(false);
  const viewportHeightRef = React.useRef(0);
  const contentHeightRef = React.useRef(0);
  const scrollOffsetRef = React.useRef(0);

  const {
    refreshing,
    handleRefresh,
    homeGameSections,
    forYouArticles,
    forYouPosts,
    forYouPages,
    forYouPredictions,
    favoriteLeagues,
    currentUserId,
    forYouError,
    forYouLoading,
    forYouLoadingMore,
    forYouHasMore,
    forYouLoaded,
    forYouLoadMoreError,
    loadMoreForYou,
    loading: gamesLoading,
  } = useHomeData("scores", showPersonalizedFeed);

  const maybeLoadPersonalizedFeed = useCallback(
    (scrollY: number) => {
      if (
        gamesLoading ||
        viewportHeightRef.current <= 0 ||
        contentHeightRef.current <= 0
      ) {
        return;
      }

      if (
        scrollY + viewportHeightRef.current + 500 >=
        contentHeightRef.current
      ) {
        setShowPersonalizedFeed(true);
      }
    },
    [gamesLoading],
  );

  const maybeLoadMoreFeed = useCallback(
    (scrollY: number) => {
      if (
        !showPersonalizedFeed ||
        !forYouLoaded ||
        forYouLoading ||
        forYouLoadingMore ||
        !forYouHasMore ||
        forYouLoadMoreError ||
        viewportHeightRef.current <= 0 ||
        contentHeightRef.current <= 0
      ) {
        return;
      }

      if (
        scrollY + viewportHeightRef.current + 600 >=
        contentHeightRef.current
      ) {
        void loadMoreForYou();
      }
    },
    [
      showPersonalizedFeed,
      forYouLoaded,
      forYouLoading,
      forYouLoadingMore,
      forYouHasMore,
      forYouLoadMoreError,
      loadMoreForYou,
    ],
  );

  React.useEffect(() => {
    maybeLoadPersonalizedFeed(scrollOffsetRef.current);
  }, [homeGameSections, maybeLoadPersonalizedFeed]);

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
      <FlatList<ForYouPage>
        ref={homeListRef}
        style={styles.contentArea}
        contentContainerStyle={navigationContentStyle()}
        data={showPersonalizedFeed ? forYouPages : []}
        keyExtractor={(_, index) => `home-feed-page-${index}`}
        renderItem={({ item, index }) => (
          <View style={index === 0 ? styles.feedSection : undefined}>
            <ForYouFeed
              articles={item.articles}
              posts={item.posts}
              pages={[item]}
              predictions={index === 0 ? forYouPredictions : []}
              favoriteLeagues={favoriteLeagues}
              currentUserId={currentUserId}
              isDark={isDark}
              loading={false}
              error={null}
            />
          </View>
        )}
        ListHeaderComponent={
          <>
            <FavoritesScroll isDark={isDark} />
            <LeagueGamesList
              sections={homeGameSections}
              loading={gamesLoading}
              isDark={isDark}
              viewMode={viewMode}
            />
          </>
        }
        ListFooterComponent={
          showPersonalizedFeed ? (
            <View style={styles.feedSection}>
              {forYouPages.length === 0 && (
                <ForYouFeed
                  articles={forYouArticles}
                  posts={forYouPosts}
                  pages={[]}
                  predictions={forYouPredictions}
                  favoriteLeagues={favoriteLeagues}
                  currentUserId={currentUserId}
                  isDark={isDark}
                  loading={forYouLoading}
                  error={forYouError}
                />
              )}
              {forYouLoadingMore && (
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                  <ActivityIndicator
                    color={isDark ? Colors.white : Colors.black}
                  />
                </View>
              )}
              {forYouLoadMoreError && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => void loadMoreForYou(true)}
                  style={{ alignItems: "center", paddingVertical: 20 }}
                >
                  <Text style={styles.errorText}>
                    Couldn’t load more. Tap to retry.
                  </Text>
                </TouchableOpacity>
              )}
              {forYouLoaded &&
                !forYouHasMore &&
                !forYouLoadingMore &&
                !forYouLoadMoreError &&
                forYouPages.length > 0 && (
                  <Text style={styles.emptyText}>{`You're all caught up.`}</Text>
                )}
            </View>
          ) : undefined
        }
        refreshControl={refreshControl()}
        showsVerticalScrollIndicator={false}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={5}
        onLayout={(event) => {
          viewportHeightRef.current = event.nativeEvent.layout.height;
          maybeLoadPersonalizedFeed(scrollOffsetRef.current);
          maybeLoadMoreFeed(scrollOffsetRef.current);
        }}
        onContentSizeChange={(_, height) => {
          contentHeightRef.current = height;
          maybeLoadPersonalizedFeed(scrollOffsetRef.current);
          maybeLoadMoreFeed(scrollOffsetRef.current);
        }}
        onScroll={(event) => {
          scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
          maybeLoadPersonalizedFeed(scrollOffsetRef.current);
          maybeLoadMoreFeed(scrollOffsetRef.current);
        }}
        onEndReached={() => {
          maybeLoadPersonalizedFeed(scrollOffsetRef.current);
          maybeLoadMoreFeed(scrollOffsetRef.current);
        }}
        onEndReachedThreshold={0.6}
        scrollEventThrottle={100}
      />
    </View>
  );
}
