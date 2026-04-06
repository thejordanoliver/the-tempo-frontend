import { Colors, Fonts } from "constants/styles";
import { StyleSheet, Text, View } from "react-native";
import { NBATeam } from "types/types";
import { formatQuarter } from "utils/games";
import { GameInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";

type Props = {
  home: NBATeam | undefined;
  away: NBATeam | undefined;
  rankHome: number | undefined | null;
  rankAway: number | undefined | null;
  homeScore: number;
  awayScore: number;
  homeLogo?: any;
  awayLogo?: any;
  homeTimeouts?: number;
  awayTimeouts?: number;
  period?: number;
  displayClock?: string;
  isDark: boolean;
  formattedDate?: string;
  headlineText?: string;
  time?: string;
  networkString?: string;
  refreshTick?: number;
  homeRecord?: string;
  awayRecord?: string;
  halftime?: boolean;
  statusText?: string;
  gameStatusDescription: string;
  gameStatusShortDescription: string;
};

export default function GameHeader({
  homeLogo,
  awayLogo,
  headlineText,
  home,
  away,
  rankHome,
  rankAway,
  homeScore,
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
}: Props) {
  const styles = getStyles(isDark);

  const awayIsWinner =
    gameStatusDescription === "Final" && awayScore > homeScore;
  const homeIsWinner =
    gameStatusDescription === "Final" && homeScore > awayScore;

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
            id: away?.id,
            code: away?.code,
            name: away?.name,
            record: awayRecord,
            logo:
              awayLogo || require("assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          bonusState={null}
          rank={rankAway}
          score={awayScore}
          isWinner={awayIsWinner}
          gameStatusDescription={gameStatusDescription}
        />

        {/* Game Info */}
        <GameInfo
          key={`gameinfo-${refreshTick}`}
          date={formattedDate || new Date().toISOString()}
          time={time}
          clock={halftime ? undefined : displayClock}
          period={formatQuarter(period)}
          isDark={isDark}
          broadcastNetworks={networkString}
          gameStatusDescription={gameStatusDescription}
          gameStatusShortDescription={gameStatusShortDescription}
        />

        {/* Home Team Row */}
        <TeamRow
          key={`home-${refreshTick}`}
          team={{
            id: home?.id,
            code: home?.code,
            name: home?.name,
            record: homeRecord,
            logo:
              homeLogo || require("assets/Placeholders/teamPlaceholder.png"),
          }}
          isDark={isDark}
          bonusState={null}
          rank={rankHome}
          isHome
          score={homeScore}
          isWinner={homeIsWinner}
          gameStatusDescription={gameStatusDescription}
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
