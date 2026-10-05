import { Colors } from "@/constants/styles";
import { Ionicons } from "@expo/vector-icons";
import Button from "components/Buttons/Button";
import { usePreferences } from "contexts/PreferencesContext";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useMemo } from "react";
import { Text } from "react-native";
import { FanPredictionStyles } from "styles/GameDetailStyles/FanPredictionStyles";

export default function FanRankingsLink() {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);

  return (
    <Button
      onPress={() => router.push("/fan-prediction-rankings")}
      isDark={isDark}
      variant="text"
      style={styles.rankingsButton}
    >
      <Text style={styles.textLink}>
        View fan rankings{" "}
        <Ionicons
          name="arrow-forward"
          color={isDark ? Colors.dark.text : Colors.light.text}
        />
      </Text>
    </Button>
  );
}
