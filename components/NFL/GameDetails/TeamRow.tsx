import { Colors } from "constants/Colors";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  FootballTeamRowProps,
  sizeStyles,
  teamRowStyles,
} from "styles/GameDetailStyles/TeamRow.styles";
import Football from "../../../assets/icons8/Football.png";
import FootballLight from "../../../assets/icons8/FootballLight.png";

export const TeamRow = ({
  league,
  team,
  rank,
  isDark,
  isHome = false,
  score,
  isWinner,
  gameStatusDescription,
  possessionTeamId,
  size = "medium",
  timeouts = 3,
  opponentScore,
}: FootballTeamRowProps) => {
  const router = useRouter();

  // 🔥 Routing based on league
  const handleTeamPress = () => {
    const id = team.id;
    if (!id) return;
    router.push(`/team/${league}/${id}`);
  };

  const isFinal = gameStatusDescription === "Final";
  const isScheduled =
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Not Started";
  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "End of Period" ||
    gameStatusDescription === "Halftime";

  // 🔥 CFB uses team.espnID, NFL uses team.id
  const teamIdentifier = team.espnID;
  const hasPossession =
    inProgress && String(possessionTeamId) === String(teamIdentifier);

  const isTie =
    isFinal &&
    score != null &&
    opponentScore != null &&
    score === opponentScore;

  const styles = teamRowStyles(isDark, isTie);

  const getScoreStyle = () => {
    if (score == null) return { color: Colors.midTone, opacity: 0.5 };
    if (inProgress) return { color: isDark ? Colors.white : Colors.black };
    if (isFinal) {
      if (isTie)
        return { color: isDark ? Colors.white : Colors.black, opacity: 1 };
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

  const renderTimeouts = (remaining: number) => {
    const totalTimeouts = 3;
    return (
      <View style={{ flexDirection: "row" }}>
        {Array.from({ length: totalTimeouts }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
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

  const displayScore = isScheduled
    ? team.record ?? "0-0"
    : score != null
    ? score
    : inProgress
    ? "..."
    : team.record ?? "0-0";

  return (
    <View style={styles.row}>
      {/* Home Score */}
      {isHome && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              isScheduled
                ? [styles.preGameRecord, sizeStyles[size].preGameRecord]
                : [styles.score, sizeStyles[size].score, getScoreStyle()],
            ]}
          >
            {displayScore}
          </Text>

          {hasPossession && (
            <Image
              source={isDark ? FootballLight : Football}
              style={styles.possessionIcon}
            />
          )}
        </View>
      )}

      {/* Team Info */}
      <View style={styles.teamInfoContainer}>
        <Pressable onPress={handleTeamPress}>
          <Image source={team.logo} style={sizeStyles[size].logo} />
        </Pressable>

        <View style={styles.teamInfo}>
          <View style={styles.nameRow}>
            {/* 🔥 League-specific name formatting */}
            {league === "cfb" ? (
              <Text style={styles.teamName}>
                {rank && <Text style={styles.rank}>{rank} </Text>}
                {team.shortName || team.name}
              </Text>
            ) : (
              <Text style={styles.teamName}>{team.code}</Text>
            )}
          </View>

          {inProgress && (
            <View
              style={{
                alignItems: "center",
              }}
            >
              {renderTimeouts(timeouts)}
            </View>
          )}

          {isFinal && (
            <Text style={[styles.record, sizeStyles[size].record]}>
              {team.record ?? "0-0"}
            </Text>
          )}
        </View>
      </View>

      {/* Away Score */}
      {!isHome && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              isScheduled
                ? [styles.preGameRecord, sizeStyles[size].preGameRecord]
                : [styles.score, sizeStyles[size].score, getScoreStyle()],
            ]}
          >
            {displayScore}
          </Text>

          {hasPossession && (
            <Image
              source={isDark ? FootballLight : Football}
              style={styles.possessionIcon}
            />
          )}
        </View>
      )}
    </View>
  );
};
