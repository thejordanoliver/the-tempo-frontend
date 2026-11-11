import { FanPredictionStyles } from "@/styles/FanPredictionStyles/FanPredictionStyles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import { Text, View } from "react-native";
import FanRankingsLink from "./FanRankingsLink";

export default function FanPredictionFooter() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);

  return (
    <View style={styles.footer}>
      <Text style={styles.rankingHint}>
        Correct picks earn 1 or 2 points. Values lock at game time.
      </Text>
      <FanRankingsLink compact />
    </View>
  );
}
