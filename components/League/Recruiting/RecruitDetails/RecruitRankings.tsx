import { Text, View } from "react-native";
import { RecruitDetailsStyles } from "styles/PlayerStyles/RecruitDetailsStyles";
import {
  formatRecruitRating,
  getRecruitRanking,
} from "utils/recruiting/recruits";
import type { RecruitSectionProps } from "./types";

export default function RecruitRankings({
  recruit,
  isDark,
}: RecruitSectionProps) {
  const styles = RecruitDetailsStyles(isDark);
  const rank = getRecruitRanking(recruit, "industry");
  return (
    <View style={styles.section}>
      <View style={styles.statsRow}>
        {(
          [
            ["National", rank.national],
            ["Position", rank.position],
            ["State", rank.state],
          ] as const
        ).map(([label, value]) => (
          <View key={label} style={styles.stat}>
            <Text style={styles.statValue}>
              {value == null ? "—" : `#${value}`}
            </Text>
            <Text style={styles.label}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.ratingRow}>
        <Text style={styles.stars}>
          {rank.stars == null ? "Unrated" : `${rank.stars} stars`}
        </Text>
        <Text style={styles.text}>
          Rating {formatRecruitRating(rank.rating)}
        </Text>
      </View>
    </View>
  );
}
