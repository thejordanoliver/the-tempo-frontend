import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo } from "constants/teamsCBB";
import { Image, StyleSheet, Text, View } from "react-native";
import { CBBTeam } from "types/types";

type TeamInfoProps = {
  team?: CBBTeam;
  teamName: string;
  score?: number;
  opponentScore?: number;
  record?: string;
  isDark: boolean;
  lighter: boolean;
  isGameOver: boolean;
  isScheduled?: boolean; // scheduled games
  side?: "home" | "away";
  rank?: number;
};

export default function TeamInfo({
  team,
  teamName,
  score,
  opponentScore,
  record,
  rank,
  isDark,
  isGameOver,
  isScheduled = false,
  side,
}: TeamInfoProps) {
  const styles = teamInfoStyle;

  // --- Winner / opacity logic ---
  const isWinner = isGameOver && (score ?? 0) > (opponentScore ?? 0);
  const isTie = isGameOver && score === opponentScore;

  const scoreOpacity =
    !isGameOver || isScheduled ? 1 : isTie ? 1 : isWinner ? 1 : 0.4;

  // --- Detect record vs score → dynamic font size ---
  const isRecord = isScheduled;
  const valueFontSize = isRecord ? 28 : 36;

  // --- Value shown ---
  const displayValue = isRecord
    ? record ?? "-"
    : score !== undefined
    ? score
    : "-";

  // Logos (prefer light variants at night)
  const logo = team ? getTeamLogo(team.id, true) : undefined;
  const showRank = typeof rank === "number" && rank > 0;

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
        </View>
      )}

      {/* ─────────── TEAM LOGO + NAME ─────────── */}
      <View style={styles.teamContainer}>
        <Image source={logo} style={styles.teamLogo} />

        <Text style={styles.teamName}>
{showRank ? (
  <Text style={styles.teamRank}>{rank} </Text>
) : null}
{teamName}
        </Text>

        {/* Final only → show record */}
        {!isScheduled && isGameOver && record && (
          <Text style={styles.teamRecord}>{record}</Text>
        )}
      </View>

      {/* ─────────── AWAY SCORE (LEFT) ─────────── */}
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

  teamRank: { fontSize: 10, color: Colors.lightGray },

  teamLogo: {
    width: 65,
    height: 65,
    resizeMode: "contain",
  },

  // Score stays centered. Icon is absolute (does NOT push score upward)
  scoreWrapper: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    minWidth: 50,
  },

  possessionIcon: {
    position: "absolute",
    bottom: -20, // hangs below, does NOT shift score
    width: 26,
    height: 26,
    resizeMode: "contain",
  },

  teamRecord: {
    fontSize: 12,
    fontFamily: Fonts.OSREGULAR,
    color: Colors.white,
    opacity: 0.7,
  },

  teamValue: {
    fontSize: 32, // dynamically overridden
    fontFamily: Fonts.OSBOLD,
    color: Colors.white,
  },
});
