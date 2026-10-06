import Button from "components/Buttons/Button";
import { CustomHeader } from "components/CustomHeader";
import FanPredictionHistoryHeader from "components/FanPrediction/FanPredictionHistoryHeader";
import FanPredictionHistoryRow from "components/FanPrediction/FanPredictionHistoryRow";
import FanPredictionHistorySkeleton from "components/Skeletons/FanPredictionHistorySkeleton";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useUserPredictionPicks } from "hooks/useUserPredictionPicks";
import { useLayoutEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { fanPredictionRankingsStyles } from "styles/FanPredictionStyles/FanPredictionRankingsStyles";
import type { FanPredictionSortOrder } from "types/fanPredictions";

export default function FanPredictionPicksScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => fanPredictionRankingsStyles(isDark), [isDark]);
  const navigation = useNavigation();
  const router = useScopedRouter();
  const contentStyle = useNavigationBarContentStyle();
  const [sort, setSort] = useState<FanPredictionSortOrder>("newest");
  const { data, loading, error, refresh, loadMore } = useUserPredictionPicks(
    Number(userId),
    sort,
  );
  const title = data?.record?.username
    ? `${data.record.username}’s predictions`
    : "Fan predictions";
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={title}
          tabName="Fan predictions"
          onBack={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation, title]);
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      style={styles.screen}
      contentContainerStyle={contentStyle(styles.content)}
      contentInsetAdjustmentBehavior="automatic"
      data={data?.picks ?? []}
      keyExtractor={(pick) => `${pick.sport}:${pick.league}:${pick.gameId}`}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl
          refreshing={loading && data != null}
          onRefresh={refresh}
          tintColor={colors.text}
        />
      }
      ListHeaderComponent={
        <FanPredictionHistoryHeader
          record={data?.record ?? null}
          isDark={isDark}
          sort={sort}
          onSort={setSort}
        />
      }
      renderItem={({ item: pick }) => (
        <FanPredictionHistoryRow
          pick={pick}
          isDark={isDark}
          onPress={() =>
            router.push({
              pathname: "/game/[sport]/[game]",
              params: {
                sport: pick.sport,
                game: pick.gameId,
                league: pick.league,
                date: pick.startsAt,
              },
            })
          }
        />
      )}
      ListEmptyComponent={
        loading ? (
          <FanPredictionHistorySkeleton isDark={isDark} />
        ) : !error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No predictions yet</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        error ? (
          <View style={styles.status}>
            <Text style={styles.description}>{error}</Text>
            <Button
              accessibilityRole="button"
              accessibilityLabel="Retry loading predictions"
              isDark={isDark}
              onPress={data?.nextOffset != null ? loadMore : refresh}
            >
              Try again
            </Button>
          </View>
        ) : data?.nextOffset != null ? (
          <Button
            accessibilityRole="button"
            accessibilityLabel="Load more predictions"
            isDark={isDark}
            onPress={loadMore}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more predictions"}
          </Button>
        ) : null
      }
    />
  );
}
