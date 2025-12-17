import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { teams as nbaTeams } from "constants/teams";
import { teams as cbbTeams } from "constants/teamsCBB";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  NBAProps,
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
  timeouts,
  foulsToGive,
  league = "nba",
}: NBAProps & { status?: string; league?: "nba" | "cbb" }) => {
  const router = useRouter();

  // -----------------------------------------------------
  // ✅ Get Team Info from constants instead of useTeamInfo
  // -----------------------------------------------------
  const teamLookup =
    league === "cbb"
      ? cbbTeams.find((t) => t.id?.toString() === team.id?.toString())
      : nbaTeams.find((t) => t.id?.toString() === team.id?.toString());

  // Use light logo in dark mode if available
  const resolvedLogo =
    isDark && teamLookup?.logoLight
      ? teamLookup.logoLight
      : teamLookup?.logo ?? team.logo;
  const resolvedCode = teamLookup?.code ?? team.code;
  const resolvedRecord = team.record;

  // -----------------------------------------------------
  // Status normalization
  // -----------------------------------------------------
  const normalizedStatus =
    league === "cbb"
      ? (() => {
          switch (status) {
            case "NS":
              return "Scheduled";
            case "Q1":
            case "Q2":
            case "Q3":
            case "Q4":
            case "OT":
            case "AOT":
            case "BT":
            case "HT":
              return "In Play";
            case "FT":
              return "Final";
            case "POST":
              return "Postponed";
            case "CANC":
              return "Canceled";
            case "SUSP":
              return "Suspended";
            default:
              return status;
          }
        })()
      : status;

  const isScheduled = normalizedStatus === "Scheduled";
  const isFinal = normalizedStatus === "Final";
  const isLive =
    normalizedStatus === "In Play" || normalizedStatus === "Halftime";
  const isBonus =
    isLive &&
    foulsToGive !== null &&
    foulsToGive !== undefined &&
    foulsToGive === 0;

  const renderBonus = () => {
    if (!isBonus) return null;

    return (
      <Text
        style={{
          marginTop: 2,
          position: "absolute",
          bottom: -10,
          fontSize: 8,
          fontFamily: Fonts.OSMEDIUM,
          letterSpacing: 0.5,
          color: isDark ? Colors.white : Colors.black,
          textAlign: "center",
        }}
      >
        BONUS
      </Text>
    );
  };

  const isInvalidRecord = resolvedRecord === "-";
  const displayRecord = isInvalidRecord ? "" : resolvedRecord;

  // -----------------------------------------------------
  // Routing
  // -----------------------------------------------------
  const handleTeamPress = () => {
    if (!team.id) return;
    if (league === "cbb") router.push(`/team/cbb/${team.id}`);
    else router.push(`/team/${team.id}`);
  };

  const showRecordInsteadOfScore = isScheduled || score == null;

  const getScoreStyle = {
    color: showRecordInsteadOfScore
      ? colors.record
      : isLive && isDark
      ? Colors.white
      : isLive
      ? Colors.black
      : isWinner
      ? colors.winnerScore
      : colors.score,
  };

  const renderTimeouts = (remaining: number) => {
    const totalTimeouts = 7;
    return (
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        {Array.from({ length: totalTimeouts }).map((_, i) => (
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

  return (
    <View style={styles.row}>
      {/* Home Score */}
      {isHome && (
        <View style={{ alignItems: "center" }}>
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

          {renderBonus()}
        </View>
      )}

      {/* Team Info */}
      <View style={styles.teamInfoContainer}>
        <Pressable onPress={handleTeamPress}>
          <Image source={resolvedLogo} style={sizeStyles[size].logo} />
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
              {isLive && (
                <View style={{ alignItems: "center", marginTop: 4 }}></View>
              )}
            </Text>
          )}

          {isLive && timeouts !== undefined && (
            <View style={{ alignItems: "center" }}>
              {renderTimeouts(timeouts)}
            </View>
          )}
        </View>
      </View>

      {/* Away Score */}
      {!isHome && (
        <View style={{ alignItems: "center" }}>
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

          {renderBonus()}
        </View>
      )}
    </View>
  );
};
