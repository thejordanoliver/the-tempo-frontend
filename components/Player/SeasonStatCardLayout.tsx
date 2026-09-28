import CenteredHeader from "components/Headings/CenteredHeader";
import { Colors } from "constants/styles";
import { Text, View } from "react-native";
import { seasonStatCardStyles } from "styles/PlayerStyles/SeasonStatCardStyles";
import type { PlayerStatRanking } from "types/playerSeasonRankings";
import { getContrastingTextColor } from "utils/color";

export type SeasonStatItem = {
  label: string;
  value: string | number;
  ranking?: PlayerStatRanking | null;
};

type Props = {
  isDark: boolean;
  seasonLabel: string;
  stats: SeasonStatItem[];
  teamColor?: string;
  formatValue?: (value: SeasonStatItem["value"]) => string | number;
};

export default function SeasonStatCardLayout({
  isDark,
  seasonLabel,
  stats,
  teamColor,
  formatValue = (value) => value,
}: Props) {
  const styles = seasonStatCardStyles(isDark);
  const backgroundColor = teamColor || Colors.midTone;
  const textColor = getContrastingTextColor(backgroundColor);

  return (
    <View>
      <CenteredHeader isDark={isDark}>{seasonLabel} Season</CenteredHeader>

      <View style={styles.card}>
        <View style={[styles.rankStrip, { backgroundColor }]} />
        <View style={styles.statsRow}>
          {stats.map(({ label, value, ranking }) => (
            <View key={label} style={styles.statItem}>
              <Text style={[styles.statRank, { color: textColor }]}>
                {ranking ? `#${ranking.rank}` : "NR"}
              </Text>
              <Text style={styles.statValue}>{formatValue(value)}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
