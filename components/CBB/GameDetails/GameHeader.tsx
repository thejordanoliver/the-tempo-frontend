import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { TeamRecord } from "hooks/useTeamRecords";
import { StyleSheet, Text, View } from "react-native";
import { GameInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";

type Props = {
  homeTeamData: any;
  awayTeamData: any;
  home: { name: string; record?: string };
  away: { name: string; record?: string };
  rankHome: string;
  rankAway: string;
  homeScore: number;
  awayScore: number;
  homeLogo?: any;
  awayLogo?: any;
  homeFoulsToGive?: number;
  awayFoulsToGive?: number;
  homeTimeouts?: number;
  awayTimeouts?: number;
  period?: string;
  displayClock?: string;
  isDark: boolean;
  formattedDate?: string;
  headlineText?: string;
  time?: string;
  networkString?: string;
  refreshTick?: number;
  homeRecord?: TeamRecord | string;
  awayRecord?: TeamRecord | string;
  halftime?: boolean;
  league?: "cbb" | "wcbb";
  statusText?: string;
  gameStatusDescription: string;
  gameStatusShortDescription: string;
};

export default function GameHeader({
  homeTeamData,
  awayTeamData,
  homeLogo,
  awayLogo,
  headlineText,
  home,
  away,
  rankHome,
  rankAway,
  homeScore,
  homeFoulsToGive,
  awayFoulsToGive,
  awayScore,
  period,
  displayClock,
  isDark,
  formattedDate = "",
  time = "",
  networkString = "",
  refreshTick = 0,
  homeRecord,
  awayRecord,
  halftime,
  gameStatusDescription,
  gameStatusShortDescription,
  league = "cbb",
}: Props) {
  const styles = getStyles(isDark);
  const isWomen = league === "wcbb";

  const awayIsWinner =
    gameStatusDescription === "Final" && (awayScore ?? 0) > (homeScore ?? 0);
  const homeIsWinner =
    gameStatusDescription === "Final" && (homeScore ?? 0) > (awayScore ?? 0);

  return (
    <View style={styles.container}>
      {headlineText ? (
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText} numberOfLines={2}>
            {headlineText}
          </Text>
        </View>
      ) : null}

      <View style={styles.teamsContainer}>
        {/* Away Team Row */}
        <TeamRow
          key={`away-${refreshTick}`}
          team={{
            id: !isWomen ? awayTeamData.id : undefined,
            wid: isWomen ? awayTeamData.wid : undefined,
            code: awayTeamData.code,
            name: away.name,
            record:
              typeof awayRecord === "object"
                ? awayRecord?.overall ?? away.record ?? "0-0"
                : awayRecord || away.record,
            logo:
              awayLogo || require("assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          foulsToGive={awayFoulsToGive}
          rank={rankAway}
          score={awayScore}
          isWinner={awayIsWinner}
          gameStatusDescription={gameStatusDescription}
          league={isWomen ? "wcbb" : league}
        />

        {/* Game Info */}
        <GameInfo
          key={`gameinfo-${refreshTick}`}
          date={formattedDate || new Date().toISOString()}
          time={time}
          clock={halftime ? undefined : displayClock}
          period={period}
          isDark={isDark}
          broadcastNetworks={networkString}
          gameStatusDescription={gameStatusDescription}
          gameStatusShortDescription={gameStatusShortDescription}
        />

        {/* Home Team Row */}
        <TeamRow
          key={`home-${refreshTick}`}
          team={{
            id: !isWomen ? homeTeamData.id : undefined,
            wid: isWomen ? homeTeamData.wid : undefined,
            code: homeTeamData.code,
            name: home.name,
            record:
              typeof homeRecord === "object"
                ? homeRecord?.overall ?? home.record ?? "0-0"
                : homeRecord || home.record,
            logo:
              homeLogo || require("assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          rank={rankHome}
          isHome
          score={homeScore}
          foulsToGive={homeFoulsToGive}
          isWinner={homeIsWinner}
          gameStatusDescription={gameStatusDescription}
          league={isWomen ? "wcbb" : league}
        />
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      backgroundColor: isDark ? Colors.black : Colors.white,
      paddingVertical: 4,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    teamsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    headlineContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    headlineText: {
      position: "absolute",
      width: "100%",
      top: 0,
      fontSize: 10,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSEXTRALIGHT,
      textAlign: "center",
    },
  });
