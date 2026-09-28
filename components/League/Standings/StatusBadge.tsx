import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Text, View } from "react-native";
import { StandingsStyles } from "styles/LeagueStyles/StandingsStyles";

type StatusConfig = {
  colors: Record<string, string>;
  labels: Record<string, string>;
};

export const statusConfigs: Record<string, StatusConfig> = {
  // MLB
  mlb: {
    colors: {
      "*": Colors.dark.gold,
      z: Colors.dark.leafGreen,
      x: Colors.dark.blue,
      y: Colors.dark.orange,
      e: Colors.dark.lightRed,
    },
    labels: {
      "*": "Clinched Best League Record",
      z: "Clinched Playoff Berth",
      x: "Clinched Division",
      y: "Clinched Wild Card",
      e: "Eliminated from Playoff Contention",
    },
  },

  // NFL
  nfl: {
    colors: {
      "*": Colors.dark.gold,
      z: Colors.dark.leafGreen,
      y: Colors.dark.orange,
      e: Colors.dark.lightRed,
    },
    labels: {
      "*": "Clinched Division + Bye",
      z: "Clinched Division",
      y: "Clinched Wild Card",
      e: "Eliminated from Playoff Contention",
    },
  },

  // UFL
  ufl: {
    colors: {
      z: Colors.dark.gold,
      x: Colors.dark.leafGreen,
      e: Colors.dark.lightRed,
    },
    labels: {
      z: "Clinched Division",
      x: "Clinched Playoff Berth",
      e: "Eliminated from Playoff Contention",
    },
  },

  // NBA
  nba: {
    colors: {
      "*": Colors.dark.gold,
      z: Colors.dark.leafGreen,
      y: Colors.dark.blue,
      x: Colors.dark.blue,
      xp: Colors.dark.yellow,
      pb: Colors.dark.orange,
      e: Colors.dark.lightRed,
    },
    labels: {
      "*": "Clinched Best League Record",
      z: "Clinched Conference",
      y: "Clinched Division",
      x: "Clinched Playoff Berth",
      xp: "Clinched Playoff - Won Play-In",
      pb: "Clinched Play-In Berth",
      e: "Eliminated From Playoff",
    },
  },

  // WNBA
  wnba: {
    colors: {
      "*": Colors.dark.gold,
      cx: Colors.dark.leafGreen,
      x: Colors.dark.blue,
      xp: Colors.dark.yellow,
      e: Colors.dark.lightRed,
    },
    labels: {
      "*": "Clinched Best League Record",
      cx: "Clinched Playoff Berth and Won Commissioner's Cup",
      x: "Clinched Playoff Berth",
      xp: "Clinched Playoff - Won Play-In",
      e: "Eliminated From Playoff",
    },
  },

  // NHL
  nhl: {
    colors: {
      "*": Colors.dark.gold,
      z: Colors.dark.leafGreen,
      y: Colors.dark.blue,
      x: Colors.dark.yellow,
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
  league: string;
}

export const StatusBadge = ({ code, league }: StatusBadgeProps) => {
  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";
  const styles = StandingsStyles(isDark);

  if (!code) {
    return null;
  }

  const normalizedLeague = league.toLowerCase();
  const normalizedCode = code.toLowerCase();

  const config = statusConfigs[normalizedLeague];
  const isNumericSeed = !Number.isNaN(Number(code));

  const numericSeedColor = isDark ? Colors.dark.limeGreen : Colors.light.green;

  const fallbackColor = isDark ? Colors.darkGray : Colors.lightGray;

  const backgroundColor = isNumericSeed
    ? numericSeedColor
    : (config?.colors[normalizedCode] ?? fallbackColor);

  const displayCode = isNumericSeed ? code : code.toUpperCase();

  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <Text style={styles.statusBadgeText}>{displayCode}</Text>
    </View>
  );
};
