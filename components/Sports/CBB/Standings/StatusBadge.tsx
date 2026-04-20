import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Text, View } from "react-native";
import { standingsStyles } from "styles/LeagueStyles/StandingsStyles";

// Simplified NFL-managed league status codes
type StatusCode = "x" | "o" | "c" | "d" | "pi";

// Map each status code to its color
const statusCodeToColor: Record<StatusCode, string> = {
  x: "#4caf50", // Clinched Playoff Berth - Green
  o: "#f44336", // Eliminated - Red
  c: "#2196f3", // Clinched Conference - Blue
  d: "#ff9800", // Clinched Division - Orange
  pi: "#ffc107", // Clinched Play-In - Amber
};

// Optional: map code to a friendly label
const statusCodeToLabel: Record<StatusCode, string> = {
  x: "X",
  o: "E",
  c: "C",
  d: "D",
  pi: "WC",
};

interface StatusBadgeProps {
  code?: string | null; // could be a numeric seed or a special code
  clinchedConference?: boolean; // explicitly mark if the team clinched conference
}

export const StatusBadge = ({
  code,
  clinchedConference = false,
}: StatusBadgeProps) => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = standingsStyles(isDark);

  if (!code && !clinchedConference) return null;

  const displayCode: StatusCode | string = clinchedConference
    ? "c"
    : ["x", "o", "c", "d", "pi"].includes(code || "")
      ? (code as StatusCode)
      : code!;

  const backgroundColor =
    (["x", "o", "c", "d", "pi"].includes(displayCode)
      ? statusCodeToColor[displayCode as StatusCode]
      : Colors.dark.leafGreen) || (isDark ? Colors.darkGray : Colors.lightGray);

  const label =
    displayCode in statusCodeToLabel
      ? statusCodeToLabel[displayCode as StatusCode]
      : displayCode;

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor, minWidth: 28, paddingHorizontal: 6 },
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          { fontSize: 12, textAlign: "center", paddingVertical: 2 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};
