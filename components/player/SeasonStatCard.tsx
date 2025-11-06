import { useLocalSearchParams } from "expo-router";
import { usePlayerStats } from "hooks/usePlayerStats";
import {
  ActivityIndicator,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { teams } from "../../constants/teams";
import CenteredHeader from "../Headings/CenteredHeader";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCard.styles";
type Props = {
  playerId: number;
  teamColor?: string;
  teamColorDark?: string;
  season?: string; // 👈 add this
};

export default function SeasonStatCard({
  playerId,
  season,
}: Props) {
  const { aggregatedStats, loading, error } = usePlayerStats(playerId, "2025");
  const isDark = useColorScheme() === "dark";
  const styles = seasonStatCardStyles(isDark);

  if (loading) return <ActivityIndicator style={{ marginVertical: 20 }} />;
  if (error || !aggregatedStats)
    return <Text style={styles.error}>Failed to load stats</Text>;

  const displayYear = season || new Date().getFullYear().toString();

  const {
    gamesPlayed,
    totalPoints,
    totalAssists,
    totalRebounds,
    totalFGM,
    totalFGA,
  } = aggregatedStats;

  const safeFixed = (val: number) =>
    isNaN(val) || val == null ? "0.0" : val.toFixed(1);

  const ppg = safeFixed(totalPoints / gamesPlayed);
  const apg = safeFixed(totalAssists / gamesPlayed);
  const rpg = safeFixed(totalRebounds / gamesPlayed);
  const fgPercent =
    totalFGA > 0 ? safeFixed((totalFGM / totalFGA) * 100) : "0.0";

  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const sanitizedTeamId = String(teamId).replace(/"/g, "").trim();

  const teamObj = teams.find((t) => String(t.id) === sanitizedTeamId);
  const forceWhiteTextTeams = [
    "Heat",
    "Clippers",
    "Rockets",
    "Pistons",
    "Bulls",
    "Hornets",
    "Trail Blazers",
    "Kings",
  ];

  // 👇 Move StatItem inside component so it can use styles
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
          <StatItem
            label="PTS"
            value={ppg}
            color={
              isDark && teamObj && forceWhiteTextTeams.includes(teamObj.name)
                ? "#fff"
                : isDark
                ? teamObj?.secondaryColor
                : teamObj?.color
            }
          />
          <StatItem
            label="AST"
            value={apg}
            color={
              isDark && teamObj && forceWhiteTextTeams.includes(teamObj.name)
                ? "#fff"
                : isDark
                ? teamObj?.secondaryColor
                : teamObj?.color
            }
          />
          <StatItem
            label="REB"
            value={rpg}
            color={
              isDark && teamObj && forceWhiteTextTeams.includes(teamObj.name)
                ? "#fff"
                : isDark
                ? teamObj?.secondaryColor
                : teamObj?.color
            }
          />
          <StatItem
            label="FG%"
            value={fgPercent}
            color={
              isDark && teamObj && forceWhiteTextTeams.includes(teamObj.name)
                ? "#fff"
                : isDark
                ? teamObj?.secondaryColor
                : teamObj?.color
            }
          />
        </View>
      </View>
    </>
  );
}

