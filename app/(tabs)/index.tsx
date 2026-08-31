import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useRef } from "react";
import { Animated, RefreshControl, ScrollView, View } from "react-native";
import PagerView, {
  type PagerViewOnPageScrollEvent,
} from "react-native-pager-view";
import {
  CustomHeader,
  type HomeHeaderTab,
} from "../../components/CustomHeader";
import FavoritesScroll from "../../components/Favorites/FavoritesScroll";
import LeagueGamesList from "../../components/League/LeagueGamesList";
import NewsList from "../../components/News/NewsList";
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
  const [selectedTab, setSelectedTab] = React.useState<HomeHeaderTab>("scores");

  const pagerRef = useRef<PagerView>(null);
  const homeTabScrollProgress = useRef(new Animated.Value(0)).current;

  const handleHeaderTabPress = useCallback((tab: HomeHeaderTab) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tab === "scores" ? 0 : 1);
  }, []);

  const handlePageScroll = useCallback(
    (event: PagerViewOnPageScrollEvent) => {
      const { offset, position } = event.nativeEvent;
      homeTabScrollProgress.setValue(position + offset);
    },
    [homeTabScrollProgress],
  );

  const {
    favorites,
    refreshing,
    handleRefresh,
    homeGameSections,
    articles,
    newsError,
    newsLoading,
    loading: gamesLoading,
  } = useHomeData(selectedTab);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Home"
          homeSelectedTab={selectedTab}
          onHomeTabPress={handleHeaderTabPress}
          homeScrollProgress={homeTabScrollProgress}
          onNotificationsCenter={() => router.navigate("/notification-center")}
          unreadNotificationCount={10}
        />
      ),
    });
  }, [handleHeaderTabPress, homeTabScrollProgress, navigation, selectedTab]);

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
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={!isDraggingFavorites}
          onPageScroll={handlePageScroll}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            homeTabScrollProgress.setValue(index);
            setSelectedTab(index === 0 ? "scores" : "news");
          }}
        >
          {/* SCORES PAGE */}
          <View key="scores" style={styles.contentArea}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={refreshControl()}
            >
              <FavoritesScroll
                favoriteTeamIds={favorites}
                onDragStart={() => setIsDraggingFavorites(true)}
                onDragEnd={() => setIsDraggingFavorites(false)}
                isDark={isDark}
              />

              <LeagueGamesList
                sections={homeGameSections}
                loading={gamesLoading}
                isDark={isDark}
                viewMode={viewMode}
              />
            </ScrollView>
          </View>

          {/* NEWS */}
          <View key="news" style={styles.contentArea}>
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
