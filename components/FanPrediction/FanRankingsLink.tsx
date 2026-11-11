import { Colors } from "@/constants/styles";
import { FanPredictionStyles } from "@/styles/FanPredictionStyles/FanPredictionStyles";
import { Ionicons } from "@expo/vector-icons";
import Button from "components/Buttons/Button";
import { usePreferences } from "contexts/PreferencesContext";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useMemo } from "react";
import { Text } from "react-native";

export default function FanRankingsLink({
  compact = false,
}: {
  compact?: boolean;
}) {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);

  return (
    <Button
      onPress={() => router.push("/fan-prediction-rankings")}
      accessibilityLabel="View fan rankings"
      isDark={isDark}
      variant="text"
      style={styles.rankingsButton}
    >
      <Text style={styles.textLink}>
        {compact ? "Rankings" : "View fan rankings"}
      </Text>
      <Ionicons
        name="arrow-forward"
        size={14}
        color={isDark ? Colors.dark.text : Colors.light.text}
        accessible={false}
      />
    </Button>
  );
}
