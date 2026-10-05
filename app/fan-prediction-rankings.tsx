import { Ionicons } from "@expo/vector-icons";
import Button from "components/Buttons/Button";
import { CustomHeader } from "components/CustomHeader";
import FanPredictionRankingsSkeleton from "components/Skeletons/FanPredictionRankingsSkeleton";
import FanRankingRow from "components/Sports/Basketball/GameDetails/FanPrediction/FanRankingRow";
import FanRankingsHeader from "components/Sports/Basketball/GameDetails/FanPrediction/FanRankingsHeader";
import FanPredictionAnalysis from "components/Sports/Basketball/GameDetails/FanPrediction/FanPredictionAnalysis";
import { useFanPredictionAnalytics } from "hooks/useFanPredictionAnalytics";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { useFanPredictionRankings } from "hooks/useFanPredictionRankings";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useCallback, useLayoutEffect, useMemo } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { fanPredictionRankingsStyles } from "styles/FanPredictionStyles/FanPredictionRankingsStyles";

export default function FanPredictionRankingsScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => fanPredictionRankingsStyles(isDark), [isDark]);
  const navigation = useNavigation();
  const router = useScopedRouter();
  const contentStyle = useNavigationBarContentStyle();
  const { data, loading, refreshing, error, refresh } = useFanPredictionRankings();
  const analytics = useFanPredictionAnalytics();
  const refreshAnalytics = analytics.refresh;
  const refreshAll = useCallback(() => {
    refresh();
    void refreshAnalytics();
  }, [refresh, refreshAnalytics]);
  const rankings = data?.rankings ?? [];
  const me = data?.me ?? null;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title="Fan Rankings"
          tabName="Fan Rankings"
          onBack={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation]);

  const openUser = useCallback((userId: number) => {
    router.push({ pathname: "/user/[id]", params: { id: String(userId) } });
  }, [router]);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={contentStyle(styles.content)}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      data={rankings}
      extraData={resolvedColorScheme}
      keyExtractor={entry => String(entry.userId)}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl refreshing={refreshing || (analytics.loading && analytics.data != null)} onRefresh={refreshAll} tintColor={colors.text} />
      }
      ListHeaderComponent={
        <>
          <FanPredictionAnalysis
            isDark={isDark}
            data={analytics.data}
            loading={analytics.loading}
            error={analytics.error}
            onRetry={() => { void analytics.refresh(); }}
          />
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
              <Button onPress={refresh} isDark={isDark} style={styles.retry} disabled={refreshing}>
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
      ListEmptyComponent={loading ? (
        <FanPredictionRankingsSkeleton isDark={isDark} />
      ) : !error ? (
        <View style={styles.empty}>
          <Ionicons name="podium-outline" size={36} color={colors.icon} accessible={false} />
          <Text style={styles.emptyTitle}>The leaderboard starts with you</Text>
          <Text style={styles.emptyText}>Pick a winner before a game starts. Your rank appears once your first prediction has a scored result.</Text>
        </View>
      ) : null}
    />
  );
}
