import { useMLBPlayerSeasons } from "@/hooks/BaseballHooks/usePlayerSeasons";
import SeasonStatCardSkeleton from "components/Skeletons/SeasonStatCardSkeleton";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Text, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";
import CenteredHeader from "../../../Headings/CenteredHeader";

type Props = {
  playerId: number;
  season?: string; // e.g. "2025-26"
};

const safeFixed = (val?: number | null) =>
  val == null || isNaN(val) ? "0.0" : Number(val).toFixed(1);

export default function SeasonStatCard({ playerId, season }: Props) {
  const { seasons, loading, error } = useMLBPlayerSeasons(playerId);

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = seasonStatCardStyles(isDark);

  /* ------------------------------
     LOADING / ERROR
  ------------------------------ */
  if (loading) return <SeasonStatCardSkeleton />;
  if (error || !seasons)
    return <Text style={styles.errorText}>Failed to load stats</Text>;

  /* ------------------------------
     SEASON SELECTION
  ------------------------------ */

  if (!seasons.length) {
    return (
      <>
        <CenteredHeader isDark={isDark}>Season</CenteredHeader>
        <Text style={styles.errorText}>No stats available</Text>
      </>
    );
  }

  const selectedSeason =
    (season &&
      seasons.find(
        (s) =>
          String(s.season) === season ||
          s.displaySeason?.includes(season) ||
          [],
      )) ||
    seasons[0]; // most recent season

  const displayYear = selectedSeason.displaySeason;

  /* ------------------------------
     DERIVED PER-GAME STATS
  ------------------------------ */

  const ppg = safeFixed(selectedSeason.stats);
  const apg = safeFixed(selectedSeason.avgAssists);
  const rpg = safeFixed(selectedSeason.avgRebounds);
  const fg = safeFixed(selectedSeason.fieldGoalPct);

  const statColor = isDark ? Colors.white : Colors.black;

  function StatItem({ label, value }: { label: string; value: string }) {
    return (
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: statColor }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }

  /* ------------------------------
     UI
  ------------------------------ */
  return (
    <>
      <CenteredHeader isDark={isDark}>{displayYear} Season</CenteredHeader>
      <View style={styles.card}>
        <View style={styles.statsRow}>
          <StatItem label="PTS" value={ppg} />
          <StatItem label="AST" value={apg} />
          <StatItem label="REB" value={rpg} />
          <StatItem label="FG%" value={fg} />
        </View>
      </View>
    </>
  );
}
