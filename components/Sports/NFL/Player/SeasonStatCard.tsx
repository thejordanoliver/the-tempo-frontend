import CenteredHeader from "components/Headings/CenteredHeader";
import SeasonStatCardSkeleton from "components/Sports/NBA/Player/SeasonStatCardSkeleton";
import { globalStyles } from "constants/styles";
import { Text, useColorScheme, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";
import { getFootballSeasonYear } from "utils/dateUtils";

type Props = {
  player: any;
  teamColor?: string;
  teamColorDark?: string;
  season?: string;
  aggregatedStats?: Record<string, number> | null;
  loading?: boolean;
  error?: string | null;
};

export default function SeasonStatCard({
  player,
  aggregatedStats,
  loading,
  error,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = seasonStatCardStyles(isDark);
  const global = globalStyles(isDark);

  if (loading) return <SeasonStatCardSkeleton />;
  if (error) return <Text style={global.errorText}>Failed to load stats</Text>;

  const displayYear = getFootballSeasonYear().toString();
  const position = player?.position || "";

  const formatValue = (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return num >= 1000 ? num.toLocaleString("en-US") : num.toString();
  };

  function StatItem({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) {
    return (
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{formatValue(value)}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }

  const findStat = (statName: string) => aggregatedStats?.[statName] || 0;

  // --- POSITION FLAGS ---
  const showPassing = position === "QB";
  const showRushing = position === "RB";
  const showReceiving = ["WR", "TE"].includes(position);
  const showDefense = ["DE", "CB", "LB", "S"].includes(position);
  const showKicking = position === "K";
  const showPunting = position === "P";

  // --- PASSING ---
  const completions = findStat("completions");
  const attempts = findStat("passing attempts");
  const cmpAtt = `${completions}/${attempts}`;
  const passingYards = findStat("yards");
  const passingTDs = findStat("passing touchdowns");
  const interceptions = findStat("interceptions");

  // --- RUSHING ---
  const rushingAttempts = findStat("rushing attempts");
  const rushingYards = findStat("yards");
  const avgYds = findStat("yards per rush avg");
  const rushingTDs = findStat("rushing touchdowns");

  // --- RECEIVING ---
  const receptions = findStat("receptions");
  const receivingTargets = findStat("targets");
  const receptionTargets = `${receptions}/${receivingTargets}`;
  const receivingYards = findStat("receiving yards");
  const receivingYardsPer = findStat("yards per reception");
  const receivingTDs = findStat("receiving touchdowns");

  // --- DEFENSE ---
  const totalTackles = findStat("total tackles");
  const defenseInterceptions = findStat("interceptions");
  const tackleForLoss = findStat("tackles for loss");
  const sacks = findStat("sacks");

  // --- KICKING ---
  const fgm = findStat("field goals made");
  const fga = findStat("field goals attempts");
  const fgmFGA = `${fgm}/${fga}`;
  const xpm = findStat("extra points made");
  const xpa = findStat("extra points attempts");
  const xpmXPA = `${xpm}/${xpa}`;
  const long = findStat("longest field goal");
  const fgmPCT = findStat("field goal pct");

  // --- PUNTING ---
  const punts = findStat("punts");
  const gpYds = findStat("gross punt yards");
  const longestPunt = findStat("longest punt");
  const touchbacks = findStat("touchbacks");

  return (
    <View>
      <CenteredHeader isDark={isDark}>{displayYear} Season</CenteredHeader>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          {showPassing && (
            <>
              <StatItem label="CMP/ATT" value={cmpAtt} />
              <StatItem label="PASS YDS" value={passingYards} />
              <StatItem label="PASS TD" value={passingTDs} />
              <StatItem label="INT" value={interceptions} />
            </>
          )}

          {showRushing && (
            <>
              <StatItem label="RUSH ATT" value={rushingAttempts} />
              <StatItem label="RUSH YDS" value={rushingYards} />
              <StatItem label="AVG/YDS" value={avgYds} />
              <StatItem label="RUSH TD" value={rushingTDs} />
            </>
          )}

          {showReceiving && (
            <>
              <StatItem label="REC/TAR" value={receptionTargets} />
              <StatItem label="REC YDS" value={receivingYards} />
              <StatItem label="YDS/REC" value={receivingYardsPer} />
              <StatItem label="REC TD" value={receivingTDs} />
            </>
          )}

          {showDefense && (
            <>
              <StatItem label="TOT" value={totalTackles} />
              <StatItem label="INT" value={defenseInterceptions} />
              <StatItem label="TFL" value={tackleForLoss} />
              <StatItem label="SACK" value={sacks} />
            </>
          )}

          {showKicking && (
            <>
              <StatItem label="FGM/FGA" value={fgmFGA} />
              <StatItem label="FG%" value={fgmPCT} />
              <StatItem label="XPM/XPA" value={xpmXPA} />
              <StatItem label="LONG" value={long} />
            </>
          )}

          {showPunting && (
            <>
              <StatItem label="PUNTS" value={punts} />
              <StatItem label="GP/YDS" value={gpYds} />
              <StatItem label="LONG" value={longestPunt} />
              <StatItem label="TB" value={touchbacks} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}
