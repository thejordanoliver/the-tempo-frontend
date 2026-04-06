import { Colors } from "constants/styles";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  BasketballTeamRowProps,
  sizeStyles,
  teamRowStyles,
} from "styles/GameDetailStyles/TeamRow.styles";

/* -----------------------------------------------------
 * Helpers
 * --------------------------------------------------- */

export const TeamRow = ({
  team,
  rank,
  isDark,
  isHome = false,
  score,
  isWinner,
  size = "medium",
  timeouts,
  bonusState,
  gameStatusDescription,
}: BasketballTeamRowProps) => {
  const router = useRouter();
  const styles = teamRowStyles(isDark);

  /* -----------------------------------------------------
   * Team Resolution
   * --------------------------------------------------- */

  const logo = team.logo;
  const code = team.code;
  const record = team.record === "-" ? "" : team.record;

  /* -----------------------------------------------------
   * Game State
   * --------------------------------------------------- */
  const isFinal = gameStatusDescription === "Final";
  const isScheduled =
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Delayed" ||
    gameStatusDescription === "Postponed";

  const inProgress = ["In Progress", "Halftime", "End of Period"].includes(
    gameStatusDescription ?? "",
  );

  const showRecordInsteadOfScore = isScheduled || score == null;

  /* -----------------------------------------------------
   * Routing
   * --------------------------------------------------- */
  const handleTeamPress = () => {
    if (team.id) {
      router.push(`/team/${team.id}`);
    }
  };

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

  /* -----------------------------------------------------
   * Render Helpers
   * --------------------------------------------------- */
  const renderTimeouts = (remaining: number) => {
    const total = 7;

    return (
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 4,
              height: 2,
              borderRadius: 4,
              backgroundColor: isDark ? Colors.white : Colors.black,
              opacity: i < remaining ? 1 : 0.5,
              marginHorizontal: 2,
            }}
          />
        ))}
      </View>
    );
  };

  const renderBonus = () =>
    bonusState === "DOUBLE" && !isFinal ? (
      <Text style={styles.bonus}>BONUS</Text>
    ) : null;

  /* -----------------------------------------------------
   * Render
   * --------------------------------------------------- */
  return (
    <View style={styles.row}>
      {/* Home Score */}
      {isHome && (
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
          {renderBonus()}
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
            <Text style={styles.record}>{record}</Text>
          )}

          {inProgress && timeouts != null && (
            <View style={{ alignItems: "center" }}>
              {renderTimeouts(timeouts)}
            </View>
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
          {renderBonus()}
        </View>
      )}
    </View>
  );
};
