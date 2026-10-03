import { useMemo } from "react";
import { View } from "react-native";
import { fanRankingRowStyles } from "styles/FanPredictionStyles/FanRankingRowStyles";
import { fanPredictionRankingsStyles } from "styles/FanPredictionStyles/FanPredictionRankingsStyles";
import { SkeletonBlock, SkeletonCircle } from "./primitives";

export default function FanPredictionRankingsSkeleton({ isDark }: { isDark: boolean }) {
  const row = useMemo(() => fanRankingRowStyles(isDark), [isDark]);
  const screen = useMemo(() => fanPredictionRankingsStyles(isDark), [isDark]);

  return (
    <View>
      {[0, 1, 2, 3].map(index => (
        <View key={index}>
          {index > 0 ? <View style={screen.separator} /> : null}
          <View style={row.row}>
            <SkeletonBlock width={36} height={36} radius={8} />
            <View style={row.content}>
              <View style={row.identity}>
                <SkeletonCircle size={32} />
                <View style={row.skeletonIdentity}>
                  <SkeletonBlock width="65%" height={18} />
                </View>
              </View>
              <View style={row.stats}>
                {[0, 1, 2].map(stat => (
                  <View key={stat} style={row.stat}>
                    <SkeletonBlock width="65%" height={26} />
                    <SkeletonBlock width="80%" height={16} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
