import FanPredictionAnalysis from "@/components/FanPrediction/FanPredictionAnalysis";
import FanRankingRow from "@/components/FanPrediction/FanRankingRow";
import FanRankingsHeader from "@/components/FanPrediction/FanRankingsHeader";
import { usePagerTabScrollProgress } from "@/hooks/usePagerTabScrollProgress";
import { Ionicons } from "@expo/vector-icons";
import Button from "components/Buttons/Button";
import { CustomHeader } from "components/CustomHeader";
import FanPredictionRankingsSkeleton from "components/Skeletons/FanPredictionRankingsSkeleton";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { useFanPredictionAnalytics } from "hooks/useFanPredictionAnalytics";
import { useFanPredictionRankings } from "hooks/useFanPredictionRankings";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { fanPredictionRankingsStyles } from "styles/FanPredictionStyles/FanPredictionRankingsStyles";

const TABS = ["Rankings", "Analysis"] as const;
type FanPredictionTab = (typeof TABS)[number];

export default function FanPredictionRankingsScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => fanPredictionRankingsStyles(isDark), [isDark]);
  const navigation = useNavigation();
  const router = useScopedRouter();
  const contentStyle = useNavigationBarContentStyle();
  const [selectedTab, setSelectedTab] = useState<FanPredictionTab>("Rankings");
  const { data, loading, refreshing, error, refresh } =
    useFanPredictionRankings();
  const analytics = useFanPredictionAnalytics();
  const refreshAnalytics = analytics.refresh;
  const refreshAll = useCallback(() => {
    refresh();
    void refreshAnalytics();
  }, [refresh, refreshAnalytics]);
  const pagerRef = useRef<PagerView>(null);
  const { scrollProgress, handlePageScroll, syncPageScrollProgress } =
    usePagerTabScrollProgress();
  const tabToIndex = (tab: (typeof TABS)[number]) => TABS.indexOf(tab);
  const indexToTab = (index: number) => TABS[index];
  const handleTabPress = (tab: (typeof TABS)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));
  };
  const handlePageChange = (index: number) => {
    syncPageScrollProgress(index);
    setSelectedTab(indexToTab(index));
  };

  const rankings = data?.rankings ?? [];
  const me = data?.me ?? null;
  const refreshControl = (
    <RefreshControl
      refreshing={refreshing || (analytics.loading && analytics.data != null)}
      onRefresh={refreshAll}
      tintColor={colors.text}
    />
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={
            selectedTab === "Rankings" ? "Fan Rankings" : "Prediction Analysis"
          }
          tabName="Fan Rankings"
          onBack={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation, selectedTab]);

  const openUser = useCallback(
    (userId: number) => {
      router.push({
        pathname: "/fan-prediction-picks",
        params: { userId: String(userId) },
      });
    },
    [router],
  );

  return (
    <View style={styles.screen}>
      <MainScrollTabBar
        tabs={TABS}
        selected={selectedTab}
        onTabPress={handleTabPress}
        scrollProgress={scrollProgress}
        isDark={isDark}
      />
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={tabToIndex(selectedTab)}
        onPageScroll={handlePageScroll}
        onPageSelected={(event) => handlePageChange(event.nativeEvent.position)}
      >
        <View key="Rankings" style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={contentStyle(styles.content)}
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
          >
            <FanPredictionAnalysis
              isDark={isDark}
              data={analytics.data}
              loading={analytics.loading}
              error={analytics.error}
              onRetry={() => {
                void analytics.refresh();
              }}
            />
          </ScrollView>
        </View>

        <View key="Analysis" style={{ flex: 1 }}>
          <FlatList
            style={styles.screen}
            contentContainerStyle={contentStyle(styles.content)}
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            data={rankings}
            extraData={resolvedColorScheme}
            keyExtractor={(entry) => String(entry.userId)}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={refreshControl}
            ListHeaderComponent={
              <>
                <FanRankingsHeader
                  isDark={isDark}
                  me={me}
                  rankings={rankings}
                  showLeaderboard={loading || rankings.length > 0}
                  onOpenUser={openUser}
                />
                {error ? (
                  <View accessibilityRole="alert" style={styles.status}>
                    <Text style={styles.description}>{error}</Text>
                    <Button
                      accessibilityRole="button"
                      accessibilityLabel="Retry loading rankings"
                      onPress={refresh}
                      isDark={isDark}
                      style={styles.retry}
                      disabled={refreshing}
                    >
                      {refreshing ? "Retrying…" : "Try again"}
                    </Button>
                  </View>
                ) : null}
              </>
            }
            renderItem={({ item }) => (
              <FanRankingRow
                entry={item}
                isDark={isDark}
                isCurrentUser={item.userId === me?.userId}
                onPress={() => openUser(item.userId)}
              />
            )}
            ListEmptyComponent={
              loading ? (
                <FanPredictionRankingsSkeleton isDark={isDark} />
              ) : !error ? (
                <View style={styles.empty}>
                  <Ionicons
                    name="podium-outline"
                    size={36}
                    color={colors.icon}
                    accessible={false}
                  />
                  <Text style={styles.emptyTitle}>
                    The leaderboard starts with you
                  </Text>
                  <Text style={styles.emptyText}>
                    Pick a winner before a game starts. Your rank appears once
                    your first prediction has a scored result.
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      </PagerView>
    </View>
  );
}
