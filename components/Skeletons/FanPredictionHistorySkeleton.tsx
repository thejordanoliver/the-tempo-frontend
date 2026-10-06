import { useMemo } from "react";
import { View } from "react-native";
import { fanPredictionHistoryRowStyles } from "styles/FanPredictionStyles/FanPredictionHistoryRowStyles";
import { fanPredictionRankingsStyles } from "styles/FanPredictionStyles/FanPredictionRankingsStyles";
import { SkeletonBlock } from "./primitives";

export default function FanPredictionHistorySkeleton({ isDark }: { isDark: boolean }) {
  const row = useMemo(() => fanPredictionHistoryRowStyles(isDark), [isDark]);
  const screen = useMemo(() => fanPredictionRankingsStyles(isDark), [isDark]);
  const team = () => (
    <View style={row.team}>
      <SkeletonBlock width={40} height={40} radius={8} />
      <SkeletonBlock width={36} height={14} />
      <View style={row.pickSpacer} />
    </View>
  );
  return (
    <View accessibilityLabel="Loading prediction history" accessibilityState={{ busy: true }}>
      {[0, 1, 2, 3].map(index => (
        <View key={index}>
          {index > 0 ? <View style={screen.separator} /> : null}
          <View style={row.container} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={row.card}>
              {team()}
              <SkeletonBlock width={30} height={28} />
              <View style={row.info}>
                <SkeletonBlock width="60%" height={10} />
                <SkeletonBlock width="75%" height={12} />
                <SkeletonBlock width="50%" height={10} />
              </View>
              <SkeletonBlock width={30} height={28} />
              {team()}
            </View>
            <View style={row.footer}>
              <View style={row.pickSummary}><SkeletonBlock width="75%" height={12} /></View>
              <SkeletonBlock width={70} height={24} radius={6} />
              <SkeletonBlock width={14} height={14} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
