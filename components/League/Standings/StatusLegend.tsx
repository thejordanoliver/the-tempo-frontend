import HeadingTwo from "components/Headings/HeadingTwo";
import { usePreferences } from "contexts/PreferencesContext";
import { Text, View } from "react-native";
import { StandingsStyles } from "styles/LeagueStyles/StandingsStyles";
import { StatusBadge, statusConfigs } from "./StatusBadge";

export type PlayoffLeague = "mlb" | "nfl" | "ufl" | "nba" | "wnba" | "nhl";

interface StatusLegendProps {
  league: PlayoffLeague;
}

export const StatusLegend = ({ league }: StatusLegendProps) => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = StandingsStyles(isDark);

  const config = statusConfigs[league];

  if (!config) return null;

  const codes = Object.keys(config.labels);

  return (
    <View style={styles.legendContainer}>
      <HeadingTwo isDark={isDark} style={{ marginBottom: 10 }}>
        Status Legend
      </HeadingTwo>

      <View style={styles.legendItemsContainer}>
        {codes.map((code) => (
          <View key={code} style={styles.legendItem}>
            <StatusBadge code={code} league={league} />
            <Text style={styles.statusText}>{config.labels[code]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
