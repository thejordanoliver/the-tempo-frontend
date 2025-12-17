import { Colors } from "constants/Colors";
import { Text, View, useColorScheme } from "react-native";
import { getStyles } from "styles/StandingsStyles";

type StatusCode = "x" | "o" | "c" | "d" | "pi";

// Colors for status codes
const statusCodeToColor: Record<StatusCode, string> = {
  x: "#4caf50", // Clinched Playoff
  d: "#ff9800", // Clinched Division
  c: "#2196f3", // Clinched Conference
  pi: "#B163FF", // Play-In / WC
  o: "#f44336", // Eliminated
};

// Badge label mapping
const statusCodeToLabel: Record<StatusCode, string> = {
  x: "X",
  d: "D",
  c: "C",
  pi: "WC",
  o: "E",
};

interface StatusBadgeProps {
  code?: string | null; // numeric seed OR code
  clincher?: string | null; // ESPN clincher string
  clinchedConference?: boolean;
}

/** Convert ESPN clincher string → status code */
const parseClincher = (clincher?: string | null): StatusCode | null => {
  if (!clincher) return null;

  const text = clincher.toLowerCase();

  if (text.includes("eliminated")) return "o";
  if (text.includes("clinched division")) return "d";
  if (text.includes("clinched playoff")) return "x";
  if (text.includes("clinched conference")) return "c";

  return null;
};

export const StatusBadge = ({
  code,
  clincher,
  clinchedConference = false,
}: StatusBadgeProps) => {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  // 1️⃣ ESPN clincher → internal status code
  let parsedStatus: StatusCode | null = parseClincher(clincher);

  // 2️⃣ Fallback: manually forced conference clinch
  if (clinchedConference) parsedStatus = "c";

  // 3️⃣ If `code` already matches a status (x/d/c/pi/o)
  if (!parsedStatus && code && ["x", "o", "c", "d", "pi"].includes(code)) {
    parsedStatus = code as StatusCode;
  }

  // 4️⃣ Determine if seed number like "1", "2", "3"
  const isNumericSeed = code && !isNaN(Number(code));

  // If nothing applies → don't render a badge
  if (!parsedStatus && !isNumericSeed) return null;

  // 5️⃣ Final color
  const backgroundColor = isNumericSeed
    ? isDark
      ? Colors.dark.limeGreen
      : Colors.light.green
    : statusCodeToColor[parsedStatus!];

  // 6️⃣ Final label text
  const label = isNumericSeed ? String(code) : statusCodeToLabel[parsedStatus!];

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor,
        },
      ]}
    >
      <Text style={styles.statusBadgeText}>{label}</Text>
    </View>
  );
};
