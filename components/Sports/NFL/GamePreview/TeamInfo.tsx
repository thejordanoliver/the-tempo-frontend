import FootballLight from "assets/icons8/FootballLight.png";
import { Colors, Fonts } from "constants/Styles";
import { Image, StyleSheet, Text, View } from "react-native";
import { NFLTeam } from "types/nfl";

type TeamInfoProps = {
  team: NFLTeam;
  teamName: string;
  rank?: number;
  score: number;
  opponentScore: number;
  record?: string;
  isDark: boolean;
  possessionTeamId?: number | null;
  side: "home" | "away";
  timeouts?: number;
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
  const styles = teamInfoStyle;

  // --------------------------------------------------------------
  // GAME STATE
  // --------------------------------------------------------------
  const isFinal =
    gameStatusDescription === "Final" || gameStatusDescription === "Finished";
  const isScheduled =
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Not Started";

  const isTie = isFinal && score === opponentScore;
  const isWinner = isFinal && !isTie && score > opponentScore;
  const scoreOpacity = !isFinal ? 1 : isTie ? 1 : isWinner ? 1 : 0.5;

  const isRecord = isScheduled;
  const valueFontSize = isRecord ? 24 : 36;
  const displayValue = isScheduled ? record ?? "-" : score ?? "-";

  const hasPossession =
    gameStatusDescription && String(possessionTeamId) === String(team?.espnID);

  const logo = team.logoLight || team.logo;

  // --------------------------------------------------------------
  // TIMEOUTS RENDERING
  // --------------------------------------------------------------
  const renderTimeouts = (remaining: number = 0) => {
    const totalTimeouts = 3;

    return (
      <View style={styles.timeoutsWrapper}>
        {Array.from({ length: totalTimeouts }).map((_, i) => (
          <View
            key={i}
            style={[styles.timeoutBar, { opacity: i < remaining ? 1 : 0.3 }]}
          />
        ))}
      </View>
    );
  };

  // --------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------
  return (
    <View
      style={[
        styles.container,
        { justifyContent: side === "home" ? "flex-end" : "flex-start" },
      ]}
    >
      {/* ===== HOME SCORE (LEFT) ===== */}
      {side === "home" && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              styles.teamValue,
              { opacity: scoreOpacity, fontSize: valueFontSize },
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
          {rank != null && <Text style={styles.teamRank}>{rank} </Text>}
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
              { opacity: scoreOpacity, fontSize: valueFontSize },
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

// --------------------------------------------------------------
// STYLES
// --------------------------------------------------------------
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

  teamRank: {
    fontSize: 10,
    color: Colors.lightGray,
  },

  timeoutsWrapper: {
    flexDirection: "row",
    marginTop: 4,
  },

  timeoutBar: {
    width: 8,
    height: 2,
    borderRadius: 2,
    backgroundColor: Colors.white,
    marginHorizontal: 2,
  },
});
