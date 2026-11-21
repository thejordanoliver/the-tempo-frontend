import { Text, View } from "react-native";
import { RecruitDetailsStyles } from "styles/PlayerStyles/RecruitDetailsStyles";
import { formatDate } from "utils/common/dateUtils";
import RecruitTeamLogo from "./RecruitTeamLogo";
import type { RecruitSchoolSectionProps } from "./types";

export default function RecruitCommitment({
  recruit,
  isDark,
  league,
}: RecruitSchoolSectionProps) {
  const styles = RecruitDetailsStyles(isDark);
  const commitmentDate = formatDate(recruit?.commitment_date ?? "");
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>Commitment</Text>
      </View>
      {(recruit.is_committed || recruit.is_signed || recruit.is_enrolled) && (
        <View style={styles.schoolRow}>
          <RecruitTeamLogo
            teamId={recruit.committed_team_id}
            remoteUrl={recruit.committed_school_logo_url}
            league={league}
            isDark={isDark}
          />
          <Text style={[styles.text, styles.school]}>
            {recruit.committed_team_name ?? "School unavailable"}
          </Text>
        </View>
      )}
      {commitmentDate && (
        <Text style={styles.secondaryText}>Committed {commitmentDate}</Text>
      )}
    </View>
  );
}
