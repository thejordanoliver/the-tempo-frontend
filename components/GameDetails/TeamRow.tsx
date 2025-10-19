import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useTeamInfo } from "../../hooks/useTeamInfo"; // adjust path
import { styles, sizeStyles, NBAProps } from "styles/GameDetailStyles/TeamRow.styles";





export const TeamRow = ({
  team,
  isDark,
  isHome = false,
  score,
  isWinner,
  colors,
  size = "medium",
  status, // Add status to props
}: NBAProps & { status?: string }) => {
  const router = useRouter();
  const { team: detailedTeam } = useTeamInfo(team.id);

  const isScheduled = status === "Scheduled";
console.log(status)
  const isInvalidRecord = !team.record || team.record === "0-0" || team.record === "-";
  const displayRecord = isInvalidRecord ? detailedTeam?.current_season_record ?? "" : team.record;

  const handleTeamPress = () => {
    if (!team.id) return;
    router.push(`/team/${team.id}`);
  };

  // Show record if game is scheduled or score is null
  const showRecordInsteadOfScore = isScheduled || score == null;

  const getScoreStyle = {
    color: showRecordInsteadOfScore ? colors.record : isWinner ? colors.winnerScore : colors.score,
  };

  return (
    <View style={styles.row}>
      {/* Home Score */}
      {isHome && (
   <Text
  style={
    showRecordInsteadOfScore
      ? [styles.preGameRecord, sizeStyles[size].preGameRecord, { color: colors.record }]
      : [styles.score, sizeStyles[size].score, getScoreStyle]
  }
>
  {showRecordInsteadOfScore ? displayRecord : score ?? ""}
</Text>

      )}

      {/* Team Info */}
      <View style={styles.teamInfoContainer}>
        <Pressable onPress={handleTeamPress}>
          <Image source={team.logo} style={sizeStyles[size].logo} />
        </Pressable>
        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { color: colors.text }, sizeStyles[size].teamName]}>
            {team.name}
          </Text>
          {/* Only show record if score exists and game is live/final */}
          {!showRecordInsteadOfScore && (
            <Text style={[styles.record, { color: colors.record }, sizeStyles[size].record]}>
              {displayRecord}
            </Text>
          )}
        </View>
      </View>

      {/* Away Score */}
      {!isHome && (
  <Text
  style={
    showRecordInsteadOfScore
      ? [styles.preGameRecord, sizeStyles[size].preGameRecord, { color: colors.record }]
      : [styles.score, sizeStyles[size].score, getScoreStyle]
  }
>
  {showRecordInsteadOfScore ? displayRecord : score ?? ""}
</Text>

      )}
    </View>
  );
};

