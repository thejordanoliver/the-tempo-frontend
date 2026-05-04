import { Image, Text, View } from "react-native";
import { TeamInfoStyle } from "styles/ModalsStyles/GamePreviewStyles/TeamInfoStyles";
import { MLBTeam } from "types/baseball";

type TeamInfoProps = {
  team: MLBTeam;
  logo: any;
  name: string;
  score?: number;
  opponentScore?: number;
  record?: string;
  side: "home" | "away";
  gameStatusDescription: string;
};

export default function TeamInfo({
  team,
  logo,
  name,
  score,
  opponentScore,
  record,
  gameStatusDescription,
  side,
}: TeamInfoProps) {
  const styles = TeamInfoStyle;

  /* ================================
     GAME STATUS FLAGS
  ================================= */
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isCanceled = gameStatusDescription === "Canceled";
  const isInactiveGame = isDelayed || isPostponed || isCanceled;
  const isRecordDisplay = isScheduled || isInactiveGame;

  /* ================================
     WINNER / SCORE LOGIC
  ================================= */
  const isWinner = isFinal && (score ?? 0) > (opponentScore ?? 0);
  const scoreOpacity = isFinal && !isWinner ? 0.4 : 1;
  const valueFontSize = isRecordDisplay ? 22 : 36;
  const displayValue = isRecordDisplay ? (record ?? "-") : (score ?? "-");

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
        <ScoreText
          value={displayValue}
          opacity={scoreOpacity}
          fontSize={valueFontSize}
        />
      )}

      {/* TEAM INFO */}
      <View style={styles.teamContainer}>
        <Image source={logo} style={styles.teamLogo} />
        <Text style={styles.teamName}>{name}</Text>

        {isFinal && record && <Text style={styles.teamRecord}>{record}</Text>}
      </View>

      {/* AWAY SCORE */}
      {isAway && (
        <ScoreText
          value={displayValue}
          opacity={scoreOpacity}
          fontSize={valueFontSize}
        />
      )}
    </View>
  );
}
