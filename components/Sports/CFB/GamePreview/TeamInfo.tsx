import FootballLight from "assets/icons8/FootballLight.png";
import { Image, Text, View } from "react-native";
import { TeamInfoStyle } from "styles/ModalsStyles/GamePreviewStyles/TeamInfoStyles";
import { CFBTeam } from "types/cfb";
type TeamInfoProps = {
  team: CFBTeam;
  logo: any;
  name: string;
  rank?: number;
  score: number;
  opponentScore: number;
  record?: string;
  possessionTeamId?: number | null;
  side: "home" | "away";
  timeouts?: number;
  lighter?: boolean;
  gameStatusDescription: string;
};

export default function TeamInfo({
  team,
  logo,
  name,
  score,
  opponentScore,
  record,
  rank,
  gameStatusDescription,
  possessionTeamId,
  side,
  timeouts,
}: TeamInfoProps) {
  const styles = TeamInfoStyle;

  // --------------------------------------------------------------
  // GAME STATE
  // --------------------------------------------------------------
  const isFinal =
    gameStatusDescription === "Final" || gameStatusDescription === "Finished";
  const isScheduled =
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Not Started";

  const isTie = isFinal && score === opponentScore;
  const isWinner = isFinal && !isTie && score > opponentScore;
  const scoreOpacity = !isFinal ? 1 : isTie ? 1 : isWinner ? 1 : 0.5;

  const isRecord = isScheduled;
  const valueFontSize = isRecord ? 22 : 36;
  const displayValue = isScheduled ? (record ?? "-") : (score ?? "-");

  const hasPossession =
    gameStatusDescription && String(possessionTeamId) === String(team?.espnID);

  // --------------------------------------------------------------
  // TIMEOUTS RENDERING
  // --------------------------------------------------------------
  const renderTimeouts = (remaining: number = 0) => {
    const totalTimeouts = 3;

    return (
      <View style={styles.timeoutsWrapper}>
        {Array.from({ length: totalTimeouts }).map((_, i) => (
          <View
            key={i}
            style={[styles.timeoutBar, { opacity: i < remaining ? 1 : 0.3 }]}
          />
        ))}
      </View>
    );
  };

  // --------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------
  return (
    <View
      style={[
        styles.container,
        { justifyContent: side === "home" ? "flex-end" : "flex-start" },
      ]}
    >
      {/* ===== HOME SCORE (LEFT) ===== */}
      {side === "home" && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              styles.teamValue,
              { opacity: scoreOpacity, fontSize: valueFontSize },
            ]}
          >
            {displayValue}
          </Text>
          {hasPossession && (
            <Image source={FootballLight} style={styles.possessionIcon} />
          )}
        </View>
      )}

      {/* ===== TEAM LOGO + NAME ===== */}
      <View style={styles.teamContainer}>
        <Image source={logo} style={styles.teamLogo} />
        <Text style={styles.teamName}>
          {rank != null && <Text style={styles.teamRank}>{rank} </Text>}
          {name}
        </Text>

        {/* Show timeouts only during live */}
        {!isScheduled && !isFinal && renderTimeouts(timeouts)}

        {/* Final: show record */}
        {isFinal && <Text style={styles.teamRecord}>{record}</Text>}
      </View>

      {/* ===== AWAY SCORE (RIGHT) ===== */}
      {side === "away" && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              styles.teamValue,
              { opacity: scoreOpacity, fontSize: valueFontSize },
            ]}
          >
            {displayValue}
          </Text>
          {hasPossession && (
            <Image source={FootballLight} style={styles.possessionIcon} />
          )}
        </View>
      )}
    </View>
  );
}
