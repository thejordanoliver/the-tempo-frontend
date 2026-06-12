import { Image, Text, View } from "react-native";
import { TeamInfoStyle } from "styles/ModalsStyles/GamePreviewStyles/TeamInfoStyles";

type TeamInfoProps = {
  name: string | undefined;
  rank: number | null | undefined;
  score?: number;
  opponentScore?: number;
  record?: string;
  side: "home" | "away";
  gameStatusDescription: string;
  logo: any;
};

export default function TeamInfo({
  name,
  rank,
  score,
  opponentScore,
  record,
  gameStatusDescription,
  side,
  logo,
}: TeamInfoProps) {
  const styles = TeamInfoStyle;

  const isFinal = gameStatusDescription === "Full Time";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isSuspended = gameStatusDescription === "Suspended";

  const isWinner = isFinal && (score ?? 0) > (opponentScore ?? 0);

  const scoreOpacity =
    !isFinal || isScheduled || isDelayed || isPostponed
      ? 1
      : isWinner
        ? 1
        : 0.4;

  // --- Detect record vs score → dynamic font size ---
  const isRecord =
    isScheduled ||
    isDelayed ||
    isPostponed ||
    isForfeited ||
    isCanceled ||
    isSuspended;
  const valueFontSize = isRecord ? 22 : 36;

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
                fontSize: valueFontSize,
              },
            ]}
          >
            {displayValue}
          </Text>
        </View>
      )}

      {/* ─────────── TEAM LOGO + NAME ─────────── */}
      <View style={styles.teamContainer}>
        <Image
          source={typeof logo === "string" ? { uri: logo } : logo}
          style={styles.teamLogo}
        />

        <Text style={styles.teamName}>
          {rank && <Text style={styles.teamRank}>{rank} </Text>}
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
