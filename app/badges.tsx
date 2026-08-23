import { CustomHeader } from "@/components/CustomHeader";
import BadgeCard from "@/components/Profile/Badges/BadgeCard";
import PillTabs from "@/components/TabBars/PillTabs";
import { Colors, Fonts, globalStyles } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useBadges } from "@/hooks/ForumHooks/useBadges";
import type { BadgeFilter } from "@/types/badges";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FILTER_OPTIONS: {
  label: string;
  value: BadgeFilter;
}[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Earned",
    value: "earned",
  },
  {
    label: "Locked",
    value: "locked",
  },
];

type RouteParam = string | string[] | undefined;

const normalizeRouteParam = (param: RouteParam) => {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
};

export default function BadgesScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const styles = badgeScreenStyles(isDark);
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ userId?: RouteParam }>();
  const userId = useMemo(
    () => normalizeRouteParam(params.userId).trim(),
    [params.userId],
  );

  const [selectedFilter, setSelectedFilter] = useState<BadgeFilter>("all");

  const {
    badges,
    summary,
    stats,
    loading,
    refreshing,
    error,
    refresh,
    refetch,
  } = useBadges({
    userId: userId || undefined,
  });

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const filteredBadges = useMemo(() => {
    if (selectedFilter === "earned") {
      return badges.filter((badge) => badge.isEarned);
    }

    if (selectedFilter === "locked") {
      return badges.filter((badge) => !badge.isEarned);
    }

    return badges;
  }, [badges, selectedFilter]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader title="Badges" tabName="Badges" onBack={goBack} />
      ),
    });
  }, [goBack, navigation]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={isDark ? Colors.white : Colors.black}
        />
      }
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryTextContainer}>
            <Text selectable style={styles.summaryTitle}>
              Badge collection
            </Text>

            <Text selectable style={styles.summaryDescription}>
              Participate in forums and earn recognition from the Tempo
              community.
            </Text>
          </View>

          <View style={styles.summaryCount}>
            <Text selectable style={styles.earnedCount}>
              {summary.earnedCount}
            </Text>

            <Text selectable style={styles.totalCount}>
              / {summary.totalCount}
            </Text>
          </View>
        </View>

        <View style={styles.summaryProgressTrack}>
          <View
            style={[
              styles.summaryProgressFill,
              {
                width: `${summary.completionPercent}%` as `${number}%`,
              },
            ]}
          />
        </View>

        <View style={styles.statsRow}>
          <StatItem label="Posts" value={stats.postsCreated} isDark={isDark} />

          <StatItem label="Likes" value={stats.likesReceived} isDark={isDark} />

          <StatItem
            label="Comments"
            value={stats.commentsReceived}
            isDark={isDark}
          />

          <StatItem
            label="Shares"
            value={stats.sharesReceived}
            isDark={isDark}
          />
        </View>
      </View>

      <PillTabs
        tabs={FILTER_OPTIONS}
        selectedValue={selectedFilter}
        onChange={setSelectedFilter}
      />

      {loading ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator
            size="small"
            color={isDark ? Colors.white : Colors.black}
          />

          <Text selectable style={styles.statusText}>
            Loading badges
          </Text>
        </View>
      ) : error ? (
        <View style={styles.statusContainer}>
          <Text selectable style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={refetch}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.badgeList}>
          {filteredBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} isDark={isDark} />
          ))}
        </View>
      )}

      {!loading && !error && filteredBadges.length === 0 && (
        <View style={global.emptyContainer}>
          <Text selectable style={global.emptyText}>
            No badges match this filter
          </Text>

          <Text selectable style={global.emptySubText}>
            Try a different badge filter.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

type StatItemProps = {
  label: string;
  value: number;
  isDark: boolean;
};

function StatItem({ label, value, isDark }: StatItemProps) {
  const styles = badgeScreenStyles(isDark);

  return (
    <View style={styles.statItem}>
      <Text selectable style={styles.statValue}>
        {value.toLocaleString()}
      </Text>

      <Text selectable style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

export const badgeScreenStyles = (isDark: boolean) =>
  StyleSheet.create({
    contentContainer: {
      gap: 18,
      padding: 16,
      paddingBottom: 80,
    },

    summaryCard: {
      gap: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 18,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    summaryHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
    },

    summaryTextContainer: {
      flex: 1,
      gap: 5,
    },

    summaryTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 21,
      color: isDark ? Colors.white : Colors.black,
    },

    summaryDescription: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    summaryCount: {
      flexDirection: "row",
      alignItems: "baseline",
    },

    earnedCount: {
      fontFamily: Fonts.BOLD,
      fontSize: 30,
      color: isDark ? Colors.white : Colors.black,
    },

    totalCount: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    summaryProgressTrack: {
      height: 9,
      borderRadius: 999,
      backgroundColor: isDark
        ? Colors.dark.transparentBlue
        : Colors.light.transparentBlue,
      overflow: "hidden",
    },

    summaryProgressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: isDark ? Colors.dark.blue : Colors.light.blue,
    },

    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },

    statItem: {
      flex: 1,
      alignItems: "center",
      gap: 3,
    },

    statValue: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },

    statLabel: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 11,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    badgeList: {
      gap: 12,
    },

    statusContainer: {
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      minHeight: 180,
      padding: 18,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    statusText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    errorText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      lineHeight: 21,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },

    retryButton: {
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    retryText: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: isDark ? Colors.black : Colors.white,
    },
  });
