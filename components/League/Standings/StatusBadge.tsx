import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Text, View } from "react-native";
import { standingsStyles } from "styles/LeagueStyles/StandingsStyles";

type PlayoffLeague = "MLB" | "NFL" | "NBA" | "WNBA" | "NHL";

type StatusConfig = {
  colors: Record<string, string>;
  labels: Record<string, string>;
};

export const statusConfigs: Record<PlayoffLeague, StatusConfig> = {
  MLB: {
    colors: {
      "*": Colors.dark.leafGreen,
      y: Colors.dark.blue,
      x: Colors.dark.orange,
      e: Colors.dark.lightRed,
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
      "*": Colors.dark.leafGreen,
      z: Colors.dark.orange,
      y: Colors.dark.blue,
      e: Colors.dark.lightRed,
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
      "*": Colors.dark.leafGreen,
      z: Colors.dark.leafGreen,
      y: Colors.dark.orange,
      x: Colors.dark.blue,
      xp: Colors.dark.blue,
      pb: Colors.dark.yellow,
      e: Colors.dark.lightRed,
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
  WNBA: {
    colors: {
      "*": Colors.dark.leafGreen,
      cx: Colors.dark.leafGreen,
      x: Colors.dark.blue,
      xp: Colors.dark.blue,
      pb: Colors.dark.yellow,
      e: Colors.dark.lightRed,
    },
    labels: {
      "*": "Clinched Best League Record",
      cx: "Clinched Playoff Berth and Won Commissioner's Cup",
      x: "Clinched playoff Berth",
      xp: "Clinched Playoff - Won Play-In",
      e: "Eliminated From Playoff",
    },
  },

  NHL: {
    colors: {
      "*": Colors.dark.leafGreen,
      z: Colors.dark.leafGreen,
      y: Colors.dark.yellow,
      x: Colors.dark.blue,
      e: Colors.dark.lightRed,
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
  code?: string | null;
  league: PlayoffLeague;
}

export const StatusBadge = ({ code, league }: StatusBadgeProps) => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
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
