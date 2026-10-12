import FanPredictionHistoryRow from "components/FanPrediction/FanPredictionHistoryRow";
import Button from "components/Buttons/Button";
import { SkeletonBlock } from "components/Skeletons/primitives";
import { Colors, globalStyles } from "constants/styles";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { FanPredictionPick, FanPredictionRanking } from "types/fanPredictions";
import HeadingTwo from "../Headings/HeadingTwo";
import Subheading from "../Headings/Subheading";

const GRID_GAP = 8;
const CARD_HEIGHT = 130;

type Props = {
  isDark: boolean;
  itemWidth: number;
  record: FanPredictionRanking | null;
  picks: FanPredictionPick[];
  onPick: (pick: FanPredictionPick) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onPredictions?: () => void;
  onAnalysis?: () => void;
};

export default function ProfilePredictions({
  isDark,
  itemWidth,
  record,
  picks,
  onPick,
  loading,
  error,
  onRetry,
  onPredictions,
}: Props) {
  const isTopTen = record?.rank ? record?.rank < 10 : false;

  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const styles = ProfilePredictionsStyles(isDark, itemWidth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [recentCollapsed, setRecentCollapsed] = useState(false);

  if (error)
    return (
      <>
        <HeadingTwo isDark={isDark}>Predictions</HeadingTwo>
        <View accessibilityRole="alert">
          <Text style={global.secondaryText}>{error}</Text>
          <Button
            isDark={isDark}
            variant="text"
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry prediction stats"
          >
            Retry
          </Button>
        </View>
      </>
    );

  if (loading)
    return (
      <>
        <HeadingTwo isDark={isDark}>Predictions</HeadingTwo>
        <View style={styles.grid}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={styles.gridItem}>
              <SkeletonBlock width="70%" height={28} />
              <SkeletonBlock width="80%" height={16} />
            </View>
          ))}
        </View>
      </>
    );

  if (!record)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>
          No predictions yet. Pick a winner before a game starts.
        </Text>
      </View>
    );

  return (
    <View>
      <HeadingTwo isDark={isDark}>Prediction Stats</HeadingTwo>
      <Subheading
        collapsible
        collapsed={isCollapsed}
        onToggle={() => setIsCollapsed((collapsed) => !collapsed)}
      >
        Stats
      </Subheading>

      {!isCollapsed && (
        <View style={styles.grid}>
          {[
            {
              label: "Rank",
              value: record?.rank != null ? `#${record.rank}` : "—",
            },
            {
              label: "Accuracy",
              value: record?.accuracy != null ? `${record.accuracy}%` : "—",
            },
            {
              label: "Total picks",
              value: (
                (record?.graded ?? 0) + (record?.pending ?? 0)
              ).toLocaleString(),
            },
          ].map((stat) => (
            <View key={stat.label} style={styles.gridItem}>
              <Text
                style={[global.subheading, isTopTen ? styles.topTen : null]}
              >
                {stat.value}
              </Text>
              <Text style={global.caption}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}
      <Subheading
        collapsible
        collapsed={recentCollapsed}
        onToggle={() => setRecentCollapsed((collapsed) => !collapsed)}
      >
        Recent Predictions
      </Subheading>

      {!recentCollapsed && (
        <View style={styles.recentPredictions}>
          {picks.slice(0, 6).map((pick) => (
            <FanPredictionHistoryRow
              key={`${pick.sport}:${pick.league}:${pick.gameId}`}
              pick={pick}
              isDark={isDark}
              onPress={() => onPick(pick)}
            />
          ))}
          {picks.length === 0 && (
            <Text style={global.emptyText}>No recent predictions yet.</Text>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        {onPredictions ? (
          <Button
            isDark={isDark}
            onPress={onPredictions}
            accessibilityRole="button"
            accessibilityLabel="View prediction rankings"
          >
            View Predictions
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const ProfilePredictionsStyles = (isDark: boolean, itemWidth: number) =>
  StyleSheet.create({
    topTen: {
      color: isDark ? Colors.dark.gold : Colors.light.gold,
    },
    stats: {
      flexDirection: "row",
      gap: GRID_GAP,
      justifyContent: "center",
      alignItems: "center",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      rowGap: GRID_GAP,
      columnGap: GRID_GAP,
      marginBottom: GRID_GAP,
    },
    gridItem: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 20,
      width: itemWidth,
      height: CARD_HEIGHT,
      paddingHorizontal: 8,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },
    recentPredictions: {
      gap: GRID_GAP,
    },
    buttonContainer: {
      width: "100%",
      marginVertical: 12,
    },
  });
