import { Colors, Fonts } from "constants/Styles";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { Image, StyleSheet, Text, View } from "react-native";
import { MLBTeam } from "types/mlb";

type TeamInfoProps = {
  team?: MLBTeam;
  teamName: string;
  score?: number;
  opponentScore?: number;
  record?: string;
  side: "home" | "away";
  gameStatusDescription: string;
};

export default function TeamInfo({
  team,
  teamName,
  score,
  opponentScore,
  record,
  gameStatusDescription,
  side,
}: TeamInfoProps) {
  const styles = teamInfoStyle;

  /* ================================
     GAME STATUS FLAGS
  ================================= */
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isCanceled = gameStatusDescription === "Canceled";

  const isLive =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "Halftime" ||
    gameStatusDescription === "End of Period";

  const isInactiveGame = isDelayed || isPostponed || isCanceled;
  const isRecordDisplay = isScheduled || isInactiveGame;

  /* ================================
     WINNER / SCORE LOGIC
  ================================= */
  const isWinner = isFinal && (score ?? 0) > (opponentScore ?? 0);

  const scoreOpacity = isFinal && !isWinner ? 0.4 : 1;

  const valueFontSize = isRecordDisplay ? 24 : 36;

  const displayValue = isRecordDisplay
    ? record ?? "-"
    : score ?? "-";

  /* ================================
     ASSETS
  ================================= */
  const logo = team ? getMLBTeamLogo(team.id, true) : undefined;

  const isHome = side === "home";
  const isAway = side === "away";

  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: isHome ? "flex-end" : "flex-start",
        },
      ]}
    >
      {/* HOME SCORE */}
      {isHome && (
        <Score value={displayValue} opacity={scoreOpacity} fontSize={valueFontSize} />
      )}

      {/* TEAM INFO */}
      <View style={styles.teamContainer}>
        <Image source={logo} style={styles.teamLogo} />
        <Text style={styles.teamName}>{teamName}</Text>

        {isFinal && record && (
          <Text style={styles.teamRecord}>{record}</Text>
        )}
      </View>

      {/* AWAY SCORE */}
      {isAway && (
        <Score value={displayValue} opacity={scoreOpacity} fontSize={valueFontSize} />
      )}
    </View>
  );
}

/* ================================
   REUSABLE SCORE COMPONENT
================================= */
function Score({
  value,
  opacity,
  fontSize,
}: {
  value: string | number;
  opacity: number;
  fontSize: number;
}) {
  return (
    <View style={teamInfoStyle.scoreWrapper}>
      <Text
        style={[
          teamInfoStyle.teamValue,
          { opacity, fontSize },
        ]}
      >
        {value}
      </Text>
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
});
