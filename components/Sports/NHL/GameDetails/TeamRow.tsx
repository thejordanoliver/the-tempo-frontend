import { Colors } from "constants/Styles";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  NHLProps,
  sizeStyles,
  teamRowStyles,
} from "styles/GameDetailStyles/TeamRow.styles";

export const TeamRow = ({
  team,
  rank,
  isDark,
  isHome = false,
  score,
  isWinner,
  size = "medium",
  gameStatusDescription,
}: NHLProps) => {
  const router = useRouter();
  const styles = teamRowStyles(isDark);

  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "End of Period";
  const isFinal = gameStatusDescription === "Final";

  const code = team.code;
  const record = team.record === "-" ? "" : team.record;
  const isInvalidRecord = record === "-";
  const displayRecord = isInvalidRecord ? "" : record;

  // -----------------------------------------------------
  // Routing
  // -----------------------------------------------------
  const handleTeamPress = () => {
    if (team.id) router.push(`/team/nhl/${team.id}`);
  };

  // -----------------------------------------------------
  // Score color logic
  // -----------------------------------------------------
  const showRecordInsteadOfScore = isScheduled || score == null;

  /* -----------------------------------------------------
   * Styles
   * --------------------------------------------------- */
  const getScoreStyle = () => {
    if (score == null) {
      return { color: Colors.midTone, opacity: 0.5 };
    }

    if (inProgress) {
      return { color: isDark ? Colors.white : Colors.black };
    }

    if (isFinal) {
      return {
        color: isWinner
          ? isDark
            ? Colors.dark.white
            : Colors.light.black
          : Colors.midTone,
      };
    }

    return { color: Colors.midTone };
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <View style={styles.row}>
      {/* Home Score */}
      {isHome && (
        <Text
          style={
            showRecordInsteadOfScore
              ? [styles.preGameRecord, sizeStyles[size].preGameRecord]
              : [styles.score, sizeStyles[size].score, getScoreStyle()]
          }
        >
          {showRecordInsteadOfScore ? displayRecord : (score ?? "")}
        </Text>
      )}

      {/* Team Info */}
      <View style={styles.teamInfoContainer}>
        <Pressable onPress={handleTeamPress}>
          <Image source={team.logo} style={sizeStyles[size].logo} />
        </Pressable>

        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>
            {rank && <Text style={styles.rank}>{rank} </Text>}
            {code}
          </Text>

          {!showRecordInsteadOfScore && !inProgress && (
            <Text style={styles.record}>{team.record}</Text>
          )}
        </View>
      </View>

      {/* Away Score */}
      {!isHome && (
        <View style={styles.scoreWrapper}>
          <Text
            style={
              showRecordInsteadOfScore
                ? [styles.preGameRecord, sizeStyles[size].preGameRecord]
                : [styles.score, sizeStyles[size].score, getScoreStyle()]
            }
          >
            {showRecordInsteadOfScore ? record : (score ?? "")}
          </Text>
        </View>
      )}
    </View>
  );
};
