import FootballLight from "assets/icons8/FootballLight.png";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getNFLTeamsLogo } from "constants/teamsNFL";
import { Image, StyleSheet, Text, View } from "react-native";
import { NFLTeam } from "types/nfl";

type TeamInfoProps = {
  team: NFLTeam;
  teamName: string;
  score: number;
  opponentScore: number;
  record: string;
  isDark: boolean;
  isGameOver: boolean;
  hasStarted: boolean;
  possessionTeamId?: number;
  side: "home" | "away";
  timeouts: number;
};

export default function TeamInfo({
  team,
  teamName,
  score,
  opponentScore,
  record,
  isGameOver,
  hasStarted,
  possessionTeamId,
  side,
  timeouts,
}: TeamInfoProps) {
  const isTie = isGameOver && score === opponentScore;
  const isWinner = isGameOver && !isTie && score > opponentScore;

  const styles = teamInfoStyle;

  const isRecord = !hasStarted;
  const valueFontSize = isRecord ? 28 : 36;

  const scoreOpacity = !isGameOver ? 1 : isTie ? 1 : isWinner ? 1 : 0.5;

  const logo =
    getNFLTeamsLogo(team?.id, true) || getNFLTeamsLogo(team?.id, false);

  const displayValue = !hasStarted ? record ?? "-" : score ?? "-";

const hasPossession =
  hasStarted &&
  possessionTeamId != null &&
  Number(possessionTeamId) === Number(team.id);

  const renderTimeouts = (remaining: number) => {
    const totalTimeouts = 3;
    return (
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        {Array.from({ length: totalTimeouts }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
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

  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: side === "home" ? "flex-end" : "flex-start",
        },
      ]}
    >
      {/* ===== HOME SCORE (LEFT) ===== */}
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

          {hasPossession && (
            <Image source={FootballLight} style={styles.possessionIcon} />
          )}
        </View>
      )}

      {/* ===== TEAM LOGO + NAME ===== */}
      <View style={styles.teamContainer}>
        <Image source={logo} style={styles.teamLogo} />

        <Text
          style={{
            fontSize: 14,
            fontFamily: Fonts.OSREGULAR,
            color: Colors.white,
          }}
        >
          {teamName}
        </Text>

        {/* Show timeouts only during live */}
        {hasStarted && !isGameOver && renderTimeouts(timeouts)}

        {/* Final: show record */}
        {isGameOver && <Text style={styles.teamRecord}>{record}</Text>}
      </View>

      {/* ===== AWAY SCORE (RIGHT) ===== */}
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

          {hasPossession && (
            <Image source={FootballLight} style={styles.possessionIcon} />
          )}
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

