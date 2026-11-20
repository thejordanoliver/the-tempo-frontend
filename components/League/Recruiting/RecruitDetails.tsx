import type { Recruit } from "types/recruiting/players";
import { Colors, Fonts } from "constants/styles";
import {
  formatRecruitRating,
  getRecruitRanking,
  getRecruitStatus,
} from "utils/recruiting/recruits";
import { StyleSheet, Text, View } from "react-native";

export default function RecruitDetails({
  recruit,
  isDark,
}: {
  recruit: Recruit;
  isDark: boolean;
}) {
  const styles = detailStyles(isDark);
  const status = getRecruitStatus(recruit);
  const predictions = [...recruit.predicted_schools].sort(
    (a, b) => (b.percentage ?? -1) - (a.percentage ?? -1),
  );
  const commitmentDate = recruit.commitment_date?.slice(0, 10);
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{recruit.year} recruiting class</Text>
      {(["industry", "on3"] as const).map((source) => {
        const rank = getRecruitRanking(recruit, source);
        return (
          <View key={source} style={styles.section}>
            <Text style={styles.heading}>
              {source === "industry" ? "Industry" : "On3"}
            </Text>
            <Text style={styles.text}>
              National {rank.national ?? "—"} · Position {rank.position ?? "—"}{" "}
              · State {rank.state ?? "—"}
            </Text>
            <Text style={styles.text}>
              {rank.stars == null ? "Unrated" : `${rank.stars} stars`} · Rating{" "}
              {formatRecruitRating(rank.rating)}
            </Text>
          </View>
        );
      })}
      {recruit.five_star_plus && (
        <Text style={styles.heading}>Five Star Plus</Text>
      )}
      <View style={styles.section}>
        <Text style={styles.heading}>{status}</Text>
        {(recruit.is_committed || recruit.is_signed || recruit.is_enrolled) && (
          <Text style={styles.text}>
            {recruit.committed_team_name ?? "School unavailable"}
          </Text>
        )}
        {commitmentDate && (
          <Text style={styles.text}>Committed {commitmentDate}</Text>
        )}
      </View>
      {predictions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Recruiting predictions</Text>
          {predictions.map((prediction, index) => (
            <View
              key={`${prediction.school_slug ?? prediction.team_name}-${index}`}
              style={styles.prediction}
            >
              <Text style={[styles.text, styles.school]}>
                {prediction.team_name}
              </Text>
              <Text style={styles.text}>
                {prediction.percentage == null
                  ? "—"
                  : `${formatRecruitRating(prediction.percentage)}%`}
              </Text>
            </View>
          ))}
        </View>
      )}
      {recruit.interest_count != null && (
        <Text style={styles.text}>
          School interests {recruit.interest_count}
        </Text>
      )}
      {recruit.nil_valuation != null &&
        Number.isFinite(Number(recruit.nil_valuation)) && (
          <Text style={styles.text}>
            NIL valuation{" "}
            {Number(recruit.nil_valuation).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </Text>
        )}
    </View>
  );
}

const detailStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
    section: {
      paddingVertical: 10,
      gap: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    heading: {
      fontFamily: Fonts.BOLD,
      fontSize: 17,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    text: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    prediction: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    school: { flex: 1 },
  });
