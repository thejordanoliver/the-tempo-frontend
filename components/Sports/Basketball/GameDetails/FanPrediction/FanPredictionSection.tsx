import HeadingTwo from "components/Headings/HeadingTwo";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo, type ReactNode } from "react";
import { View } from "react-native";
import { FanPredictionStyles } from "styles/GameDetailStyles/FanPredictionStyles";

export default function FanPredictionSection({ children }: { children: ReactNode }) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Fan Prediction</HeadingTwo>
      <View style={styles.wrapper}>{children}</View>
    </View>
  );
}

