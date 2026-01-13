import FootballLight from "assets/icons8/FootballLight.png";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo } from "constants/teamsCFB";
import { Image, StyleSheet, Text, View } from "react-native";
import { CFBTeam } from "types/cfb";

type TeamInfoProps = {
  team: CFBTeam;
  teamName: string;
  rank?: number;
  score: number;
  opponentScore: number;
  record: string;
  isDark: boolean;
  possessionTeamId?: string;
  side: "home" | "away";
  timeouts: number;
  lighter?: boolean;
  gameStatusDescription: string;
};

export default function TeamInfo({
  team,
  teamName,
  score,
  opponentScore,
  record,
  rank,
  gameStatusDescription,
  possessionTeamId,
  side,
  timeouts,
}: TeamInfoProps) {
  const isFinal =
    gameStatusDescription === "Final" || gameStatusDescription === "Finished";

  const isScheduled =
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Not Started";

  const isTie = isFinal && score === opponentScore;
  const isWinner = isFinal && !isTie && score > opponentScore;

  const styles = teamInfoStyle;

  const isRecord = isScheduled;
  const valueFontSize = isRecord ? 24 : 36;

  const scoreOpacity = !isFinal ? 1 : isTie ? 1 : isWinner ? 1 : 0.5;

  const logo = getTeamLogo(team?.id, true) || getTeamLogo(team?.id, false);

  const displayValue = isScheduled ? record ?? "-" : score ?? "-";

  const hasPossession =
    gameStatusDescription && String(possessionTeamId) === String(team?.espnID);

  const renderTimeouts = (remaining: number) => {
    const totalTimeouts = 3;
    return (
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        {Array.from({ length: totalTimeouts }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 2,
              borderRadius: 2,
              backgroundColor: Colors.white,
              opacity: i < remaining ? 1 : 0.3,
              marginHorizontal: 2,
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: side === "home" ? "flex-end" : "flex-start",
        },
      ]}
    >
      {/* ===== HOME SCORE (LEFT) ===== */}
      {side === "home" && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              styles.teamValue,
              {
                opacity: scoreOpacity,
                fontSize: valueFontSize,
              },
            ]}
          >
            {displayValue}
          </Text>

          {hasPossession && (
            <Image source={FootballLight} style={styles.possessionIcon} />
          )}
        </View>
      )}

      {/* ===== TEAM LOGO + NAME ===== */}
      <View style={styles.teamContainer}>
        <Image source={logo} style={styles.teamLogo} />

        <Text style={styles.teamName}>
          {typeof rank === "number" && rank > 0 ? (
            <Text style={styles.teamRank}>{rank} </Text>
          ) : null}
          {teamName}
        </Text>

        {/* Show timeouts only during live */}
        {!isScheduled && !isFinal && renderTimeouts(timeouts)}

        {/* Final: show record */}
        {isFinal && <Text style={styles.teamRecord}>{record}</Text>}
      </View>

      {/* ===== AWAY SCORE (RIGHT) ===== */}
      {side === "away" && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              styles.teamValue,
              {
                opacity: scoreOpacity,
                fontSize: valueFontSize,
              },
            ]}
          >
            {displayValue}
          </Text>

          {hasPossession && (
            <Image source={FootballLight} style={styles.possessionIcon} />
          )}
        </View>
      )}
    </View>
  );
}

export const teamInfoStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  teamContainer: {
    alignItems: "center",
    gap: 4,
  },

  teamName: {
    fontSize: 14,
    fontFamily: Fonts.OSREGULAR,
    color: Colors.white,
  },

  teamLogo: {
    width: 65,
    height: 65,
    resizeMode: "contain",
  },

  scoreWrapper: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    minWidth: 50,
  },

  possessionIcon: {
    position: "absolute",
    bottom: -20,
    width: 26,
    height: 26,
    resizeMode: "contain",
  },

  teamRecord: {
    fontFamily: Fonts.OSREGULAR,
    color: Colors.white,
    opacity: 0.7,
  },

  teamValue: {
    fontFamily: Fonts.OSBOLD,
    color: Colors.white,
  },
  teamRank: { fontSize: 10, color: Colors.lightGray },
});
