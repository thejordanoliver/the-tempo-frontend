import {
  MlbStatValue,
  usePlayerSeasons,
} from "@/hooks/BaseballHooks/usePlayerSeasons";
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

const safeFixed = (value: MlbStatValue) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue.toFixed(1) : "0.0";
};

export default function SeasonStatCard({ playerId, season }: Props) {
  const { seasons, loading, error } = usePlayerSeasons(playerId);

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
          (s.displaySeason?.includes(season) ?? false),
      )) ||
    seasons[0]; // most recent season

  const displayYear = selectedSeason.displaySeason ?? String(selectedSeason.season);

  /* ------------------------------
     DERIVED PER-GAME STATS
  ------------------------------ */

  const battingStats = {
    ...selectedSeason.totals,
    ...selectedSeason.averages,
    ...selectedSeason.careerBatting,
  };
  const battingAverage = safeFixed(
    battingStats.battingAverage ?? battingStats.avg ?? battingStats.battingAvg,
  );
  const homeRuns = safeFixed(battingStats.homeRuns ?? battingStats.hr);
  const runsBattedIn = safeFixed(battingStats.rbi ?? battingStats.runsBattedIn);
  const hits = safeFixed(battingStats.hits ?? battingStats.h);

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
          <StatItem label="AVG" value={battingAverage} />
          <StatItem label="HR" value={homeRuns} />
          <StatItem label="RBI" value={runsBattedIn} />
          <StatItem label="H" value={hits} />
        </View>
      </View>
    </>
  );
}
