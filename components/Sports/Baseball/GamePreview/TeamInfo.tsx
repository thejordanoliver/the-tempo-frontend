import { Image, ImageSourcePropType, Text, View } from "react-native";
import { TeamInfoStyle } from "styles/ModalsStyles/GamePreviewStyles/TeamInfoStyles";

type TeamInfoProps = {
  logo: ImageSourcePropType;
  side: "home" | "away";
  name: string | undefined;
  rank: number;
  score?: number;
  winner?: boolean;
  record?: string;
  gameStatusDescription: string;
  state: string;
};

export default function TeamInfo({
  logo,
  name,
  state,
  rank,
  score,
  winner,
  record,
  gameStatusDescription,
  side,
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

  /* ================================
     WINNER / SCORE LOGIC
  ================================= */

  const scoreOpacity = isFinal && !winner ? 0.4 : 1;
  const valueFontSize = displayRecord ? 22 : 36;
  const displayValue = displayRecord ? (record ?? "-") : (score ?? "-");

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
    <View style={styles.container}>
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
        <Text style={styles.teamName}>
          {rank && <Text style={styles.teamRank}>{rank}</Text>} {name}
        </Text>

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
