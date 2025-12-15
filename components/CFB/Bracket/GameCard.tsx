import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
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
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const showRecord = game.status === "scheduled";
  const showScore = !showRecord;
  const broadcasts = game.broadcasts ?? [];
  const broadcast = broadcasts?.length > 0 && (
    <Text style={styles.infoText}>
      {game.broadcasts?.map((b) => b.name).join(" • ")}
    </Text>
  );

  const renderTeamRow = (team: BracketTeam) => {
    const recordScore = showScore ? (
      <Text style={styles.name}>{team.score}</Text>
    ) : (
      <Text style={styles.record}>{team.record}</Text>
    );

    return (
      <View style={styles.teamRow}>
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

  const renderTeam = (team: BracketTeam | null) => {
    if (team) return renderTeamRow(team);

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
      {renderTeam(game.top)}
      {renderTeam(game.bottom)}
      <View style={styles.gameInfo}>
        <Text style={styles.infoText}>{formattedTime}</Text>
        {broadcast}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      width: 220,
      paddingHorizontal: 12,
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
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 6,
    },
    gameInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    teamWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    seed: {
      width: 26,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    name: {
      fontSize: 15,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    record: {
      fontSize: 11,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    logo: {
      width: 22,
      height: 22,
      marginHorizontal: 6,
    },
    infoText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginTop: 6,
    },
  });
