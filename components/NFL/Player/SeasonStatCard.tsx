import { Colors } from "constants/Colors";
import { players as nflPlayers } from "constants/nflPlayers";
import { players as cfbPlayers } from "constants/cfbPlayers";
import { teams as nflTeams } from "constants/teamsNFL";
import { teams as cfbTeams } from "constants/teamsCFB";
import { useLocalSearchParams } from "expo-router";
import { useFootballPlayerStats } from "hooks/NFLHooks/useFootballPlayerStats";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCard.styles";
import CenteredHeader from "components/Headings/CenteredHeader";

type Props = {
  playerId: number;
  teamColor?: string;
  teamColorDark?: string;
  season?: string;
  /** ✅ Choose between NFL or CFB */
  league?: "NFL" | "CFB";
};

export default function SeasonStatCard({
  playerId,
  teamColor,
  teamColorDark,
  season,
  league = "NFL", // default to NFL
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = seasonStatCardStyles(isDark);

  // ✅ Fetch stats with league support
  const { aggregatedStats, loading, error } = useFootballPlayerStats(
    playerId,
    season || "2025",
  );

  if (loading) return <ActivityIndicator style={{ marginVertical: 20 }} />;
  if (error || !aggregatedStats)
    return <Text style={styles.error}>Failed to load stats</Text>;

  const displayYear = season || new Date().getFullYear().toString();

  // ✅ Handle teams by league
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const sanitizedTeamId = String(teamId ?? "").replace(/"/g, "").trim();

  const teamObj =
    league === "NFL"
      ? nflTeams.find((t) => String(t.id) === sanitizedTeamId)
      : cfbTeams.find((t) => String(t.id) === sanitizedTeamId);

  // ✅ Handle players by league
  const players = league === "NFL" ? nflPlayers : cfbPlayers;
  const player = players.find((p) => p.id === playerId);
  const position = player?.position || "";

  const statColor = teamColor || (isDark ? Colors.white : teamObj?.color);

  const formatValue = (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return num >= 1000 ? num.toLocaleString("en-US") : num.toString();
  };

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
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: color || Colors.black }]}>
          {formatValue(value)}
        </Text>
      </View>
    );
  }

  // ✅ Determine which stats to show based on position
  const showPassing = position === "QB";
  const showRushing = position === "RB";
  const showReceiving = ["WR", "TE"].includes(position);

  const findStat = (statName: string) => aggregatedStats[statName] || 0;

  // --- Passing stats ---
  const completions = findStat("completions");
  const attempts = findStat("passing attempts");
  const cmpAtt = `${completions}/${attempts}`;
  const passingYards = findStat("yards");
  const passingTDs = findStat("passing touchdowns");
  const interceptions = findStat("interceptions");

  // --- Rushing stats ---
  const rushingYardsPerGame = findStat("yards per game");
  const rushingYards = findStat("yards");
  const rushingTDs = findStat("rushing touchdowns");
  const fumbles = findStat("fumbles");

  // --- Receiving stats ---
  const receivingYards = findStat("receiving yards");
  const receivingTDs = findStat("receiving touchdowns");

  return (
    <>
      <CenteredHeader>
        {displayYear} Season 
      </CenteredHeader>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          {showPassing && (
            <>
              <StatItem label="CMP/ATT" value={cmpAtt} color={statColor} />
              <StatItem label="PASS YDS" value={passingYards} color={statColor} />
              <StatItem label="PASS TD" value={passingTDs} color={statColor} />
              <StatItem label="INT" value={interceptions} color={statColor} />
            </>
          )}

          {showRushing && (
            <>
              <StatItem label="RUSH YDS" value={rushingYards} color={statColor} />
              <StatItem
                label="RUSH YDS/G"
                value={rushingYardsPerGame}
                color={statColor}
              />
              <StatItem label="RUSH TD" value={rushingTDs} color={statColor} />
              <StatItem label="FUMB" value={fumbles} color={statColor} />
            </>
          )}

          {showReceiving && (
            <>
              <StatItem label="REC YDS" value={receivingYards} color={statColor} />
              <StatItem label="REC TD" value={receivingTDs} color={statColor} />
            </>
          )}
        </View>
      </View>
    </>
  );
}
