import { Colors } from "constants/Styles";
import { Image, Text, View } from "react-native";
import { TeamInfoStyle } from "styles/ModalsStyles/GamePreviewStyles/TeamInfoStyles";
import { Team } from "types/types";
type TeamInfoProps = {
  team?: Team;
  name: string;
  score?: number;
  opponentScore?: number;
  record?: string;
  side: "home" | "away";
  timeouts: number;
  bonusState: string | undefined | null;
  gameStatusDescription: string;
  logo: any;
};

export default function TeamInfo({
  team,
  name,
  score,
  opponentScore,
  record,
  gameStatusDescription,
  side,
  timeouts,
  bonusState,
  logo,
}: TeamInfoProps) {
  const styles = TeamInfoStyle;

  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isCanceled = gameStatusDescription === "Canceled";
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
  const valueFontSize = isRecord ? 22 : 36;

  // --- Value shown ---
  const displayValue = isRecord
    ? (record ?? "-")
    : score !== undefined
      ? score
      : "-";

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

    return <Text style={styles.bonus}>BONUS</Text>;
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

        <Text style={styles.teamName}>{name}</Text>

        {/* Final only → show record */}
        {!isScheduled && isFinal && record && (
          <Text style={styles.teamRecord}>{record}</Text>
        )}
        {!dontShowDetails || (isScheduled && renderTimeouts(timeouts))}
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
