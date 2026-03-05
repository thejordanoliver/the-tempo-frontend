import SeasonStatCardSkeleton from "components/Sports/NBA/Player/SeasonStatCardSkeleton";
import { Colors } from "constants/Styles";
import { useLocalSearchParams } from "expo-router";
import { useCBBPlayerSeasons } from "hooks/CBBHooks/useCBBPlayerSeasons";
import { Text, useColorScheme, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";
import CenteredHeader from "../../../Headings/CenteredHeader";

type Props = {
  playerId: number;
  season?: string; // e.g. "2025-26"
};

const safeFixed = (val?: number | null) =>
  val == null || isNaN(val) ? "0.0" : Number(val).toFixed(1);

export default function SeasonStatCard({ playerId, season }: Props) {
  const params = useLocalSearchParams<{ league?: string }>();

  const league =
    params.league === "WCBB" || params.league === "wcbb" ? "WCBB" : "CBB";

  const { player, careerStats, seasonStats, loading, error } =
    useCBBPlayerSeasons(playerId);

  const isDark = useColorScheme() === "dark";
  const styles = seasonStatCardStyles(isDark);

  /* ------------------------------
     LOADING / ERROR
  ------------------------------ */
  if (loading) return <SeasonStatCardSkeleton />;
  if (error || !seasonStats)
    return <Text style={styles.errorText}>Failed to load stats</Text>;

  /* ------------------------------
     SEASON SELECTION
  ------------------------------ */

  // remove Career row
  const seasons = seasonStats.filter(
    (s) => !s.season.toLowerCase().includes("career"),
  );

  if (!seasons.length) {
    return (
      <>
        <CenteredHeader>Season</CenteredHeader>
        <Text style={styles.errorText}>No stats available</Text>
      </>
    );
  }

  const selectedSeason =
    (season &&
      seasons.find((s) => s.season === season || s.season.includes(season))) ||
    seasons[0]; // most recent season

  const displayYear = selectedSeason.season;

  /* ------------------------------
     DERIVED PER-GAME STATS
  ------------------------------ */

  const gp = selectedSeason.gp ?? 0;

  const ppg = gp ? safeFixed((selectedSeason.pts ?? 0) / gp) : "0.0";
  const apg = gp ? safeFixed((selectedSeason.ast ?? 0) / gp) : "0.0";
  const rpg = gp ? safeFixed((selectedSeason.reb ?? 0) / gp) : "0.0";
  const fg = safeFixed(selectedSeason["fg%"]);

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
      <CenteredHeader>{displayYear} Season</CenteredHeader>
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
