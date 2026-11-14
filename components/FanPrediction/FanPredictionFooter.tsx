import { FanPredictionStyles } from "@/styles/FanPredictionStyles/FanPredictionStyles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import { View } from "react-native";
import FanRankingsLink from "./FanRankingsLink";

export default function FanPredictionFooter() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);

  return (
    <View style={styles.footer}>
      <FanRankingsLink compact />
    </View>
  );
}
