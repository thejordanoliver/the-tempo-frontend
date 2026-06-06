import { Colors } from "constants/styles";
import { Image, Text, View } from "react-native";
import {
  SizeType,
  sizeStyles,
  teamRowStyles,
} from "styles/GameDetailStyles/TeamRow.styles";

type SummerLeagueTeamRowProps = {
  team: {
    id?: string | number;
    logo: any;
    code?: string;
    name?: string;
    record?: string;
  };
  rank?: number | null;
  isDark: boolean;
  isHome?: boolean;
  score?: number | null;
  isWinner?: boolean;
  gameStatusDescription?: string;
  size?: SizeType;
  timeouts?: number | null;
  bonusState?: string | null;
  status?: string;
  league?: "summerVegas" | "summerUtah";
};

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
  league = "summerVegas",
}: SummerLeagueTeamRowProps) => {
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

  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isFinal = gameStatusDescription === "Final";
  const isForfeit = gameStatusDescription === "Forfeit";

  const isInvalidRecord = record === "-";
  const displayRecord = isInvalidRecord ? "" : record;

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
        <Image source={logo} style={sizeStyles[size].logo} />

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
