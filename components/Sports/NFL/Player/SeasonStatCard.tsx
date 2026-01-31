import CenteredHeader from "components/Headings/CenteredHeader";
import SeasonStatCardSkeleton from "components/Sports/NBA/Player/SeasonStatCardSkeleton";
import { players as cfbPlayers } from "constants/cfbPlayers";
import { Colors } from "constants/Colors";
import { players as nflPlayers } from "constants/nflPlayers";
import { globalStyles } from "constants/Styles";
import { useFootballPlayerStats } from "hooks/NFLHooks/useFootballPlayerStats";
import { Text, useColorScheme, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";
import { getFootballSeasonYear } from "utils/dateUtils";
type Props = {
  playerId: number;
  teamColor?: string;
  teamColorDark?: string;
  season?: string;
  league?: "NFL" | "CFB";
};

export default function SeasonStatCard({
  playerId,
  season,
  league = "NFL", // default to NFL
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = seasonStatCardStyles(isDark);
  const global = globalStyles(isDark);

  // ✅ Fetch stats with league support
  const { aggregatedStats, loading, error } = useFootballPlayerStats(
    playerId,
    season
  );

  if (loading) return <SeasonStatCardSkeleton />;
  if (error || !aggregatedStats)
    return <Text style={global.errorText}>Failed to load stats</Text>;

  const displayYear = getFootballSeasonYear().toString();

  // ✅ Handle players by league
  const players = league === "NFL" ? nflPlayers : cfbPlayers;
  const player = players.find((p) => p.id === playerId);
  const position = player?.position || "";

  const statColor = isDark ? Colors.white : Colors.black;

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
        <Text style={styles.statValue}>{formatValue(value)}</Text>
      </View>
    );
  }

  // ✅ Determine which stats to show based on position
  const showPassing = position === "QB";
  const showRushing = position === "RB";
  const showReceiving = ["WR", "TE"].includes(position);
  const showDefense = ["DE", "CB"].includes(position);
  const showKicking = ["PK"].includes(position);
  const showPunting = ["P"].includes(position);

  const findStat = (statName: string) => aggregatedStats[statName] || 0;

  // --- Passing stats ---
  const completions = findStat("completions");
  const attempts = findStat("passing attempts");
  const cmpAtt = `${completions}/${attempts}`;
  const passingYards = findStat("yards");
  const passingTDs = findStat("passing touchdowns");
  const interceptions = findStat("interceptions");

  // --- Rushing stats ---
  const rushingYards = findStat("yards");
  const rushingYardsPerGame = findStat("rushing attempts");
  const rushingTDs = findStat("rushing touchdowns");
  const fumbles = findStat("fumbles");

  // --- Receiving stats ---
  const receptions = findStat("receptions");
  const receivingTargets = findStat("receiving targets");
  const receptionTargets = `${receptions}/${receivingTargets}`;
  const receivingYardsPer = findStat("yards per reception avg");
  const receivingYards = findStat("receiving yards");
  const receivingTDs = findStat("receiving touchdowns");

  // --- Defense stats ---
  const defenseInterceptions = findStat("interceptions");
  const totalTackles = findStat("total tackles");
  const tackleForLoss = findStat("tackles for loss");
  const sacks = findStat("sacks");

  // --- Kicking Stats ---
  const fgm = findStat("field goals made");
  const fga = findStat("field goals attempts");
  const fgmFGA = `${fgm}/${fga}`;
  const xpm = findStat("extra points made");
  const xpa = findStat("extra points attempts");
  const xpmXPA = `${xpm}/${xpa}`;
  const long = findStat("longest goal made");
  const fgmPCT = findStat("field goals made pct");

  // --- Punting Stats ---
  const punts = findStat("punts");
  const gpYds = findStat("gross punt yards");
  const longestPunt = findStat("longest punt");
  const touchbacks = findStat("touchbacks");

  return (
    <>
      <CenteredHeader>{displayYear} Season</CenteredHeader>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          {showPassing && (
            <>
              <StatItem label="CMP/ATT" value={cmpAtt} color={statColor} />
              <StatItem
                label="PASS YDS"
                value={passingYards}
                color={statColor}
              />
              <StatItem label="PASS TD" value={passingTDs} color={statColor} />
              <StatItem label="INT" value={interceptions} color={statColor} />
            </>
          )}

          {showRushing && (
            <>
              <StatItem
                label="RUSH ATT"
                value={rushingYardsPerGame}
                color={statColor}
              />
              <StatItem
                label="RUSH YDS"
                value={rushingYards}
                color={statColor}
              />
              <StatItem label="RUSH TD" value={rushingTDs} color={statColor} />
              <StatItem label="FUMB" value={fumbles} color={statColor} />
            </>
          )}

          {showReceiving && (
            <>
              <StatItem
                label="REC/TAR"
                value={receptionTargets}
                color={statColor}
              />
              <StatItem
                label="REC YDS"
                value={receivingYards}
                color={statColor}
              />
              <StatItem
                label="YDS/REC"
                value={receivingYardsPer}
                color={statColor}
              />
              <StatItem label="REC TD" value={receivingTDs} color={statColor} />
            </>
          )}

          {showDefense && (
            <>
              <StatItem label="TOT" value={totalTackles} color={statColor} />
              <StatItem
                label="INT"
                value={defenseInterceptions}
                color={statColor}
              />
              <StatItem label="TFL" value={tackleForLoss} color={statColor} />
              <StatItem label="SACK" value={sacks} color={statColor} />
            </>
          )}

          {showKicking && (
            <>
              <StatItem label="FGM/FGA" value={fgmFGA} color={statColor} />
              <StatItem label="FG%" value={fgmPCT} color={statColor} />
              <StatItem label="XPM/XPA" value={xpmXPA} color={statColor} />
              <StatItem label="LONG" value={long} color={statColor} />
            </>
          )}

          {showPunting && (
            <>
              <StatItem label="PUNTS" value={punts} color={statColor} />
              <StatItem label="GP/YDS" value={gpYds} color={statColor} />
              <StatItem label="LONG" value={longestPunt} color={statColor} />
              <StatItem label="TB" value={touchbacks} color={statColor} />
            </>
          )}
        </View>
      </View>
    </>
  );
}
