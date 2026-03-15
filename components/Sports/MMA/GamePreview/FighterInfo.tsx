import { Image, Text, View } from "react-native";
import { TeamInfoStyle } from "styles/ModalsStyles/GamePreviewStyles/TeamInfoStyles";
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
  const styles = TeamInfoStyle;

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
  const isInactiveGame = isDelayed || isPostponed || isCanceled;
  const isRecordDisplay = isScheduled || isInactiveGame;

  /* ================================
     WINNER / SCORE LOGIC
  ================================= */
  const scoreOpacity = isFinal && !isWinner ? 0.4 : 1;
  const valueFontSize = isRecordDisplay ? 22 : 36;
  const displayValue = isRecordDisplay ? (record ?? "-") : (record ?? "-");

  const ScoreText = ({
    value,
    opacity,
    fontSize,
  }: {
    value: string | number;
    opacity: number;
    fontSize: number;
  }) => {
    const styles = TeamInfoStyle;

    return (
      <View style={styles.scoreWrapper}>
        <Text style={[styles.teamValue, { opacity, fontSize }]}>{value}</Text>
      </View>
    );
  };

  // --- Detect record vs score → dynamic font size ---
  const isRecord = isScheduled || isDelayed || isPostponed;

  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: side === "home" ? "flex-end" : "flex-start",
        },
      ]}
    >
      {/* HOME SCORE */}
      {side === "home" && (
        <ScoreText
          value={displayValue}
          opacity={scoreOpacity}
          fontSize={valueFontSize}
        />
      )}

      {/* ─────────── Fighter LOGO + NAME ─────────── */}
      <View style={styles.fighterContainer}>
        <View style={styles.fighterImageContainer}>
          <Image source={{ uri: headshot }} style={styles.fighter} />
        </View>

        <Text style={styles.fighterName} numberOfLines={1} ellipsizeMode="tail">
          {fighterName}
        </Text>
      </View>

      {/* ─────────── AWAY SCORE (LEFT) ─────────── */}
      {side === "away" && (
        <ScoreText
          value={displayValue}
          opacity={scoreOpacity}
          fontSize={valueFontSize}
        />
      )}
    </View>
  );
}
