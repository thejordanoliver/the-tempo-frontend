import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors, Fonts } from "constants/Styles";
import { getTeamLogoESPN } from "constants/teamsCFB";
import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";
import { BracketGame, BracketTeam } from "types/cfb";

export function GameCard({
  game,
  round,
}: {
  game: BracketGame;
  round: string;
}) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const isFirstRound = round === "First Round";

  const formattedTime = game.startTime
    ? new Date(game.startTime).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  const formattedDate = game.startTime
    ? new Date(game.startTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const showRecord = game.status === "scheduled";
  const showScore = !showRecord;
  const isFinal = game.status === "final";
  const broadcasts = game.broadcasts ?? [];
  const broadcast = broadcasts?.length > 0 && (
    <Text style={styles.infoText}>
      {game.broadcasts?.map((b) => b.name).join(" • ")}
    </Text>
  );

  const topScore = game.top?.score != null ? Number(game.top.score) : null;

  const bottomScore =
    game.bottom?.score != null ? Number(game.bottom.score) : null;

  const losingSide =
    showScore && topScore != null && bottomScore != null
      ? topScore > bottomScore
        ? "bottom"
        : bottomScore > topScore
          ? "top"
          : null // tie
      : null;

  const renderTeamRow = (team: BracketTeam, dimmed = false) => {
    const recordScore = showScore ? (
      <Text style={styles.score}>{team.score}</Text>
    ) : (
      <Text style={styles.record}>{team.record}</Text>
    );

    return (
      <View style={[styles.teamRow, dimmed && { opacity: 0.5 }]}>
        <View style={styles.teamWrapper}>
          {team.seed && <Text style={styles.seed}>{team.seed}</Text>}
          <Image
            source={getTeamLogoESPN(team.espnID ?? "0", isDark)}
            style={styles.logo}
          />
          <View>
            <Text style={styles.name}>{team.code}</Text>
          </View>
        </View>
        {recordScore}
      </View>
    );
  };

  const renderTeam = (team: BracketTeam | null, dimmed = false) => {
    if (team) return renderTeamRow(team, dimmed);

    if (isFirstRound) return null;

    return (
      <View style={styles.teamRow}>
        <View style={styles.teamWrapper}>
          <Text style={styles.seed}>-</Text>
          <Image source={PlaceholderLogo} style={styles.logo} />
          <Text style={styles.name}>TBD</Text>
        </View>
        <Text style={styles.record}>-</Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.teamContainer}>
        {renderTeam(game.top, losingSide === "top")}
        {renderTeam(game.bottom, losingSide === "bottom")}
      </View>
      <View style={styles.gameInfo}>
        {isFinal && <Text style={styles.finalText}>Final</Text>}
        {!isFinal && <Text style={styles.infoText}>{formattedDate}</Text>}
        {!isFinal && <Text style={styles.infoText}>{formattedTime}</Text>}
        {!isFinal && <Text style={styles.infoText}>{broadcast}</Text>}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      width: 220,
      height: 100,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      marginVertical: 12,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    teamContainer: {
      alignItems: "flex-start",
      justifyContent: "space-between",
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
      borderRightWidth: StyleSheet.hairlineWidth,
      gap: 12,
      width: "75%",
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      width: "95%",
      justifyContent: "space-between",
    },
    gameInfo: {
      alignItems: "center",
      width: "25%",
    },
    teamWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    seed: {
      width: 18,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
      marginLeft: 4,
    },
    name: {
      fontSize: 15,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    score: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    record: {
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    logo: {
      width: 22,
      height: 22,
      marginLeft: 4,
      marginRight: 4,
    },
    infoText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 10,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
  });
