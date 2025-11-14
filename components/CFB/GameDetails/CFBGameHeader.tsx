import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo, getTeamName } from "constants/teamsCFB";
import { StyleSheet, Text, View } from "react-native";
import { CFBTeamRow } from "./CFBTeamRow";
import { CFBGameCenterInfo } from "./GameInfo";

type Props = {
  awayTeam: any;
  homeTeam: any;
  rankHome: string;
  rankAway: string;
  scores: any;
  possessionTeamId?: string;
  homeTimeouts?: number;
  awayTimeouts?: number;
  colors: any;
  status: string;
  period?: string;
  displayClock?: string;
  downAndDistance?: string;
  isDark: boolean;
  homeRecord?: string;
  awayRecord?: string;
  formattedDate?: string; // ✅ new props
  formattedTime?: string; // ✅ new props
  networkString?: string;
  headlineText?: string;
};

export default function CFBGameHeader({
  awayTeam,
  homeTeam,
  rankHome,
  rankAway,
  scores,
  possessionTeamId,
  homeTimeouts = 0,
  awayTimeouts = 0,
  colors,
  status,
  period,
  displayClock,
  downAndDistance,
  isDark,
  homeRecord,
  awayRecord,
  networkString = "",
  headlineText,
  formattedDate = "", // default
  formattedTime = "", // default
}: Props) {
  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={[styles.teamsContainer, { borderColor: colors.border }]}>
        <CFBTeamRow
          team={{
            id: String(awayTeam.id),
            espnID: String(awayTeam.espnID),
            shortName: awayTeam.code,
            name:
              getTeamName(awayTeam.id, awayTeam.nickname) ||
              awayTeam.nickname ||
              "Away",
            logo: getTeamLogo(awayTeam.id, isDark),
            record: awayRecord ?? "0-0",
          }}
          rank={rankAway}
          isDark={isDark}
          isHome={false}
          score={scores?.away?.total}
          opponentScore={scores?.home?.total}
          isWinner={scores?.away?.total > scores?.home?.total}
          colors={colors}
          status={status}
          possessionTeamId={possessionTeamId}
          timeouts={awayTimeouts}
        />

        <View>
          {/* Headline (optional) */}
          {headlineText ? (
            <View style={styles.headlineContainer}>
              <Text style={styles.headlineText} numberOfLines={1}>
                {headlineText}
              </Text>
            </View>
          ) : null}
          <CFBGameCenterInfo
            status={status}
            date={formattedDate} // ✅ pass formatted date
            time={formattedTime} // ✅ pass formatted time
            period={period}
            clock={displayClock}
            colors={colors}
            isDark={isDark}
            playoffInfo=""
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            downAndDistance={downAndDistance}
            broadcastNetworks={networkString}
          />
        </View>
        <CFBTeamRow
          team={{
            id: String(homeTeam.id),
            espnID: String(homeTeam.espnID),
            shortName: homeTeam.code,
            name:
              getTeamName(homeTeam.id, homeTeam.nickname) ||
              homeTeam.nickname ||
              "Home",
            logo: getTeamLogo(homeTeam.id, isDark),
            record: homeRecord ?? "0-0",
          }}
          rank={rankHome}
          isDark={isDark}
          isHome
          score={scores?.home?.total}
          opponentScore={scores?.away?.total}
          isWinner={scores?.home?.total > scores?.away?.total}
          colors={colors}
          status={status}
          possessionTeamId={possessionTeamId}
          timeouts={homeTimeouts}
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
      paddingVertical: 8,
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
      width: 200,
     top: -20,
      fontSize: 10,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSEXTRALIGHT,
      textAlign: "center",
    },
  });
