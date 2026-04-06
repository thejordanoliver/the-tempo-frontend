import { Image, Text, View } from "react-native";
import { TeamInfoStyle } from "styles/ModalsStyles/GamePreviewStyles/TeamInfoStyles";
import { NBATeam } from "types/types";
type TeamInfoProps = {
  team?: NBATeam;
  logo: any;
  name: string | undefined;
  score?: number;
  opponentScore?: number;
  record: string;
  gameStatusDescription: string;
  side?: "home" | "away";
  rank?: number;
};

export default function TeamInfo({
  team,
  name,
  logo,
  score,
  opponentScore,
  record,
  rank,
  gameStatusDescription,
  side,
}: TeamInfoProps) {
  const styles = TeamInfoStyle;

  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "Halftime" ||
    gameStatusDescription === "End of Period";

  // --- Winner / opacity logic ---
  const isWinner = isFinal && (score ?? 0) > (opponentScore ?? 0);
  const isTie = isFinal && score === opponentScore;

  const scoreOpacity =
    !isFinal || isScheduled ? 1 : isTie ? 1 : isWinner ? 1 : 0.4;

  // --- Detect record vs score → dynamic font size ---
  const isRecord = isScheduled || isDelayed || isPostponed;
  const valueFontSize = isRecord ? 22 : 36;
  const showRank = rank !== undefined && rank !== null;
  // --- Value shown ---
  const displayValue = isRecord
    ? (record ?? "-")
    : score !== undefined
      ? score
      : "-";

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
          {showRank ? <Text style={styles.teamRank}>{rank} </Text> : null}
          {name}
        </Text>

        {/* Final only → show record */}
        {!isScheduled && isFinal && record && (
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
