import { BracketGame, BracketTeam } from "@/types/football/football";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors, Fonts } from "constants/styles";
import { getCFBTeamLogo, getTeamByESPNId } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { Image, StyleSheet, Text, View } from "react-native";

export function GameCard({
  game,
  round,
}: {
  game: BracketGame;
  round: string;
}) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
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
    const teamId = getTeamByESPNId(team.id);
    const teamLogo = getCFBTeamLogo(teamId.id ?? 0, isDark);

    const recordScore = showScore ? (
      <Text
        style={[
          styles.score,
          {
            color: !dimmed
              ? Colors.black
              : isDark
                ? Colors.white
                : Colors.black,
          },
        ]}
      >
        {team.score}
      </Text>
    ) : (
      <Text style={styles.record}>{team.record}</Text>
    );

    return (
      <View style={styles.teamRow}>
        {team.seed && <Text style={styles.seedText}>{team.seed}</Text>}
        <Image source={teamLogo} style={styles.teamLogo} />
        <Text style={[styles.teamCode, { opacity: dimmed ? 0.5 : 1 }]}>
          {team.code}
        </Text>
        <View
          style={[
            styles.winsBadge,
            {
              backgroundColor: !dimmed
                ? Colors.light.gold
                : isDark
                  ? Colors.darkGray
                  : Colors.lightGray,
            },
          ]}
        >
          {recordScore}
        </View>
      </View>
    );
  };

  const renderTeam = (team: BracketTeam | null, dimmed = false) => {
    if (team) return renderTeamRow(team, dimmed);

    if (isFirstRound) return null;

    return (
      <View style={styles.teamRow}>
        <View style={styles.teamWrapper}>
          <Text style={styles.seedText}>-</Text>
          <Image source={PlaceholderLogo} style={styles.teamLogo} />
          <Text style={styles.teamCode}>TBD</Text>
        </View>
        <View style={styles.winsBadge}>
          <Text style={styles.record}>-</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {renderTeam(game.top, losingSide === "top")}
      <View style={styles.divider} />
      {renderTeam(game.bottom, losingSide === "bottom")}

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
      width: 176,
      height: 142,
      justifyContent: "space-around",
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,

      shadowColor: "#000",
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingHorizontal: 12,
    },
    teamContainer: {
      justifyContent: "center",
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    gameInfo: {
      alignItems: "center",
    },
    teamWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 8,
      backgroundColor: Colors.midTone,
    },
    seedText: {
      width: 20,
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
    teamCode: {
      flex: 1,
      marginLeft: 4,
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
    },
    winsBadge: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: 100,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
    },
    score: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    record: {
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    teamLogo: {
      width: 34,
      height: 34,
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
