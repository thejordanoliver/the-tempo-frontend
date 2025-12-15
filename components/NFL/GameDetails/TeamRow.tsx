import { Colors } from "constants/Colors";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  FootballTeamRowProps,
  sizeStyles,
  styles,
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
  status,
  colors,
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

  const isScheduled = status === "Scheduled";
  const isLive =
    status &&
    status !== "Scheduled" &&
    status !== "Final" &&
    status !== undefined;
  const isFinal = status === "Final";

  // 🔥 CFB uses team.espnID, NFL uses team.id
  const teamIdentifier = league === "cfb" ? team.espnID : team.id;
  const hasPossession =
    isLive && String(possessionTeamId) === String(teamIdentifier);

  const isTie =
    isFinal &&
    score != null &&
    opponentScore != null &&
    score === opponentScore;

  const getScoreStyle = () => {
    if (score == null) return { color: colors.score, opacity: 0.5 };
    if (isLive) return { color: isDark ? Colors.white : Colors.black };
    if (isFinal) {
      if (isTie)
        return { color: isDark ? Colors.white : Colors.black, opacity: 1 };
      return {
        color: isWinner ? colors.winnerScore : colors.score,
        opacity: isWinner ? 1 : 0.5,
      };
    }
    return { color: colors.score };
  };

  const renderTimeouts = (remaining: number) => {
    const totalTimeouts = 3;
    return (
      <View
        style={{ flexDirection: "row", marginTop: league === "cfb" ? 2 : 4 }}
      >
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
    : isLive
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
                ? [
                    styles.preGameRecord,
                    sizeStyles[size].preGameRecord,
                    { color: colors.record },
                  ]
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
              <Text style={[styles.teamName, { color: colors.text }]}>
                <>
                  {rank != null ? (
                    <Text style={[ styles.rank ,{fontSize: 10, color: Colors.lightGray }]}>
                      {rank}{" "}
                    </Text>
                  ) : null}

                  {team.shortName || team.name}
                </>
              </Text>
            ) : (
              <Text style={[styles.teamName, { color: colors.text }]}>
                {team.code}
              </Text>
            )}
          </View>

          {isLive && (
            <View
              style={{
                alignItems: "center",
                marginTop: league === "cfb" ? 2 : 4,
              }}
            >
              {renderTimeouts(timeouts)}
            </View>
          )}

          {isFinal && (
            <Text
              style={[
                styles.record,
                sizeStyles[size].record,
                {
                  color: isTie ? colors.text : colors.record,
                },
              ]}
            >
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
                ? [
                    styles.preGameRecord,
                    sizeStyles[size].preGameRecord,
                    { color: colors.record },
                  ]
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
