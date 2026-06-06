import { PlayerSeasonStat } from "@/hooks/BasketballHooks/usePlayerSeasons";
import SeasonStatCardSkeleton from "components/Skeletons/SeasonStatCardSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Text, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";
import CenteredHeader from "../../../Headings/CenteredHeader";

const safeFixed = (val?: number | null) =>
  val == null || isNaN(val) ? "0.0" : Number(val).toFixed(1);

type Props = {
  seasonStats: PlayerSeasonStat[];
  loading?: boolean;
  error?: string | null;
};

export default function SeasonStatCard({ seasonStats, loading, error }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = seasonStatCardStyles(isDark);
  const global = globalStyles(isDark);

  const selectedSeason =
    seasonStats && seasonStats.length > 0
      ? [...seasonStats].sort((a, b) => b.season - a.season)[0]
      : null;

  const displayYear = selectedSeason?.season
    ? `${String(selectedSeason.season)}`
    : "N/A";

  const ppg = safeFixed(Number(selectedSeason?.averages?.avgPoints ?? 0));
  const rpg = safeFixed(Number(selectedSeason?.averages?.avgRebounds ?? 0));
  const apg = safeFixed(Number(selectedSeason?.averages?.avgAssists ?? 0));
  const fg = safeFixed(Number(selectedSeason?.averages?.fieldGoalPct ?? 0));

  const statColor = isDark ? Colors.white : Colors.black;

  function StatItem({ label, value }: { label: string; value: string }) {
    return (
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: statColor }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }

  if (loading) return <SeasonStatCardSkeleton />;
  if (error) return <Text style={global.errorText}>Failed to load stats</Text>;

  return (
    <View>
      <CenteredHeader isDark={isDark}>{displayYear} Season</CenteredHeader>
      <View style={styles.card}>
        <View style={styles.statsRow}>
          <StatItem label="PTS" value={ppg} />
          <StatItem label="REB" value={rpg} />
          <StatItem label="AST" value={apg} />
          <StatItem label="FG%" value={fg} />
        </View>
      </View>
    </View>
  );
}
