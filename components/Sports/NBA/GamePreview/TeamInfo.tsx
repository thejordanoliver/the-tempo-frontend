import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo } from "constants/teams";
import { Image, StyleSheet, Text, View } from "react-native";
import { Team } from "types/types";

type TeamInfoProps = {
  team?: Team;
  teamName: string;
  score?: number;
  opponentScore?: number;
  record?: string;
  side: "home" | "away";
  timeouts: number;
  bonusState: string | undefined | null;
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
  timeouts,
  bonusState,
}: TeamInfoProps) {
  const styles = teamInfoStyle;

  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isCanceled = gameStatusDescription === "Canceled";
  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "Halftime" ||
    gameStatusDescription === "End of Period";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;
  // --- Winner / opacity logic ---
  const isWinner = isFinal && (score ?? 0) > (opponentScore ?? 0);

  const scoreOpacity =
    !isFinal || isScheduled || isDelayed || isPostponed
      ? 1
      : isWinner
      ? 1
      : 0.4;

  // --- Detect record vs score → dynamic font size ---
  const isRecord = isScheduled || isDelayed || isPostponed;
  const valueFontSize = isRecord ? 24 : 36;

  // --- Value shown ---
  const displayValue = isRecord
    ? record ?? "-"
    : score !== undefined
    ? score
    : "-";

  // Logos (prefer light variants at night)
  const logo = team ? getTeamLogo(team.id, true) : undefined;

  const renderTimeouts = (remaining: number) => {
    const totalTimeouts = 7;
    return (
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        {Array.from({ length: totalTimeouts }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 5,
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

  const isBonus = bonusState === "DOUBLE";

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
          color: Colors.white,
          textAlign: "center",
        }}
      >
        BONUS
      </Text>
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
      {/* ─────────── HOME SCORE (RIGHT) ─────────── */}
      {side === "home" && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              styles.teamValue,
              {
                opacity: scoreOpacity,
                fontSize: valueFontSize, // 🔥 dynamic
              },
            ]}
          >
            {displayValue}
          </Text>
          {renderBonus()}
        </View>
      )}

      {/* ─────────── TEAM LOGO + NAME ─────────── */}
      <View style={styles.teamContainer}>
        <Image source={logo} style={styles.teamLogo} />

        <Text style={styles.teamName}>{teamName}</Text>

        {/* Final only → show record */}
        {!isScheduled && isFinal && record && (
          <Text style={styles.teamRecord}>{record}</Text>
        )}
        {!dontShowDetails || isScheduled && renderTimeouts(timeouts)}
      </View>

      {/* ─────────── AWAY SCORE (LEFT) ─────────── */}
      {side === "away" && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              styles.teamValue,
              {
                opacity: scoreOpacity,
                fontSize: valueFontSize, // 🔥 dynamic
              },
            ]}
          >
            {displayValue}
          </Text>
          {renderBonus()}
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
});
