import { Colors } from "constants/styles";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  SoccerProps,
  sizeStyles,
  teamRowStyles,
} from "styles/GameDetailStyles/TeamRow.styles";

export const TeamRow = ({
  id,
  rank,
  logo,
  record,
  name,
  isDark,
  isHome = false,
  score,
  isWinner,
  league,
  size = "medium",
  gameStatusDescription,
}: SoccerProps) => {
  const router = useRouter();
  const styles = teamRowStyles(isDark);

  const isScheduled = gameStatusDescription === "Scheduled";
  const isSuspended = gameStatusDescription === "Suspended";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isFinal = gameStatusDescription === "Full Time";
  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "First Half" ||
    gameStatusDescription === "Second Half" ||
    gameStatusDescription === "End of Period";

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

  const handleTeamPress = () => {
    if (id && league === "mls") router.push(`/team/soccer/${id}`);
    if (id && league === "champions") router.push(`/team/soccer/${id}`);
    if (id && league === "epl") router.push(`/team/soccer/${id}`);
  };

  const showRecordInsteadOfScore =
    isScheduled ||
    isPostponed ||
    isForfeited ||
    isSuspended ||
    isCanceled ||
    isDelayed ||
    score == null;

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
          {showRecordInsteadOfScore ? record : score}
        </Text>
      )}

      {/* Team Info */}
      <View style={styles.teamInfoContainer}>
        <Pressable onPress={handleTeamPress}>
          <Image source={{uri: logo}} style={sizeStyles[size].logo} />
        </Pressable>

        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>
            <Text style={styles.rank}>{rank} </Text>
            {name}
          </Text>

          {!showRecordInsteadOfScore && !inProgress && (
            <Text style={styles.record}>{record}</Text>
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
