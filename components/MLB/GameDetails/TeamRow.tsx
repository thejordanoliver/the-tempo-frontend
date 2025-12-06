import { Colors } from "constants/Colors";
import { teams } from "constants/teamsMLB";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  MLBProps,
  sizeStyles,
  styles,
} from "styles/GameDetailStyles/TeamRow.styles";

export const TeamRow = ({
  team,
  rank,
  isDark,
  isHome = false,
  score,
  isWinner,
  colors,
  size = "medium",
  status,
  league = "mlb",
}: MLBProps & { status?: string; league?: "nba" | "cbb" | "mlb" }) => {
  const router = useRouter();

  // -----------------------------------------------------
  // Normalize MLB Status
  // -----------------------------------------------------
  const normalizeMLBStatus = (status?: string) => {
    switch (status) {
      case "NS":
        return "Scheduled";

      case "FT":
        return "Final";

      case "POST":
        return "Postponed";

      case "CANC":
        return "Canceled";

      case "INTR":
        return "Interrupted";

      case "ABD":
        return "Abandoned";

      // In-play innings (IN1 – IN9)
      case "IN1":
      case "IN2":
      case "IN3":
      case "IN4":
      case "IN5":
      case "IN6":
      case "IN7":
      case "IN8":
      case "IN9":
        return "In Play";

      default:
        return status ?? "";
    }
  };

  const normalizedStatus =
    league === "mlb" ? normalizeMLBStatus(status) : status;

  const isScheduled = normalizedStatus === "Scheduled";
  const isLive = normalizedStatus === "In Play";
  const isFinal = normalizedStatus === "Final";

  // -----------------------------------------------------
  // Get main team data
  // -----------------------------------------------------
  const teamObj = teams.find((t) => t.id?.toString() === team.id?.toString());
  const resolvedLogo =
    isDark && teamObj?.logoLight
      ? teamObj.logoLight
      : teamObj?.logo ?? team.logo;

  const resolvedCode = teamObj?.code ?? team.code;
  const resolvedRecord = team.record;

  const isInvalidRecord = resolvedRecord === "-";
  const displayRecord = isInvalidRecord ? "" : resolvedRecord;

  // -----------------------------------------------------
  // Routing
  // -----------------------------------------------------
  const handleTeamPress = () => {
    if (team.id) router.push(`/team/mlb/${team.id}`);
  };

  // -----------------------------------------------------
  // Score color logic
  // -----------------------------------------------------
  const showRecordInsteadOfScore = isScheduled || score == null;

  const getScoreStyle = {
    color: showRecordInsteadOfScore
      ? colors.record
      : isLive
      ? isDark
        ? Colors.white
        : Colors.black
      : isWinner
      ? colors.winnerScore
      : colors.score,
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
              ? [
                  styles.preGameRecord,
                  sizeStyles[size].preGameRecord,
                  { color: colors.record },
                ]
              : [styles.score, sizeStyles[size].score, getScoreStyle]
          }
        >
          {showRecordInsteadOfScore ? displayRecord : score ?? ""}
        </Text>
      )}

      {/* Team Info */}
      <View style={styles.teamInfoContainer}>
        <Pressable onPress={handleTeamPress}>
          <Image source={{ uri: resolvedLogo }} style={sizeStyles[size].logo} />
        </Pressable>

        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { color: colors.text }]}>
            <Text style={{ fontSize: 10, color: Colors.lightGray }}>
              {rank}
            </Text>{" "}
            {resolvedCode}
          </Text>

          {!showRecordInsteadOfScore && !isLive && (
            <Text style={[styles.record, { color: colors.record }]}>
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
              ? [
                  styles.preGameRecord,
                  sizeStyles[size].preGameRecord,
                  { color: colors.record },
                ]
              : [styles.score, sizeStyles[size].score, getScoreStyle]
          }
        >
          {showRecordInsteadOfScore ? displayRecord : score ?? ""}
        </Text>
      )}
    </View>
  );
};
