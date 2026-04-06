import { Colors } from "constants/styles";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  BasketballTeamRowProps,
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
  gameStatusDescription,
  size = "medium",
  timeouts,
  bonusState,
  league = "cbb",
}: BasketballTeamRowProps & { status?: string; league?: "cbb" | "wcbb" }) => {
  const router = useRouter();
  const styles = teamRowStyles(isDark);

  const logo = team.logo;
  const code = team.code;
  const record = team.record;

  // -----------------------------------------------------
  // Status normalization
  // -----------------------------------------------------

  const isScheduled = gameStatusDescription === "Scheduled";

  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "Halftime" ||
    gameStatusDescription === "End of Period";

  const isHalftime = gameStatusDescription === "Halftime";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isFinal = gameStatusDescription === "Final";
  const isForfeit = gameStatusDescription === "Forfeit";

  const isInvalidRecord = record === "-";
  const displayRecord = isInvalidRecord ? "" : record;

  // -----------------------------------------------------
  // Routing
  // -----------------------------------------------------
  const handleTeamPress = () => {
    if (league === "wcbb") {
      if (!team.wid) return;
      router.push(`/team/wcbb/${team.wid}`);
      return;
    }

    // Men's college
    if (!team.id) return;
    router.push(`/team/cbb/${team.id}`);
  };

  const showRecordInsteadOfScore =
    isCanceled || isDelayed || isPostponed || isScheduled || score == null;

  const getScoreStyle = () => {
    if (score == null) return { color: Colors.midTone, opacity: 0.5 };
    if (inProgress) return { color: isDark ? Colors.white : Colors.black };
    if (isFinal || isForfeit) {
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

  return (
    <View style={styles.row}>
      {/* Home Score */}
      {isHome && (
        <View style={styles.scoreWrapper}>
          <Text
            style={
              showRecordInsteadOfScore
                ? [styles.preGameRecord, sizeStyles[size].preGameRecord]
                : [
                    styles.score,
                    sizeStyles[size].score,
                    getScoreStyle(), // ✅ CALL IT
                  ]
            }
          >
            {showRecordInsteadOfScore ? displayRecord : (score ?? "")}
          </Text>
        </View>
      )}

      {/* Team Info */}
      <View style={styles.teamInfoContainer}>
        <Pressable onPress={handleTeamPress}>
          <Image source={logo} style={sizeStyles[size].logo} />
        </Pressable>

        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>
            {rank && <Text style={styles.rank}>{rank} </Text>}
            {code}
          </Text>

          {!showRecordInsteadOfScore && !inProgress && (
            <Text style={styles.record}>{displayRecord}</Text>
          )}

          {inProgress && timeouts !== undefined && (
            <View style={{ alignItems: "center" }}></View>
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
                : [
                    styles.score,
                    sizeStyles[size].score,
                    getScoreStyle(), // ✅ CALL IT
                  ]
            }
          >
            {showRecordInsteadOfScore ? displayRecord : (score ?? "")}
          </Text>
        </View>
      )}
    </View>
  );
};
