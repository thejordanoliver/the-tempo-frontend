import { Colors } from "constants/Colors";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  NBAProps,
  sizeStyles,
  styles,
} from "styles/GameDetailStyles/TeamRow.styles";
import { useTeamInfo } from "../../hooks/useTeamInfo";

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
  league = "nba", // ✅ defaults to NBA
}: NBAProps & { status?: string; league?: "nba" | "cbb" }) => {
  const router = useRouter();
  const { team: detailedTeam } = useTeamInfo(team.id?.toString());

  const renderTimeouts = (remaining: number) => {
    const totalTimeouts = 6;
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

  // ✅ Normalize CBB statuses to shared terms
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
  const isLive = normalizedStatus === "In Play";
  const isInvalidRecord = team.record === "-";

  const displayRecord = isInvalidRecord
    ? detailedTeam?.current_season_record ?? ""
    : team.record;

  const handleTeamPress = () => {
    if (!team.id) return;
    if (league === "cbb") {
      router.push(`/team/cbb/${team.id}`);
    } else {
      router.push(`/team/${team.id}`);
    }
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
          <Image source={team.logo} style={sizeStyles[size].logo} />
        </Pressable>
        <View style={styles.teamInfo}>
          <Text
            style={[
              styles.teamName,
              { color: colors.text },
              sizeStyles[size].teamName,
            ]}
          >
            <Text style={{ fontSize: 10, color: Colors.lightGray }}>
              {rank}
            </Text>{" "}
            {team.code}
          </Text>

          {!showRecordInsteadOfScore && !isLive && (
            <Text
              style={[
                styles.record,
                { color: colors.record },
                sizeStyles[size].record,
              ]}
            >
              {displayRecord}
            </Text>
          )}

          {isLive && (
            <View style={{ alignItems: "center" }}>
              {renderTimeouts(timeouts)}
            </View>
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
