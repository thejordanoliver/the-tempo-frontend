import HeadingTwo from "components/Headings/HeadingTwo";
import { Text, View, useColorScheme } from "react-native";
import { standingsStyles } from "styles/LeagueStyles/StandingsStyles";
import { StatusBadge, statusConfigs } from "./StatusBadge";

export type PlayoffLeague = "MLB" | "NFL" | "NBA" | "WNBA" | "NHL";

interface StatusLegendProps {
  league: PlayoffLeague;
}

export const StatusLegend = ({ league }: StatusLegendProps) => {
  const isDark = useColorScheme() === "dark";
  const styles = standingsStyles(isDark);

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
