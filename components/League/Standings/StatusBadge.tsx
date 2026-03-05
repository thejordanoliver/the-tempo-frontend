import { Colors } from "constants/Styles";
import { Text, View, useColorScheme } from "react-native";
import { standingsStyles } from "styles/LeagueStyles/StandingsStyles";

/**
 * Only leagues that use playoff status codes
 */
type PlayoffLeague = "MLB" | "NFL" | "NBA" | "NHL";

type StatusConfig = {
  colors: Record<string, string>;
  labels: Record<string, string>;
};

/**
 * Centralized playoff status configuration
 */
export const statusConfigs: Record<PlayoffLeague, StatusConfig> = {
  MLB: {
    colors: {
      "*": "#4caf50", // Clinched Division + Bye
      y: "#2196f3", // Wild Card
      x: "#ff9800", // Division
      e: "#f44336", // Eliminated
    },
    labels: {
      "*": "Clinched Division + Bye",
      y: "Clinched Wild Card",
      x: "Clinched Division",
      e: "Eliminated",
    },
  },

  NFL: {
    colors: {
      "*": "#4caf50", // Clinched Division + Bye
      z: "#ff9800", // Clinched Division
      y: "#2196f3", // Wild Card
      e: "#f44336", // Eliminated
    },
    labels: {
      "*": "Clinched Division + Bye",
      z: "Clinched Division",
      y: "Clinched Wild Card",
      e: "Eliminated from Playoff Contention",
    },
  },

  NBA: {
    colors: {
      "*": "#4caf50", // Clinched Conference
      z: "#4caf50", // Clinched Division
      y: "#ff9800", // Clinched Division
      x: "#2196f3", // Clinched Playoff Berth
      xp: "#2196f3", // Clinched Playoff - Won Play-In
      pb: "#ff9800", // Clinched Play-in Berth
      e: "#f44336", // Eliminated From Playoff
    },
    labels: {
      "*": "Clinched Best League Record",
      z: "Clinched Conference",
      y: "Clinched Division",
      x: "Clinched playoff Berth",
      xp: "Clinched Playoff - Won Play-In",
      pb: "Clinched Play-in Berth",
      e: "Eliminated From Playoff",
    },
  },

  NHL: {
    colors: {
      "*": "#4caf50", // Presidents' Trophy
      z: "#4caf50", // Best in Conference
      y: "#ff9800", // Division Title
      x: "#2196f3", // Playoff Berth
      e: "#f44336", // Eliminated
    },
    labels: {
      "*": "Clinched Presidents' Trophy (Best Regular-Season Record)",
      z: "Clinched Best Record in Conference",
      y: "Clinched Division Title",
      x: "Clinched Playoff Berth",
      e: "Eliminated from Playoff Contention",
    },
  },
};

interface StatusBadgeProps {
  code?: string | null; // numeric seed OR playoff code
  league: PlayoffLeague;
}

/**
 * Generic Playoff Status Badge
 */
export const StatusBadge = ({ code, league }: StatusBadgeProps) => {
  const isDark = useColorScheme() === "dark";
  const styles = standingsStyles(isDark);

  if (!code) return null;

  const config = statusConfigs[league];

  const normalizedCode = code.toLowerCase();
  const isNumericSeed = !isNaN(Number(code));

  const backgroundColor = isNumericSeed
    ? isDark
      ? Colors.dark.limeGreen
      : Colors.light.green
    : (config.colors[normalizedCode] ??
      (isDark ? Colors.darkGray : Colors.lightGray));

  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <Text style={styles.statusBadgeText}>
        {isNumericSeed ? code : code.toUpperCase()}
      </Text>
    </View>
  );
};
