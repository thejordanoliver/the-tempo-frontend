import SeasonStatCardSkeleton from "components/Player/SeasonStatCardSkeleton";
import { Colors } from "constants/Colors";
import { useLocalSearchParams } from "expo-router";
import { useCBBPlayerStats } from "hooks/CBBHooks/useCBBPlayerStats";
import { Text, useColorScheme, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";
import { teams } from "../../../constants/teamsCBB";
import CenteredHeader from "../../Headings/CenteredHeader";
type Props = {
  playerId: number;
  season?: string;
};

export default function SeasonStatCard({ playerId, season }: Props) {
  const { data, loading, error } = useCBBPlayerStats(playerId);
  const isDark = useColorScheme() === "dark";
  const styles = seasonStatCardStyles(isDark);

  if (loading) return <SeasonStatCardSkeleton />;
  if (error || !data)
    return <Text style={styles.error}>Failed to load stats</Text>;

  // 👉 Choose season
  const selectedSeason =
    data.seasons.find((s) => s.season === season) || data.currentSeason;

  if (!selectedSeason)
    return <Text style={styles.error}>No stats available</Text>;

  // Extract stats
  const { gp, pts, ast, reb, fgPct } = selectedSeason;

  const safeFixed = (val: number | null) =>
    val == null || isNaN(val) ? "0.0" : Number(val).toFixed(1);

  const ppg = gp ? safeFixed(pts!) : "0.0";
  const apg = gp ? safeFixed(ast!) : "0.0";
  const rpg = gp ? safeFixed(reb!) : "0.0";
  const fg = fgPct ? safeFixed(fgPct) : "0.0";

  const displayYear = season || selectedSeason.season;

  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const sanitizedTeamId = String(teamId).replace(/"/g, "").trim();

  const teamObj = teams.find((t) => String(t.id) === sanitizedTeamId);
  const statColor = isDark ? Colors.white : Colors.black;

  function StatItem({
    label,
    value,
    color,
  }: {
    label: string;
    value: string | number;
    color?: string;
  }) {
    return (
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: color || "#000" }]}>
          {value}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <>
      <CenteredHeader>{displayYear} Season</CenteredHeader>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          <StatItem label="PTS" value={ppg} color={statColor} />
          <StatItem label="AST" value={apg} color={statColor} />
          <StatItem label="REB" value={rpg} color={statColor} />
          <StatItem label="FG%" value={fg} color={statColor} />
        </View>
      </View>
    </>
  );
}
