import { Text, View } from "react-native";
import { RecruitDetailsStyles } from "styles/PlayerStyles/RecruitDetailsStyles";
import { formatRecruitRating } from "utils/recruiting/recruits";
import RecruitTeamLogo from "./RecruitTeamLogo";
import type { RecruitSchoolSectionProps } from "./types";

export default function RecruitInterests({
  recruit,
  isDark,
  league,
}: RecruitSchoolSectionProps) {
  const styles = RecruitDetailsStyles(isDark);
  const predictions = [...(recruit.predicted_schools ?? [])].sort(
    (a, b) => (b.percentage ?? -1) - (a.percentage ?? -1),
  );
  return (
    <>
      {predictions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Recruiting predictions</Text>
          {predictions.map((prediction, index) => (
            <View
              key={`${prediction.school_slug ?? prediction.team_name}-${index}`}
              style={styles.prediction}
            >
              <RecruitTeamLogo
                teamId={prediction.team_id}
                remoteUrl={prediction.image_url}
                league={league}
                isDark={isDark}
              />
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
        <View style={styles.summaryRow}>
          <Text style={styles.secondaryText}>School interests</Text>
          <Text style={styles.summaryValue}>{recruit.interest_count}</Text>
        </View>
      )}
      {recruit.interest_count == null &&
        predictions.length === 0 &&
        !recruit.offers?.length && (
          <View style={styles.section}>
            <Text style={styles.secondaryText}>
              No school interests available.
            </Text>
          </View>
        )}
    </>
  );
}
