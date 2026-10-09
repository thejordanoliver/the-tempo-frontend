import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { gameCardStyles } from "styles/GamecardStyles/GameCardStyles";
import { fanPredictionHistoryRowStyles } from "styles/FanPredictionStyles/FanPredictionHistoryRowStyles";
import { fanPredictionRankingsStyles } from "styles/FanPredictionStyles/FanPredictionRankingsStyles";
import { SkeletonBlock } from "./primitives";

export default function FanPredictionHistorySkeleton({ isDark }: { isDark: boolean }) {
  const row = useMemo(() => fanPredictionHistoryRowStyles(isDark), [isDark]);
  const screen = useMemo(() => fanPredictionRankingsStyles(isDark), [isDark]);
  const game = useMemo(() => gameCardStyles(isDark), [isDark]);
  const team = (picked: boolean) => (
    <View style={game.teamSection}>
      <SkeletonBlock width={game.logo.width} height={game.logo.height} radius={8} />
      <View style={styles.teamName}>
        <SkeletonBlock width={36} height={12} />
      </View>
      <View style={[row.pickSpacer, styles.centered]}>
        {picked ? <SkeletonBlock width={30} height={10} radius={3} /> : null}
      </View>
    </View>
  );
  const score = () => (
    <View style={[styles.centered, { width: game.teamScore.width }]}>
      <SkeletonBlock width={30} height={game.teamScore.fontSize} />
    </View>
  );
  return (
    <View accessibilityLabel="Loading prediction history" accessibilityState={{ busy: true }}>
      {[0, 1, 2, 3].map(index => (
        <View key={index}>
          {index > 0 ? <View style={screen.separator} /> : null}
          <View style={row.container} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={row.card}>
              {team(true)}
              {score()}
              <View style={row.info}>
                <View style={game.infoWrapper}>
                  <SkeletonBlock width={24} height={12} radius={3} />
                  <SkeletonBlock style={game.statusDivider} radius={0} />
                  <SkeletonBlock width={32} height={12} radius={3} />
                </View>
              </View>
              {score()}
              {team(false)}
            </View>
            <View style={row.footer}>
              <View style={row.pickSummary}><SkeletonBlock width="75%" height={12} /></View>
              <View style={row.outcomeBadge}>
                <SkeletonBlock width={13} height={13} radius={7} />
                <View style={styles.outcomeText}>
                  <SkeletonBlock width={42} height={11} radius={3} />
                </View>
              </View>
              <SkeletonBlock width={14} height={14} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  teamName: {
    marginTop: 4,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  outcomeText: {
    height: 16,
    justifyContent: "center",
  },
});
