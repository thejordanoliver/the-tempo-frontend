import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/Styles";
import { Image, StyleSheet, Text, View } from "react-native";
import { MMAFighter } from "types/mma";

type FighterInfoProps = {
  fighter?: MMAFighter;
  headshot: string;
  record?: string;
  side: "home" | "away";
  fighterName: string;
  gameStatusDescription: string;
  isWinner?: boolean;
};

export default function FighterInfo({
  fighter,
  headshot,
  record,
  fighterName,
  gameStatusDescription,
  isWinner,
  side,
}: FighterInfoProps) {
  const styles = teamInfoStyle;

  const isScheduled = gameStatusDescription === "Scheduled";
  const isCanceled = gameStatusDescription === "Canceled";
  const isFinal = gameStatusDescription === "Final";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isEndOfRound = gameStatusDescription === "End of Round";
  const inProgress = gameStatusDescription === "In Progress";
  const inWalkouts = gameStatusDescription === "Walkouts";
  const isIntros = gameStatusDescription === "Intros";
  const dontShowDetails = isDelayed || isCanceled || isPostponed;

  const scoreOpacity =
    !isFinal || isScheduled || isDelayed || isPostponed
      ? 1
      : isWinner
        ? 1
        : 0.4;

  const ScoreText = ({
    record,
    winner,
  }: {
    record: string | undefined;
    winner: boolean | undefined;
  }) => {
    const showRecord =
      isScheduled ||
      inWalkouts ||
      isCanceled ||
      isPostponed ||
      isDelayed ||
      isForfeited;

    const opacity = isFinal && winner === false ? 0.5 : 1;
    if (showRecord) {
      return <Text style={styles.teamRecord}>{record}</Text>;
    }

    if (winner) {
      return (
        <View style={styles.winnerContainer}>
          <Text style={[styles.teamRecord, { opacity }]}>{record}</Text>

          <Ionicons
            size={20}
            name="caret-up"
            color={Colors.white}
            style={{ position: "absolute", bottom: -20 }}
          />
        </View>
      );
    }

    return <Text style={[styles.teamRecord, { opacity }]}>{record}</Text>;
  };

  // --- Detect record vs score → dynamic font size ---
  const isRecord = isScheduled || isDelayed || isPostponed;
  const valueFontSize = isRecord ? 24 : 36;

  // --- Value shown ---
  const displayValue = isRecord ? (record ?? "-") : "-";

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
          {/* Second Fighter Score / Record */}
          <ScoreText record={record ?? "0-0"} winner={isWinner} />
        </View>
      )}

      {/* ─────────── Fighter LOGO + NAME ─────────── */}
      <View style={styles.fighterContainer}>
        <View style={styles.fighterImageContainer}>
          <Image source={{ uri: headshot }} style={styles.fighter} />
        </View>

        <Text style={styles.fighterName}>{fighterName}</Text>
      </View>

      {/* ─────────── AWAY SCORE (LEFT) ─────────── */}
      {side === "away" && (
        <View style={styles.scoreWrapper}>
          <ScoreText record={record ?? "0-0"} winner={isWinner} />
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

  fighterContainer: {
    alignItems: "center",
    gap: 4,
    width: 100,
  },

  fighter: {
    width: 60,
    height: 60,
  },

  fighterImageContainer: {
    width: 60,
    height: 60,
    paddingTop: 2,
    borderWidth: 1,
    alignItems: "center",
    borderRadius: 100,
    borderColor: Colors.lightGray,
    overflow: "hidden",
  },

  fighterName: {
    fontSize: 14,
    fontFamily: Fonts.OSREGULAR,
    color: Colors.white,
  },

  scoreWrapper: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    minWidth: 50,
  },

  winnerContainer: {
    alignItems: "center",
    justifyContent: "center",
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
