import { Image, Text, View } from "react-native";
import { TeamInfoStyle } from "styles/ModalsStyles/GamePreviewStyles/TeamInfoStyles";

type TeamInfoProps = {
  name: string | undefined;
  rank: number | null | undefined;
  score?: number;
  winner?: boolean;
  record?: string;
  side: "home" | "away";
  gameStatusDescription: string;
  state: string;
  logo: any;
};

export default function TeamInfo({
  name,
  rank,
  score,
  winner,
  record,
  gameStatusDescription,
  state,
  side,
  logo,
}: TeamInfoProps) {
  const styles = TeamInfoStyle;

  /* ================================
     GAME STATUS FLAGS
  ================================= */
  const isFinal = state === "post";
  const isScheduled = state === "pre";
  const isSuspended = gameStatusDescription === "Suspended";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isPostponed = gameStatusDescription === "Postponed";
  const isInactiveGame =
    isDelayed || isPostponed || isCanceled || isSuspended || isForfeited;
  const displayRecord = isScheduled || isInactiveGame;

  const scoreOpacity = displayRecord ? 1 : winner ? 1 : 0.4;

  const valueFontSize = displayRecord ? 22 : 36;

  // --- Value shown ---
  const displayValue = displayRecord
    ? (record ?? "-")
    : score !== undefined
      ? score
      : "-";

  return (
    <View style={styles.container}>
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
