import CenteredHeader from "components/Headings/CenteredHeader";
import { Colors, globalStyles } from "constants/Styles";
import { usePlayerSeasons } from "hooks/usePlayerSeasons";
import { Text, useColorScheme, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";
import SeasonStatCardSkeleton from "./SeasonStatCardSkeleton";
type Props = {
  playerId: number;
  teamColor?: string;
  teamColorDark?: string;
  season?: string; // optional season
};

export default function SeasonStatCard({ playerId, season }: Props) {
  const displaySeason =
    season ??
    (() => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      return month >= 10
        ? `${year}-${String(year + 1).slice(-2)}`
        : `${year - 1}-${String(year).slice(-2)}`;
    })();

  const { seasons, loading, error } = usePlayerSeasons(playerId);

  const seasonData = seasons.find((s) => s.season === displaySeason);

  const isDark = useColorScheme() === "dark";
  const styles = seasonStatCardStyles(isDark);
  const global = globalStyles(isDark);

  if (loading) return <SeasonStatCardSkeleton />;
  if (error || !seasonData)
    return <Text style={global.errorText}>Failed to load stats</Text>;

  const { g, pts, ast, trb, fg, fga } = seasonData;

  const safeFixed = (val?: number | null) =>
    val == null || isNaN(val) ? "0.0" : val.toFixed(1);

  const ppg = g ? safeFixed(pts! / g) : "0.0";
  const apg = g ? safeFixed(ast! / g) : "0.0";
  const rpg = g ? safeFixed(trb! / g) : "0.0";
  const fgPercent = fga ? safeFixed((fg! / fga) * 100) : "0.0";

  function StatItem({ label, value }: { label: string; value: string }) {
    return (
      <View style={styles.statItem}>
        <Text
          style={[
            styles.statValue,
            { color: isDark ? Colors.white : Colors.black },
          ]}
        >
          {value}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CenteredHeader>{displaySeason} Season</CenteredHeader>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          <StatItem label="PTS" value={ppg} />
          <StatItem label="AST" value={apg} />
          <StatItem label="REB" value={rpg} />
          <StatItem label="FG%" value={fgPercent} />
        </View>
      </View>
    </View>
  );
}
