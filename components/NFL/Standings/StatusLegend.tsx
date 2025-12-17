import { Text, View, useColorScheme } from "react-native";
import { getStyles } from "styles/StandingsStyles";
import HeadingTwo from "../../Headings/HeadingTwo";
import { StatusBadge } from "./StatusBadge";

export const statusCodeToLabel: Record<string, string> = {
  x: "Clinched Playoff Berth",
  o: "Eliminated from Playoffs",
  c: "Clinched Conference",
  d: "Clinched Division",
  pi: "Clinched Wild Card",
};

// Map status codes to colors for badges
export const statusCodeToColor: Record<string, string> = {
  x: "#4caf50", // Green
  o: "#f44336", // Red
  c: "#2196f3", // Blue
  d: "#ff9800", // Orange
  pi: "#B163FF", // Amber
};

export const StatusLegend = () => {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  return (
    <View style={styles.legendContainer}>
      <HeadingTwo>Status Legend</HeadingTwo>
      <View style={styles.legendItemsContainer}>
        {Object.entries(statusCodeToLabel).map(([code, label]) => (
          <View key={code} style={styles.legendItem}>
            <StatusBadge code={code} />
            <Text style={[styles.legendLabel, { marginLeft: 6 }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
