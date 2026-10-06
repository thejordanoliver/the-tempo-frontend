import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  Fonts,
  PLACEHOLDER_AVATAR,
  globalStyles,
} from "constants/styles";
import { Image } from "expo-image";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type {
  FanPredictionRanking,
  FanPredictionSortOrder,
} from "types/fanPredictions";
import PillTabs from "../TabBars/PillTabs";

type Props = {
  record: FanPredictionRanking | null;
  isDark: boolean;
  sort: FanPredictionSortOrder;
  onSort: (sort: FanPredictionSortOrder) => void;
};
export default function FanPredictionHistoryHeader({
  record,
  isDark,
  sort,
  onSort,
}: Props) {
  const styles = useMemo(() => headerStyles(isDark), [isDark]);
  const colors = isDark ? Colors.dark : Colors.light;
  return (
    <View style={styles.header}>
      {record ? (
        <View style={styles.summary}>
          <View style={styles.identity}>
            <Image
              source={record.profileImage || PLACEHOLDER_AVATAR}
              style={styles.avatar}
            />
            <View style={styles.copy}>
              <Text style={styles.name} numberOfLines={1}>
                {record.username}
              </Text>
            </View>
            {record.rank != null ? (
              <View style={styles.rank}>
                <Ionicons name="trophy-outline" size={14} color={colors.gold} />
                <Text style={styles.rankText}>#{record.rank}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.stats}>
            {[
              {
                label: "Points",
                value: (record.points ?? record.correct).toLocaleString(),
              },
              {
                label: "Accuracy",
                value: record.accuracy == null ? "—" : `${record.accuracy}%`,
              },
              { label: "Pending", value: record.pending.toLocaleString() },
            ].map((stat) => (
              <View key={stat.label} style={styles.stat}>
                <Text style={styles.value}>{stat.value}</Text>
                <Text style={styles.label}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      <View style={styles.section}>
        <Text style={styles.title}>Prediction history</Text>
      </View>
      <PillTabs<FanPredictionSortOrder>
        tabs={[
          { label: "Newest first", value: "newest" },
          { label: "Oldest first", value: "oldest" },
        ]}
        selectedValue={sort}
        onChange={onSort}
        containerStyle={styles.sort}
        tabStyle={styles.sortTab}
        scrollable={false}
      />
    </View>
  );
}
const headerStyles = (isDark: boolean) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const global = globalStyles(isDark);
  return StyleSheet.create({
    header: { gap: 14, marginBottom: 16 },
    summary: {
      padding: 16,
      gap: 18,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: colors.transparentItemBackground,
    },
    identity: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    copy: { flex: 1, minWidth: 0, gap: 3 },
    eyebrow: {
      ...global.caption,
      fontSize: 10,
      letterSpacing: 1,
      fontFamily: Fonts.MEDIUM,
    },
    name: { ...global.title },
    rank: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.transparentGold,
    },
    rankText: { ...global.caption, color: colors.gold, fontFamily: Fonts.BOLD },
    stats: {
      flexDirection: "row",
      paddingTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    stat: { flex: 1, gap: 4 },
    value: { ...global.subheading, fontVariant: ["tabular-nums"] },
    label: { ...global.caption },
    section: { gap: 4, marginTop: 4 },
    title: { ...global.title },
    sort: { marginTop: 0, marginBottom: 0 },
    sortTab: { minHeight: 44 },
  });
};
